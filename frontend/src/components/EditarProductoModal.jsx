import { useEffect, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { actualizarProducto } from "@/service/product.service";
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

// Mismos límites que el backend (varchar de la tabla `productos`)
const MAX_CODIGO_BARRAS = 50;
const MAX_NOMBRE = 100;
const MAX_DESCRIPCION = 255;

export function EditarProductoModal({
  open,
  onOpenChange,
  producto,
  onSuccess,
}) {
  const [form, setForm] = useState({
    codigoBarras: "",
    nombre: "",
    descripcion: "",
    precioCosto: "",
    precioVenta: "",
    stock: "",
  });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (producto && open) {
      setForm({
        codigoBarras: producto.codigoBarras ?? "",
        nombre: producto.nombre ?? "",
        descripcion: producto.descripcion ?? "",
        precioCosto: producto.precioCosto ?? "",
        precioVenta: producto.precioVenta ?? "",
        stock: producto.stock ?? "",
      });
    }
  }, [producto, open]);

  const cerrarModal = () => {
    if (!guardando) {
      onOpenChange(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!producto) return;

    const codigoBarras = form.codigoBarras.trim();
    const nombre = form.nombre.trim();
    const descripcion = form.descripcion.trim();
    const costoNum = Number(form.precioCosto);
    const ventaNum = Number(form.precioVenta);
    const stockNum = Number(form.stock);

    if (!codigoBarras) {
      showWarning("El código de barras no puede quedar vacío.");
      return;
    }

    if (codigoBarras.length > MAX_CODIGO_BARRAS) {
      showWarning(
        `El código de barras admite hasta ${MAX_CODIGO_BARRAS} caracteres.`,
      );
      return;
    }

    if (!nombre) {
      showWarning("El nombre no puede quedar vacío.");
      return;
    }

    if (nombre.length > MAX_NOMBRE) {
      showWarning(`El nombre admite hasta ${MAX_NOMBRE} caracteres.`);
      return;
    }

    if (descripcion.length > MAX_DESCRIPCION) {
      showWarning(`La descripción admite hasta ${MAX_DESCRIPCION} caracteres.`);
      return;
    }

    if (form.precioCosto === "" || isNaN(costoNum) || costoNum < 0) {
      showWarning(
        "El precio de costo debe ser un número válido mayor o igual a 0.",
      );
      return;
    }

    if (form.precioVenta === "" || isNaN(ventaNum) || ventaNum < 0) {
      showWarning(
        "El precio de venta debe ser un número válido mayor o igual a 0.",
      );
      return;
    }

    if (
      form.stock === "" ||
      isNaN(stockNum) ||
      stockNum < 0 ||
      !Number.isInteger(stockNum)
    ) {
      showWarning("El stock debe ser un número entero no negativo.");
      return;
    }

    setGuardando(true);

    try {
      await actualizarProducto(producto.idProducto, {
        codigoBarras,
        nombre,
        descripcion, // vacía => el backend la guarda como NULL
        precioCosto: costoNum,
        precioVenta: ventaNum,
        stock: stockNum,
      });

      onOpenChange(false);
      showSuccess(
        `Se actualizaron los datos de "${nombre}".`,
        "Producto actualizado",
      );
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      showError(
        error.status ? error.message : "Error al actualizar el producto",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        onInteractOutside={(e) => {
          if (
            e.target instanceof Element &&
            e.target.closest(".swal2-container")
          ) {
            e.preventDefault();
          }
        }}
        onFocusOutside={(e) => {
          if (
            e.target instanceof Element &&
            e.target.closest(".swal2-container")
          ) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-5 text-accent" />
            <span>Editar Producto</span>
          </DialogTitle>
          <DialogDescription>
            Modificá los datos del producto: código de barras, nombre,
            descripción, precios y stock.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="editCodigoBarras">Código de barras *</Label>
            <Input
              id="editCodigoBarras"
              name="codigoBarras"
              type="text"
              maxLength={MAX_CODIGO_BARRAS}
              placeholder="Escaneá o escribí el código"
              value={form.codigoBarras}
              onChange={(e) =>
                setForm({ ...form, codigoBarras: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editNombre">Nombre *</Label>
            <Input
              id="editNombre"
              name="nombre"
              type="text"
              maxLength={MAX_NOMBRE}
              placeholder="Nombre del producto"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editDescripcion">Descripción</Label>
            <Input
              id="editDescripcion"
              name="descripcion"
              type="text"
              maxLength={MAX_DESCRIPCION}
              placeholder="Opcional"
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="editPrecioCosto">Precio de costo ($) *</Label>
              <Input
                id="editPrecioCosto"
                name="precioCosto"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.precioCosto}
                onChange={(e) =>
                  setForm({ ...form, precioCosto: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editPrecioVenta">Precio de venta ($) *</Label>
              <Input
                id="editPrecioVenta"
                name="precioVenta"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.precioVenta}
                onChange={(e) =>
                  setForm({ ...form, precioVenta: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editStock">Stock disponible (unidades) *</Label>
            <Input
              id="editStock"
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
                  <span>Guardando cambios...</span>
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditarProductoModal;
