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

export function EditarProductoModal({
  open,
  onOpenChange,
  producto,
  onSuccess,
}) {
  const [form, setForm] = useState({
    precioCosto: "",
    precioVenta: "",
    stock: "",
  });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (producto && open) {
      setForm({
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

    const costoNum = Number(form.precioCosto);
    const ventaNum = Number(form.precioVenta);
    const stockNum = Number(form.stock);

    if (form.precioCosto === "" || isNaN(costoNum) || costoNum < 0) {
      showWarning("El precio de costo debe ser un número válido mayor o igual a 0.");
      return;
    }

    if (form.precioVenta === "" || isNaN(ventaNum) || ventaNum < 0) {
      showWarning("El precio de venta debe ser un número válido mayor o igual a 0.");
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
        precioCosto: costoNum,
        precioVenta: ventaNum,
        stock: stockNum,
      });

      onOpenChange(false);
      showSuccess(
        `Se actualizaron los datos de "${producto.nombre}".`,
        "Producto actualizado"
      );
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      showError(
        error.status ? error.message : "Error al actualizar el producto"
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-5 text-accent" />
            <span>Editar Producto</span>
          </DialogTitle>
          <DialogDescription>
            Modificá el precio de costo, precio de venta o el stock actual del producto.
          </DialogDescription>
        </DialogHeader>

        {producto && (
          <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-foreground">
                {producto.nombre}
              </span>
              <span className="font-mono bg-card px-2 py-0.5 rounded border text-muted-foreground">
                {producto.codigoBarras}
              </span>
            </div>
            {producto.descripcion && (
              <p className="text-muted-foreground line-clamp-1">
                {producto.descripcion}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
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
              onChange={(e) =>
                setForm({ ...form, stock: e.target.value })
              }
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
