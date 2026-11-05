import { useEffect, useState } from "react";
import { Loader2, Percent, TrendingUp } from "lucide-react";
import { actualizarPreciosPorPorcentaje } from "@/service/product.service";
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

const PORCENTAJES_RAPIDOS = [5, 10, 15, 20, 25, 30];

export function ActualizarPreciosModal({ open, onOpenChange, onSuccess }) {
  const [porcentaje, setPorcentaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (open) {
      setPorcentaje("");
    }
  }, [open]);

  const cerrarModal = () => {
    if (!guardando) {
      onOpenChange(false);
      setPorcentaje("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const valor = Number(porcentaje);
    if (
      porcentaje === "" ||
      !Number.isFinite(valor) ||
      valor <= 0 ||
      Number(valor.toFixed(2)) !== valor
    ) {
      showWarning(
        "El porcentaje debe ser un número mayor a 0 con hasta 2 decimales."
      );
      return;
    }

    setGuardando(true);

    try {
      const data = await actualizarPreciosPorPorcentaje(valor);
      const cantidad = data?.updatedProducts ?? 0;

      onOpenChange(false);
      showSuccess(
        `Se incrementaron los precios de venta en un ${valor}% (${cantidad} productos actualizados).`,
        "Precios actualizados"
      );

      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      showError(
        error.status ? error.message : "Error al actualizar los precios"
      );
    } finally {
      setGuardando(false);
    }
  };

  const ignorarSiEsCartel = (e) => {
    if (e.target instanceof Element && e.target.closest(".swal2-container")) {
      e.preventDefault();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={ignorarSiEsCartel}
        onFocusOutside={ignorarSiEsCartel}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="size-5 text-accent" />
            <span>Actualizar Precios por Porcentaje</span>
          </DialogTitle>
          <DialogDescription>
            Aumentá de forma masiva el precio de venta de todos los productos
            activos del catálogo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="porcentajeAumento">
              Porcentaje de aumento (%) *
            </Label>
            <div className="relative flex items-center">
              <Input
                id="porcentajeAumento"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Ej: 15"
                value={porcentaje}
                onChange={(e) => setPorcentaje(e.target.value)}
                autoFocus
                required
                className="pr-8"
              />
              <Percent className="size-4 text-muted-foreground absolute right-2.5 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">
               incrementos rápidos:
            </span>
            <div className="grid grid-cols-6 gap-1.5">
              {PORCENTAJES_RAPIDOS.map((valor) => (
                <Button
                  key={valor}
                  type="button"
                  variant={Number(porcentaje) === valor ? "accent" : "outline"}
                  size="sm"
                  onClick={() => setPorcentaje(String(valor))}
                  className="w-full max-w-none cursor-pointer"
                >
                  +{valor}%
                </Button>
              ))}
            </div>
          </div>

          {porcentaje && !isNaN(Number(porcentaje)) && Number(porcentaje) > 0 && (
            <div className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-xs text-foreground space-y-1">
              <div className="font-semibold text-accent">
                Ejemplo de aplicación (+{Number(porcentaje)}%):
              </div>
              <div className="text-muted-foreground">
                Un producto de <strong className="text-foreground">$1.000,00</strong> pasará a costar{" "}
                <strong className="text-foreground">
                  $
                  {(1000 * (1 + Number(porcentaje) / 100)).toLocaleString(
                    "es-AR",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </strong>
                .
              </div>
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
                  <span>Actualizando...</span>
                </>
              ) : (
                "Aplicar Aumento"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ActualizarPreciosModal;

