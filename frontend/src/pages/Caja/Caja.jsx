import { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { Minus, Plus } from "lucide-react";
import { getProductos } from "../../service/product.service";
import { showError, showWarning } from "../../utils/alerts";

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
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Caja</h1>
          <p className="text-sm text-muted-foreground">
            Escaneá los productos o sumalos a mano
          </p>
        </div>
        <button
          type="button"
          onClick={limpiarCaja}
          className="rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"
        >
          Limpiar Caja
        </button>
      </div>

      <form onSubmit={handleEscaneo} className="mb-4">
        <input
          ref={inputRef}
          type="text"
          autoFocus
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Escaneá o escribí el código de barras y apretá Enter..."
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-700/40"
        />
      </form>

      <div className="overflow-x-auto rounded-lg border bg-background">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="px-4 py-3 font-normal">Nombre</th>
              <th className="px-4 py-3 font-normal">Código de barras</th>
              <th className="px-4 py-3 font-normal">Precio</th>
              <th className="px-4 py-3 text-center font-normal">Cantidad</th>
              <th className="px-4 py-3 text-right font-normal">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {carrito.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  Todavía no hay productos en la caja
                </td>
              </tr>
            ) : (
              carrito.map((item) => (
                <tr key={item.idProducto} className="border-b last:border-none">
                  <td className="px-4 py-3">{item.nombre}</td>
                  <td className="px-4 py-3">{item.codigoBarras}</td>
                  <td className="px-4 py-3">{formatoPrecio(item.precioVenta)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        aria-label={`Quitar una unidad de ${item.nombre}`}
                        onClick={() => cambiarCantidad(item.idProducto, -1)}
                        className="rounded-md border p-1 hover:bg-muted"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="w-6 text-center">{item.cantidad}</span>
                      <button
                        type="button"
                        aria-label={`Sumar una unidad de ${item.nombre}`}
                        onClick={() => cambiarCantidad(item.idProducto, 1)}
                        className="rounded-md border p-1 hover:bg-muted"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatoPrecio(item.precioVenta * item.cantidad)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-stretch gap-3">
        <div className="flex flex-1 items-center justify-between rounded-md border bg-background px-4 py-2">
          <span className="text-sm">Total a Pagar</span>
          <span className="text-2xl font-semibold">{formatoPrecio(total)}</span>
        </div>
        <button
          type="button"
          onClick={calcularCambio}
          className="rounded-md bg-sky-700 px-5 text-sm font-medium text-white hover:bg-sky-800"
        >
          Calcular Cambio
        </button>
      </div>
    </div>
  );
}