import { useState } from "react";
import { showError, showSuccess, showWarning } from "@/utils/alerts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { abrirCaja } from "@/service/caja.service";

export default function AbrirCajaModal({
  open,
  onOpenChange,
  onSuccess,
  formatoPrecio,
}) {
  const [montoInicial, setMontoInicial] = useState("");
  const [enviando, setEnviando] = useState(false);

  const format =
    formatoPrecio ||
    ((val) =>
      `$${Number(val || 0).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`);

  const handleOpenChange = (abierto) => {
    if (!abierto) {
      setMontoInicial("");
      setEnviando(false);
    }
    onOpenChange?.(abierto);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const monto = Number(montoInicial);

    if (montoInicial === "" || !Number.isFinite(monto) || monto < 0) {
      showWarning("Ingresá un monto inicial válido.");
      return;
    }

    setEnviando(true);

    try {
      const data = await abrirCaja(monto);
      await showSuccess("La caja quedó abierta correctamente.");
      handleOpenChange(false);
      onSuccess?.(data.caja);
    } catch (error) {
      showError(
        error.status ? error.message : "Error de conexión con el servidor"
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-[460px] w-full p-6 flex flex-col gap-3"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Abrir caja</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <Label className="mb-1 block">Monto inicial en efectivo</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              autoFocus
              value={montoInicial}
              onChange={(e) => setMontoInicial(e.target.value)}
              className="border border-border bg-input"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Dinero con el que inicia el turno: {format(montoInicial || 0)}
            </p>
          </div>

          <div className="flex gap-2 justify-between mt-auto pt-2">
            <Button
              type="button"
              variant="destructive"
              className="h-10 w-full"
              onClick={() => handleOpenChange(false)}
              disabled={enviando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="accent"
              className="h-10 w-full"
              disabled={enviando}
            >
              {enviando ? "Abriendo..." : "Abrir caja"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
