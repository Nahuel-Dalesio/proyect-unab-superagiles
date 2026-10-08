import { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { User } from "lucide-react";
import { getProductos } from "../../service/product.service";
import { showError, showWarning } from "../../utils/alerts";
import { Button } from "@/components/ui/button";
import { CajeroTable } from "@/components/CajeroTable";

// MySQL devuelve los DECIMAL como string, por eso se convierte a número
const formatoPrecio = (valor) =>
  `$${Number(valor).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function Caja() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [codigo, setCodigo] = useState("");
  const inputRef = useRef(null);

  

  const cargarProductos = useCallback(async () => {
    try {
      setProductos(await getProductos());
    } catch (error) {
      showError(
        error.status ? error.message : "Error de conexión con el servidor"
      );
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const enfocar = () => inputRef.current?.focus();

  // Suma una unidad del producto, validando el stock (el backend lo validará de nuevo al cobrar)
  const agregar = (producto) => {
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

  const handleEscaneo = (e) => {
    e.preventDefault();
    const valor = codigo.trim();
    if (!valor) return;

    const producto = productos.find((p) => String(p.codigoBarras) === valor);

    if (!producto) {
      showWarning(`No existe un producto con el código ${valor}.`);
    } else {
      agregar(producto);
    }

    setCodigo("");
    enfocar();
  };

  const total = carrito.reduce((acc, i) => acc + i.precioVenta * i.cantidad, 0);

  const limpiarCaja = () => {
    setCarrito([]);
    setCodigo("");
    enfocar();
  };

  const calcularCambio = async () => {
    if (carrito.length === 0) {
      showWarning("Agregá productos antes de calcular el cambio.");
      return;
    }

    const { value, isConfirmed } = await Swal.fire({
      title: "Calcular cambio",
      html: `Total a pagar: <b>${formatoPrecio(total)}</b>`,
      input: "number",
      inputLabel: "Monto recibido",
      inputAttributes: { min: 0, step: "0.01" },
      showCancelButton: true,
      confirmButtonText: "Calcular",
      cancelButtonText: "Cancelar",
    });

    if (!isConfirmed) {
      enfocar();
      return;
    }

    const cambio = Number(value) - total;

    if (cambio < 0) {
      await Swal.fire(
        "Falta dinero",
        `Faltan ${formatoPrecio(Math.abs(cambio))}`,
        "warning"
      );
    } else {
      await Swal.fire("Cambio", `Devolver ${formatoPrecio(cambio)}`, "success");
    }
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
              <div className="text-muted-foreground">Lista productos agregados</div>
          </div>
        </div>
        <Button
          variant="accent"
          type="button"
          onClick={limpiarCaja}
          className="h-full"
        >
          Limpiar Caja
        </Button>
      </div>

      <form onSubmit={handleEscaneo} className="mb-4 shrink-0">
        <input
          ref={inputRef}
          type="text"
          autoFocus
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Escaneá o escribí el código de barras y apretá Enter..."
          className="w-1/4 rounded-md border bg-card px-4 py-2.5 text-sm outline-none"
        />
      </form>

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
          onClick={calcularCambio}
          className="rounded-md bg-accent px-5 text-sm font-medium text-white hover:accent/85 h-10"
        >
          Calcular Cambio
        </Button>
      </div>
    </div>
  );
}