import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Loader2, Package, Plus } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { ROLES } from "@/utils/roles";
import { getProductos, crearProducto } from "@/service/product.service";
import { showError, showSuccess, showWarning } from "@/utils/alerts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductosTable } from "@/components/ProductosTable";
import { EditarProductoModal } from "@/components/EditarProductoModal";
import { AgregarStockModal } from "@/components/AgregarStockModal";

const FORM_INICIAL = {
  codigoBarras: "",
  nombre: "",
  descripcion: "",
  precioCosto: "",
  precioVenta: "",
  stock: "",
  stockMinimo: 5,
};

// MySQL devuelve los DECIMAL como string, por eso se convierte a número
const formatoPrecio = (valor) =>
  `$${Number(valor).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function Productos() {
  const { user } = useContext(AuthContext);
  const esGestor = !user || user.rol === ROLES.ADMIN || user.rol === ROLES.ENCARGADO;

  const [productos, setProductos] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [codigo, setCodigo] = useState("");
  const inputRef = useRef(null);

  // Estado del modal de nuevo producto
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);

  // Estado de modales auxiliares (editar y agregar stock)
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState(null);

  const [modalStockAbierto, setModalStockAbierto] = useState(false);
  const [productoAStock, setProductoAStock] = useState(null);

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

  const abrirModal = () => {
    setForm(FORM_INICIAL);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    if (!guardando) {
      setModalAbierto(false);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();

    const codigoBarras = form.codigoBarras.trim();
    const nombre = form.nombre.trim();

    if (!codigoBarras || !nombre) {
      showWarning("El código de barras y el nombre son obligatorios.");
      return;
    }

    if (form.precioCosto === "" || isNaN(Number(form.precioCosto))) {
      showWarning("El precio de costo es obligatorio y debe ser un número válido.");
      return;
    }

    if (form.precioVenta === "" || isNaN(Number(form.precioVenta))) {
      showWarning("El precio de venta es obligatorio y debe ser un número válido.");
      return;
    }

    if (form.stock === "" || isNaN(Number(form.stock))) {
      showWarning("El stock inicial es obligatorio y debe ser un número válido.");
      return;
    }

    setGuardando(true);

    try {
      await crearProducto({
        codigoBarras,
        nombre,
        descripcion: form.descripcion.trim(),
        precioCosto: Number(form.precioCosto),
        precioVenta: Number(form.precioVenta),
        stock: Number(form.stock),
        stockMinimo: form.stockMinimo !== "" ? Number(form.stockMinimo) : 0,
      });

      cerrarModal();
      showSuccess("Producto incorporado al catálogo exitosamente.", "Creado");
      await cargarProductos();
    } catch (error) {
      showError(
        error.status ? error.message : "Error al guardar el producto"
      );
    } finally {
      setGuardando(false);
    }
  };

  const abrirModalEditar = (item) => {
    setProductoAEditar(item);
    setModalEditarAbierto(true);
  };

  const abrirModalStock = (item) => {
    setProductoAStock(item);
    setModalStockAbierto(true);
  };

  const handleToggleActivo = (idProducto) => {
    setInventario((prev) =>
      prev.map((item) => {
        const idActual = item.idProducto ?? item.id_producto;
        if (idActual === idProducto) {
          const nuevoEstado = !(item.activo ?? true);
          showSuccess(
            `Producto "${item.nombre}" ${
              nuevoEstado ? "activado" : "desactivado"
            } correctamente.`,
            "Estado actualizado"
          );
          return { ...item, activo: nuevoEstado };
        }
        return item;
      })
    );
    setProductos((prev) =>
      prev.map((item) => {
        const idActual = item.idProducto ?? item.id_producto;
        if (idActual === idProducto) {
          return { ...item, activo: !(item.activo ?? true) };
        }
        return item;
      })
    );
  };

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
      {/* Encabezado con título y botón de alta */}
      <div className="mb-6 flex shrink-0 items-center justify-between gap-4">
        <div className="flex flex-row items-center">
          <Package
            strokeWidth={1.5}
            className="size-12 p-2 border border-border rounded-lg bg-card shrink-0"
          />
          <div className="px-3">
            <div className="text-lg font-semibold">Inventario</div>
            <div className="text-sm text-muted-foreground">Lista de productos en stock</div>
          </div>
        </div>

        {esGestor && (
          <Button
            variant="accent"
            onClick={abrirModal}
            className="gap-2 font-medium h-10 px-4"
          >
            <Plus className="size-4" />
            <span>Nuevo Producto</span>
          </Button>
        )}
      </div>

      {/* Barra de búsqueda */}
      <form onSubmit={(e) => e.preventDefault()} className="mb-4 shrink-0">
        <input
          ref={inputRef}
          type="text"
          autoFocus
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Buscar producto por nombre o código..."
          className="w-1/4 min-w-64 rounded-md border bg-card px-4 py-2.5 text-sm outline-none"
        />
      </form>

      {/* Tabla de Productos */}
      <ProductosTable
        inventario={productosFiltrados}
        formatoPrecio={formatoPrecio}
        onAgregarStock={abrirModalStock}
        onEditarStock={abrirModalEditar}
        onToggleActivo={handleToggleActivo}
        esGestor={esGestor}
      />

      {/* Pie de acciones */}
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

      {/* Modal para agregar producto */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo Producto</DialogTitle>
            <DialogDescription>
              Completá los datos requeridos para registrar un nuevo producto en el inventario.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleGuardar} className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="codigoBarras">Código de barras *</Label>
              <Input
                id="codigoBarras"
                name="codigoBarras"
                placeholder="Ej: 7791234567890"
                maxLength={50}
                value={form.codigoBarras}
                onChange={(e) => setForm({ ...form, codigoBarras: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre del producto *</Label>
              <Input
                id="nombre"
                name="nombre"
                placeholder="Ej: Alfajor Havanna 70% Cacao"
                maxLength={100}
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <Input
                id="descripcion"
                name="descripcion"
                placeholder="Ej: Caja por 6 unidades"
                maxLength={255}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="precioCosto">Precio de costo ($) *</Label>
                <Input
                  id="precioCosto"
                  name="precioCosto"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.precioCosto}
                  onChange={(e) => setForm({ ...form, precioCosto: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="precioVenta">Precio de venta ($) *</Label>
                <Input
                  id="precioVenta"
                  name="precioVenta"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.precioVenta}
                  onChange={(e) => setForm({ ...form, precioVenta: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="stock">Stock inicial *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stockMinimo">Stock mínimo</Label>
                <Input
                  id="stockMinimo"
                  name="stockMinimo"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="5"
                  value={form.stockMinimo}
                  onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={cerrarModal}
                disabled={guardando}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="accent"
                disabled={guardando}
                className="gap-2"
              >
                {guardando ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  "Guardar Producto"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para editar precio y stock del producto */}
      <EditarProductoModal
        open={modalEditarAbierto}
        onOpenChange={setModalEditarAbierto}
        producto={productoAEditar}
        onSuccess={cargarProductos}
      />

      {/* Modal para agregar stock rápidamente */}
      <AgregarStockModal
        open={modalStockAbierto}
        onOpenChange={setModalStockAbierto}
        producto={productoAStock}
        onSuccess={cargarProductos}
      />
    </div>
  );
}