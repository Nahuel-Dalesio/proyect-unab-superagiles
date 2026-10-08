import { useCallback, useEffect, useRef, useState } from "react";
import { Package } from "lucide-react";
import { getProductos } from "../../service/product.service";
import { showError, showWarning } from "../../utils/alerts";
import { Button } from "@/components/ui/button";
import { ProductosTable } from "@/components/ProductosTable";

// MySQL devuelve los DECIMAL como string, por eso se convierte a número
const formatoPrecio = (valor) =>
  `$${Number(valor).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function ProductosTest() {
  const [productos, setProductos] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [codigo, setCodigo] = useState("");
  const inputRef = useRef(null);

  const cargarProductos = useCallback(async () => {
    try {
      const data = await getProductos();
      const lista = Array.isArray(data) ? data : [];
      setProductos(lista);
      setInventario(lista);
    } catch (error) {
      showError(
        error.status ? error.message : "Error de conexión con el servidor"
      );
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const productosFiltrados = (inventario || []).filter((item) => {
    const term = codigo.toLowerCase().trim();
    if (!term) return true;
    return (
      (item.nombre && item.nombre.toLowerCase().includes(term)) ||
      (item.codigoBarras && String(item.codigoBarras).toLowerCase().includes(term))
    );
  });

  return (
    <div className="flex flex-1 flex-col w-full min-h-0 overflow-hidden">
      <div className="mb-6 flex shrink-0 items-start justify-between gap-4 max-h-12">
        <div className="flex flex-row h-full w-full">
          <Package
            strokeWidth={1.5}
            className="size-12 p-2 border border-border rounded-lg bg-card shrink-0"
          />
          <div className="px-2">
            <div className="text-lg font-semibold">Inventario</div>
            <div className="text-muted-foreground">Lista de productos en stock</div>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="mb-4 shrink-0">
        <input
          ref={inputRef}
          type="text"
          autoFocus
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Buscar producto por nombre o código..."
          className="w-1/4 rounded-md border bg-card px-4 py-2.5 text-sm outline-none"
        />
      </form>

      <ProductosTable
        inventario={productosFiltrados}
        formatoPrecio={formatoPrecio}
      />

      <div className="mt-4 shrink-0 flex gap-4 justify-end">
        <Button
          variant="accent"
          type="button"
          onClick={() => {}}
          className="rounded-md bg-accent px-5 text-sm font-medium text-white hover:accent/85 h-10"
        >
          Hacer pedido
        </Button>
      </div>
    </div>
  );
}