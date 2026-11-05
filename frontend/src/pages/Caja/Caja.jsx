import { useCallback, useEffect, useRef, useState } from "react";
import { TriangleAlert, User } from "lucide-react";
import { getProductos } from "../../service/product.service";
import { getCajaAbierta } from "../../service/caja.service";
import { showError, showWarning } from "../../utils/alerts";
import { Button } from "@/components/ui/button";
import { CajeroTable } from "@/components/CajeroTable";
import CalculadoraCambio from "@/components/CalculadoraCambio";
import AbrirCajaModal from "@/components/AbrirCajaModal";
import CerrarCajaModal from "@/components/CerrarCajaModal";

const CARRITO_STORAGE_KEY = "kiosco_carrito_caja";

// MySQL devuelve los DECIMAL como string, por eso se convierte a número
const formatoPrecio = (valor) =>
  `$${Number(valor).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const leerCarritoGuardado = () => {
  try {
    const guardado = localStorage.getItem(CARRITO_STORAGE_KEY);
    if (!guardado) return [];
    const parseado = JSON.parse(guardado);
    return Array.isArray(parseado) ? parseado : [];
  } catch {
    return [];
  }
};

export default function Caja() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState(leerCarritoGuardado);
  const [codigo, setCodigo] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [modalCalculadoraOpen, setModalCalculadoraOpen] = useState(false);
  const [caja, setCaja] = useState(null);
  const [esPropietario, setEsPropietario] = useState(false);
  const [cargandoCaja, setCargandoCaja] = useState(true);
  const [modalAbrirOpen, setModalAbrirOpen] = useState(false);
  const [modalCerrarOpen, setModalCerrarOpen] = useState(false);
  const inputRef = useRef(null);
  const buscadorWrapperRef = useRef(null);

  // Persiste el carrito para no perder los productos al cambiar de pestaña en el menú
  useEffect(() => {
    try {
      localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(carrito));
    } catch {
      // Ignorar errores de almacenamiento
    }
  }, [carrito]);

  // Cierra el desplegable de sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        buscadorWrapperRef.current &&
        !buscadorWrapperRef.current.contains(e.target)
      ) {
        setMostrarSugerencias(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cargarProductos = useCallback(async () => {
    try {
      const data = await getProductos();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(
        error.status ? error.message : "Error de conexión con el servidor"
      );
    }
  }, []);

  const cargarCaja = useCallback(async () => {
    try {
      const data = await getCajaAbierta();
      setCaja(data.caja);
      setEsPropietario(data.esPropietario);
    } catch (error) {
      showError(
        error.status ? error.message : "Error de conexión con el servidor"
      );
    } finally {
      setCargandoCaja(false);
    }
  }, []);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const data = await getProductos();
        if (activo) {
          const lista = Array.isArray(data) ? data : [];
          setProductos(lista);

          // Sincroniza stock y precios actuales de los ítems que ya estaban en el carrito
          setCarrito((prev) =>
            prev
              .map((item) => {
                const actualizado = lista.find(
                  (p) => p.idProducto === item.idProducto
                );
                if (!actualizado) return item;
                return {
                  ...item,
                  nombre: actualizado.nombre,
                  codigoBarras: actualizado.codigoBarras,
                  precioVenta: Number(actualizado.precioVenta),
                  stock: actualizado.stock,
                };
              })
              .filter((item) => item.stock > 0)
          );
        }
      } catch (error) {
        if (activo) {
          showError(
            error.status ? error.message : "Error de conexión con el servidor"
          );
        }
      }

      try {
        const data = await getCajaAbierta();
        if (!activo) return;
        setCaja(data.caja);
        setEsPropietario(data.esPropietario);
      } catch (error) {
        if (activo) {
          showError(
            error.status ? error.message : "Error de conexión con el servidor"
          );
        }
      } finally {
        if (activo) setCargandoCaja(false);
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  const enfocar = () => inputRef.current?.focus();

  // Suma una unidad del producto, validando el stock (el backend lo validará de nuevo al cobrar)
  const agregar = (producto) => {
    if (!caja) {
      showWarning("Primero tenés que abrir la caja.");
      return;
    }

    const existente = carrito.find((i) => i.idProducto === producto.idProducto);
    const cantidadNueva = (existente?.cantidad ?? 0) + 1;

    if (cantidadNueva > producto.stock) {
      showWarning(`Solo quedan ${producto.stock} unidades de ${producto.nombre}.`);
      return;
    }

    if (existente) {
      setCarrito(
        carrito.map((i) =>
          i.idProducto === producto.idProducto
            ? { ...i, cantidad: cantidadNueva }
            : i
        )
      );
    } else {
      setCarrito([
        ...carrito,
        {
          idProducto: producto.idProducto,
          codigoBarras: producto.codigoBarras,
          nombre: producto.nombre,
          precioVenta: Number(producto.precioVenta),
          stock: producto.stock,
          cantidad: 1,
        },
      ]);
    }
  };

  const cambiarCantidad = (idProducto, delta) => {
    const item = carrito.find((i) => i.idProducto === idProducto);
    if (!item) return;

    const nueva = item.cantidad + delta;

    if (nueva <= 0) {
      setCarrito(carrito.filter((i) => i.idProducto !== idProducto));
    } else if (nueva > item.stock) {
      showWarning(`Solo quedan ${item.stock} unidades de ${item.nombre}.`);
    } else {
      setCarrito(
        carrito.map((i) =>
          i.idProducto === idProducto ? { ...i, cantidad: nueva } : i
        )
      );
    }
    enfocar();
  };

  // Productos sugeridos mientras escribe nombre o código
  const terminoBusqueda = codigo.trim().toLowerCase();
  const sugerencias = terminoBusqueda
    ? productos
        .filter(
          (p) =>
            String(p.codigoBarras ?? "")
              .toLowerCase()
              .includes(terminoBusqueda) ||
            String(p.nombre ?? "")
              .toLowerCase()
              .includes(terminoBusqueda)
        )
        .slice(0, 6)
    : [];

  const handleSeleccionarSugerencia = (producto) => {
    agregar(producto);
    setCodigo("");
    setMostrarSugerencias(false);
    enfocar();
  };

  const handleEscaneo = (e) => {
    e.preventDefault();

    if (!caja) {
      showWarning("Primero tenés que abrir la caja.");
      return;
    }

    const valor = codigo.trim();
    if (!valor) return;

    // 1. Busca coincidencia exacta por código de barras
    let producto = productos.find((p) => String(p.codigoBarras) === valor);

    // 2. Si no es código exacto y hay una única coincidencia en sugerencias, la agrega
    if (!producto && sugerencias.length === 1) {
      producto = sugerencias[0];
    }

    if (!producto) {
      showWarning(`No existe un producto con el código "${valor}".`);
    } else {
      agregar(producto);
    }

    setCodigo("");
    setMostrarSugerencias(false);
    enfocar();
  };

  const total = carrito.reduce((acc, i) => acc + i.precioVenta * i.cantidad, 0);

  const limpiarCaja = () => {
    setCarrito([]);
    localStorage.removeItem(CARRITO_STORAGE_KEY);
    setCodigo("");
    setMostrarSugerencias(false);
    enfocar();
  };

  const abrirCalculadora = () => {
    if (!caja) {
      showWarning("Primero tenés que abrir la caja.");
      return;
    }

    if (carrito.length === 0) {
      showWarning("Agregá productos antes de calcular el cambio.");
      return;
    }
    setModalCalculadoraOpen(true);
  };

  const handleVentaExitosa = async () => {
    setCarrito([]);
    localStorage.removeItem(CARRITO_STORAGE_KEY);
    setCodigo("");
    await Promise.all([cargarProductos(), cargarCaja()]);
    enfocar();
  };

  const handleCajaAbierta = async () => {
    await cargarCaja();
    enfocar();
  };

  const handleCajaCerrada = async () => {
    setCarrito([]);
    localStorage.removeItem(CARRITO_STORAGE_KEY);
    setCodigo("");
    await cargarCaja();
    enfocar();
  };

  return (
    <div className="flex flex-1 flex-col w-full min-h-0 overflow-hidden">
      <div className="mb-6 flex shrink-0 items-start justify-between gap-4 max-h-12">
        <div className=" flex flex-row h-full w-full">
          <User
            strokeWidth={1.5}
            className="size-12 p-2 border border-border rounded-lg bg-card shrink-0"
          />
          <div className="px-2">
              <div className="text-lg font-semibold">Caja</div>
              <div className="text-muted-foreground">
                {caja
                  ? `Abierta por ${caja.username}`
                  : "Lista productos agregados"}
              </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {caja ? (
            <Button
              variant="destructive"
              type="button"
              onClick={() => setModalCerrarOpen(true)}
              disabled={!esPropietario}
              title={
                esPropietario
                  ? "Cerrar la caja actual"
                  : `Solo ${caja.username} puede cerrar esta caja`
              }
              className="h-full"
            >
              Cerrar Caja
            </Button>
          ) : (
            <Button
              variant="accent"
              type="button"
              onClick={() => setModalAbrirOpen(true)}
              disabled={cargandoCaja}
              className="h-full"
            >
              Abrir Caja
            </Button>
          )}
          <Button
            variant="accent"
            type="button"
            onClick={limpiarCaja}
            className="h-full"
          >
            Limpiar Caja
          </Button>
        </div>
      </div>

      {!cargandoCaja && !caja && (
        <div className="mb-4 flex shrink-0 items-center gap-2 rounded-md border border-amber-500/50 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-700">
          <TriangleAlert className="size-4 shrink-0" />
          No hay una caja abierta. Abrí la caja para comenzar a vender.
        </div>
      )}

      {caja && !esPropietario && (
        <div className="mb-4 flex shrink-0 items-center gap-2 rounded-md border border-border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
          <TriangleAlert className="size-4 shrink-0" />
          La caja fue abierta por {caja.username}. Solo esa persona puede
          cerrarla.
        </div>
      )}

      <div ref={buscadorWrapperRef} className="relative mb-4 shrink-0 w-1/3 min-w-80">
        <form onSubmit={handleEscaneo}>
          <input
            ref={inputRef}
            type="text"
            autoFocus
            disabled={!caja}
            value={codigo}
            onFocus={() => setMostrarSugerencias(true)}
            onChange={(e) => {
              setCodigo(e.target.value);
              setMostrarSugerencias(true);
            }}
            placeholder={
              caja
                ? "Escaneá el código o buscá por nombre de producto..."
                : "Abrí la caja para comenzar a vender..."
            }
            className="w-full rounded-md border border-border bg-input px-4 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </form>

        {caja && mostrarSugerencias && sugerencias.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
            {sugerencias.map((prod) => (
              <button
                key={prod.idProducto}
                type="button"
                onClick={() => handleSeleccionarSugerencia(prod)}
                className="flex w-full items-center justify-between gap-3 border-b border-border/50 px-3 py-2 text-left text-sm hover:bg-muted/60 last:border-b-0 cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {prod.nombre}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    Código: {prod.codigoBarras} · Stock: {prod.stock} u.
                  </div>
                </div>
                <span className="shrink-0 font-semibold text-accent">
                  {formatoPrecio(prod.precioVenta)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <CajeroTable
        carrito={carrito}
        cambiarCantidad={cambiarCantidad}
        formatoPrecio={formatoPrecio}
      />

      <div className="mt-4 shrink-0 flex gap-4">
        <div className="flex flex-1 items-center justify-between rounded-md border bg-card px-4 max-h-10 h-full">
          <span className="text-sm">Total a Pagar</span>
          <span className="text-2xl font-semibold">{formatoPrecio(total)}</span>
        </div>
        <Button
          variant="accent"
          type="button"
          onClick={abrirCalculadora}
          disabled={!caja}
          className="rounded-md bg-accent px-5 text-sm font-medium text-white hover:accent/85 h-10"
        >
          Calcular Cambio
        </Button>
      </div>

      <CalculadoraCambio
        open={modalCalculadoraOpen}
        onOpenChange={(abierto) => {
          setModalCalculadoraOpen(abierto);
          if (!abierto) {
            enfocar();
          }
        }}
        total={total}
        carrito={carrito}
        formatoPrecio={formatoPrecio}
        onExito={handleVentaExitosa}
      />

      <AbrirCajaModal
        open={modalAbrirOpen}
        onOpenChange={setModalAbrirOpen}
        onSuccess={handleCajaAbierta}
        formatoPrecio={formatoPrecio}
      />

      <CerrarCajaModal
        open={modalCerrarOpen}
        onOpenChange={setModalCerrarOpen}
        caja={caja}
        onSuccess={handleCajaCerrada}
        formatoPrecio={formatoPrecio}
      />
    </div>
  );
}
