import { useEffect, useState } from "react";
import { Banknote, CheckCircle2, Loader2, Wallet } from "lucide-react";
import { registrarPagoCuentaCorriente } from "@/service/cliente.service";
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
import { showError, showSuccess, showWarning } from "@/utils/alerts";

const formatoMoneda = (valor) =>
  `$${Number(valor || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function CobrarDeudaModal({
  open,
  onOpenChange,
  cliente,
  onSuccess,
}) {
  const [montoPago, setMontoPago] = useState("");
  const [pagando, setPagando] = useState(false);

  const deudaActual = Number(cliente?.deuda_actual || 0);
  const limiteCredito = Number(cliente?.limite_credito || 0);
  const saldoDisponible = Math.max(0, limiteCredito - deudaActual);

  useEffect(() => {
    setMontoPago("");
  }, [open, cliente]);

  const cerrarModal = () => {
    if (!pagando) {
      setMontoPago("");
      onOpenChange(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cliente || pagando) return;

    const monto = Number(montoPago);

    if (
      montoPago === "" ||
      !Number.isFinite(monto) ||
      monto <= 0 ||
      Number(monto.toFixed(2)) !== monto
    ) {
      showWarning("Ingresá un monto válido mayor a 0 y con hasta 2 decimales.");
      return;
    }

    if (deudaActual <= 0) {
      showWarning("El cliente no registra deuda pendiente en su cuenta corriente.");
      return;
    }

    if (monto > deudaActual) {
      showWarning(
        `El monto a cobrar (${formatoMoneda(
          monto
        )}) no puede superar la deuda actual (${formatoMoneda(deudaActual)}).`
      );
      return;
    }

    setPagando(true);
    try {
      const data = await registrarPagoCuentaCorriente(
        cliente.id_cliente,
        monto
      );
      const clienteActualizado = data?.client;
      const deudaRestante = Number(
        clienteActualizado?.deuda_actual ?? Math.max(0, deudaActual - monto)
      );

      onOpenChange(false);
      showSuccess(
        deudaRestante === 0
          ? `Se cobraron ${formatoMoneda(
              monto
            )}. ¡La deuda de "${cliente.nombre} ${
              cliente.apellido || ""
            }" quedó saldada en su totalidad!`
          : `Se registró el pago de ${formatoMoneda(
              monto
            )}. Deuda restante: ${formatoMoneda(deudaRestante)}.`,
        "Pago registrado"
      );

      if (onSuccess) {
        await onSuccess(clienteActualizado);
      }
    } catch (error) {
      showError(
        error.status
          ? error.message
          : "Error al registrar el pago de la cuenta corriente"
      );
    } finally {
      setPagando(false);
    }
  };

  const ignorarSiEsCartel = (e) => {
    if (e.target instanceof Element && e.target.closest(".swal2-container")) {
      e.preventDefault();
    }
  };

  const montoNumerico = Number(montoPago) || 0;
  const deudaLuegoDelPago = Math.max(
    0,
    Math.round((deudaActual - montoNumerico) * 100) / 100
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={ignorarSiEsCartel}
        onFocusOutside={ignorarSiEsCartel}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-accent/10 text-accent rounded-lg shrink-0">
              <Wallet className="size-5" />
            </div>
            <div>
              <DialogTitle>Cobrar Deuda de Cuenta Corriente</DialogTitle>
              <DialogDescription>
                Registrá un pago total o parcial de la deuda pendiente del cliente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {cliente && (
          <form onSubmit={handleSubmit} className="space-y-4 py-1">
            {/* Datos del cliente y resumen de cuenta */}
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                <span className="font-semibold text-sm text-foreground truncate">
                  {cliente.nombre} {cliente.apellido || ""}
                </span>
                <span className="font-mono text-muted-foreground shrink-0">
                  {cliente.tipo_documento}: {cliente.numero_documento}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <span className="text-muted-foreground block">Límite total</span>
                  <strong className="text-foreground">
                    {formatoMoneda(limiteCredito)}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">Disponible</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {formatoMoneda(saldoDisponible)}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">Deuda actual</span>
                  <strong className="text-red-600 dark:text-red-400">
                    {formatoMoneda(deudaActual)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="inputMontoCobroDeuda">Monto a cobrar ($) *</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pagando || deudaActual <= 0}
                  onClick={() => setMontoPago(String(deudaActual))}
                  className="h-7 px-2.5 text-xs gap-1 max-w-none cursor-pointer"
                >
                  <CheckCircle2 className="size-3.5 text-accent" />
                  <span>Pago total ({formatoMoneda(deudaActual)})</span>
                </Button>
              </div>

              <Input
                id="inputMontoCobroDeuda"
                type="number"
                min="0.01"
                step="0.01"
                max={deudaActual}
                placeholder="0.00"
                value={montoPago}
                onChange={(e) => setMontoPago(e.target.value)}
                disabled={pagando}
                autoFocus
                required
              />
            </div>

            {montoNumerico > 0 && montoNumerico <= deudaActual && (
              <div className="flex items-center justify-between rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs">
                <span className="text-muted-foreground">
                  Deuda restante luego del pago:
                </span>
                <strong className="text-foreground">
                  {formatoMoneda(deudaLuegoDelPago)}
                </strong>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={cerrarModal}
                disabled={pagando}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="accent"
                disabled={pagando || deudaActual <= 0}
                className="gap-2 cursor-pointer"
              >
                {pagando ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <Banknote className="size-4" />
                    <span>Confirmar Cobro</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CobrarDeudaModal;

