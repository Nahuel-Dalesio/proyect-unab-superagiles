import { useEffect, useState } from "react";
import { ArrowRight, Loader2, PackagePlus } from "lucide-react";
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

export function AgregarStockModal({
  open,
  onOpenChange,
  producto,
  onSuccess,
}) {
  const [cantidadAgregar, setCantidadAgregar] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (open) {
      setCantidadAgregar("");
    }
  }, [open]);

  const cerrarModal = () => {
    if (!guardando) {
      onOpenChange(false);
      setCantidadAgregar("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!producto) return;

    const cantidad = Number(cantidadAgregar);
    if (
      cantidadAgregar === "" ||
      isNaN(cantidad) ||
      !Number.isInteger(cantidad) ||
      cantidad <= 0
    ) {
      showWarning("Ingresá una cantidad entera mayor a 0 para agregar al stock.");
      return;
    }

    const nuevoStock = Number(producto.stock) + cantidad;
    setGuardando(true);

    try {
      await actualizarProducto(producto.idProducto, {
        precioCosto: Number(producto.precioCosto ?? 0),
        precioVenta: Number(producto.precioVenta),
        stock: nuevoStock,
      });

      onOpenChange(false);
      showSuccess(
        `Se sumaron ${cantidad} unidades a "${producto.nombre}". Nuevo stock: ${nuevoStock} u.`,
        "Stock actualizado"
      );
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      showError(
        error.status ? error.message : "Error al actualizar el stock"
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="size-5 text-accent" />
            <span>Agregar Stock</span>
          </DialogTitle>
          <DialogDescription>
            Recepción rápida de mercadería para sumar unidades al stock disponible.
          </DialogDescription>
        </DialogHeader>

        {producto && (
          <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-foreground">
                {producto.nombre}
              </span>
              <span className="text-xs font-mono bg-card px-2 py-0.5 rounded border text-muted-foreground">
                {producto.codigoBarras}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Stock actual registrado:</span>
              <span className="font-semibold text-foreground bg-card px-2 py-0.5 rounded border">
                {producto.stock} u.
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="cantidadAgregar">
              Cantidad de unidades a ingresar *
            </Label>
            <Input
              id="cantidadAgregar"
              type="number"
              min="1"
              step="1"
              placeholder="Ej: 10"
              value={cantidadAgregar}
              onChange={(e) => setCantidadAgregar(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* Previsualización del stock final */}
          {cantidadAgregar &&
            !isNaN(Number(cantidadAgregar)) &&
            Number(cantidadAgregar) > 0 && (
              <div className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-xs flex items-center justify-between text-accent-foreground font-medium">
                <span>Actual: {producto?.stock} u.</span>
                <ArrowRight className="size-4 opacity-70" />
                <span>+ {Number(cantidadAgregar)} u.</span>
                <ArrowRight className="size-4 opacity-70" />
                <span className="font-bold text-accent">
                  Nuevo: {Number(producto?.stock || 0) + Number(cantidadAgregar)} u.
                </span>
              </div>
            )}

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
                  <span>Sumando stock...</span>
                </>
              ) : (
                "Confirmar Ingreso"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AgregarStockModal;
