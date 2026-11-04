import { useEffect, useState } from "react";
import {
  showError,
  showSuccess,
  showWarning,
} from "@/utils/alerts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getCajaAbierta,
  cerrarCaja as cerrarCajaApi,
} from "@/service/caja.service";

const round2 = (n) => Math.round(n * 100) / 100;

const FilaResumen = ({ label, valor, destacado = false, secundario = false }) => (
  <div className="flex items-center justify-between text-sm">
    <span className={secundario ? "text-xs text-muted-foreground" : "text-muted-foreground"}>
      {label}
    </span>
    <span
      className={
        destacado
          ? "text-lg font-semibold text-foreground"
          : secundario
            ? "text-xs font-medium text-muted-foreground"
            : "font-medium text-foreground"
      }
    >
      {valor}
    </span>
  </div>
);

export default function CerrarCajaModal({
  open,
  onOpenChange,
  caja,
  onSuccess,
  formatoPrecio,
}) {
  const [cajaRefrescada, setCajaRefrescada] = useState(null);
  const [montoFinal, setMontoFinal] = useState("");
  const [enviando, setEnviando] = useState(false);

  const format =
    formatoPrecio ||
    ((val) =>
      `$${Number(val || 0).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`);

  // Al abrir, se refresca la caja para mostrar el desglose de ventas actualizado.
  useEffect(() => {
    if (!open) return;

    let activo = true;

    getCajaAbierta()
      .then((data) => {
        if (activo && data.caja) setCajaRefrescada(data.caja);
      })
      .catch(() => {
        // Si falla el refresco se usa la información que ya teníamos.
      });

    return () => {
      activo = false;
    };
  }, [open]);

  const handleOpenChange = (abierto) => {
    if (!abierto) {
      setMontoFinal("");
      setEnviando(false);
      setCajaRefrescada(null);
    }
    onOpenChange?.(abierto);
  };

  const cajaActual = cajaRefrescada ?? caja;

  const montoInicial = Number(cajaActual?.montoInicial ?? 0);
  const ventasEfectivo = Number(cajaActual?.ventasEfectivo ?? 0);
  const ventasTransferencia = Number(cajaActual?.ventasTransferencia ?? 0);
  const ventasTarjeta = Number(cajaActual?.ventasTarjeta ?? 0);
  const totalVentas = Number(cajaActual?.totalVentas ?? 0);

  // El efectivo esperado en caja solo suma el monto inicial y los pagos en efectivo
  const montoEsperado = round2(montoInicial + ventasEfectivo);
  const montoFinalNum = Number(montoFinal);
  const diferenciaCalculada =
    montoFinal === "" || !Number.isFinite(montoFinalNum)
      ? null
      : round2(montoFinalNum - montoEsperado);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (montoFinal === "" || !Number.isFinite(montoFinalNum) || montoFinalNum < 0) {
      showWarning("Ingresá un monto final válido.");
      return;
    }

    setEnviando(true);

    try {
      const data = await cerrarCajaApi(cajaActual.idCierre, montoFinalNum);
      const diferencia = Number(data.caja?.diferencia ?? 0);

      if (diferencia === 0) {
        await showSuccess("La caja se cerró sin diferencias.");
      } else if (diferencia > 0) {
        await showSuccess(`Caja cerrada. Sobrante: ${format(diferencia)}.`);
      } else {
        await showSuccess(`Caja cerrada. Faltante: ${format(-diferencia)}.`);
      }

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
        className="max-w-[480px] w-full p-6 flex flex-col gap-3"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Cerrar caja</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3">
            <FilaResumen
              label="Monto inicial (efectivo)"
              valor={format(montoInicial)}
            />
            <FilaResumen
              label="Ventas en efectivo:"
              valor={format(ventasEfectivo)}
            />

            <div className="border-t border-border/60 pt-2 flex flex-col gap-1">
              <FilaResumen
                label="Ventas por transferencia: "
                valor={format(ventasTransferencia)}
                secundario
              />
              <FilaResumen
                label="Ventas con tarjeta: "
                valor={format(ventasTarjeta)}
                secundario
              />
              <FilaResumen
                label="Total general vendido en el turno:"
                valor={format(totalVentas)}
                secundario
              />
            </div>

            <div className="border-t border-border pt-2">
              <FilaResumen
                label="Efectivo esperado"
                valor={format(montoEsperado)}
                destacado
              />
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Monto final en efectivo contado</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              autoFocus
              value={montoFinal}
              onChange={(e) => setMontoFinal(e.target.value)}
              className="border border-border bg-input"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm">
            <span className="text-muted-foreground">Diferencia de efectivo</span>
            <span
              className={
                diferenciaCalculada === null
                  ? "font-medium"
                  : diferenciaCalculada < 0
                    ? "font-semibold text-destructive"
                    : "font-semibold text-emerald-600"
              }
            >
              {diferenciaCalculada === null
                ? "-"
                : format(diferenciaCalculada)}
            </span>
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
              {enviando ? "Cerrando..." : "Cerrar caja"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
