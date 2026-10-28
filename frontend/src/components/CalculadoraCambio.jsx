import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { showWarning } from "@/utils/alerts";
import { Banknote, CreditCard, Landmark, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RegistroCliente from "@/components/RegistroCliente";

const BILLETES = [20000, 10000, 5000, 2000, 1000, 500, 200, 100];

const MEDIOS_PAGO = [
  { id: "efectivo", label: "Efectivo", icon: Banknote },
  { id: "transferencia", label: "Transferencia", icon: Landmark },
  { id: "tarjeta", label: "Tarjeta", icon: CreditCard },
];

export default function CalculadoraCambio({
  open,
  onOpenChange,
  total = 0,
  formatoPrecio,
  onExito,
}) {
  const [medioPago, setMedioPago] = useState("efectivo");
  const [recibido, setRecibido] = useState("");
  const [emitirFactura, setEmitirFactura] = useState(false);

  const esEfectivo = medioPago === "efectivo";

  useEffect(() => {
    if (open) {
      setMedioPago("efectivo");
      setRecibido("");
      setEmitirFactura(false);
    }
  }, [open]);

  const handleSeleccionarMedioPago = (nuevoMedio) => {
    setMedioPago(nuevoMedio);
    if (nuevoMedio !== "efectivo") {
      setRecibido("");
    }
  };

  const format = formatoPrecio || ((val) =>
    `$${Number(val || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`);

  const handleCerrar = () => {
    onOpenChange?.(false);
  };

  const handleCalcular = async (e) => {
    e?.preventDefault();

    if (!esEfectivo) {
      await Swal.fire({
        title: "Pago confirmado",
        text: `Cobro por ${format(total)} mediante ${medioPago}. No requiere devolver cambio.`,
        icon: "success",
      });
      onOpenChange?.(false);
      onExito?.({ medioPago, montoRecibido: total, cambio: 0 });
      return;
    }

    const montoRecibido = Number(recibido);

    if (!recibido || isNaN(montoRecibido) || montoRecibido <= 0) {
      showWarning("Ingresá un monto recibido válido.");
      return;
    }

    const cambio = montoRecibido - total;

    if (cambio < 0) {
      await Swal.fire({
        title: "Falta dinero",
        text: `Faltan ${format(Math.abs(cambio))}`,
        icon: "warning",
      });
    } else {
      await Swal.fire({
        title: "Cambio",
        text: `Devolver ${format(cambio)}`,
        icon: "success",
      });
      onOpenChange?.(false);
      onExito?.({ medioPago, montoRecibido, cambio });
    }
  };

  const handleSumarBillete = (valor) => {
    if (!esEfectivo) return;
    setRecibido((prev) => {
      const actual = Number(prev) || 0;
      return (actual + valor).toString();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-[600px] w-full max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-3"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Calculadora Cambio</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleCalcular} className="flex flex-col gap-3">
          <div>
            <Label className="mb-1 block">Monto a cobrar</Label>
            <Input
              readOnly
              value={format(total)}
              className="border border-border bg-input font-semibold text-lg"
            />
          </div>

          <div>
            <Label className="mb-1 block">Medio de pago</Label>
            <div className="grid grid-cols-3 gap-2">
              {MEDIOS_PAGO.map(({ id, label, icon: Icon }) => {
                const seleccionado = medioPago === id;
                return (
                  <Button
                    key={id}
                    type="button"
                    variant={seleccionado ? "accent" : "outline"}
                    onClick={() => handleSeleccionarMedioPago(id)}
                    className="h-10 w-full max-w-none flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Icon className="size-4" />
                    <span>{label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Recibido</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder={
                  esEfectivo
                    ? "0.00"
                    : "No aplica para pagos con tarjeta o transferencia"
                }
                autoFocus={esEfectivo}
                disabled={!esEfectivo}
                value={recibido}
                onChange={(e) => setRecibido(e.target.value)}
                className="border border-border bg-input flex-1 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => setRecibido("")}
                disabled={!esEfectivo || !recibido}
                className="h-8 px-3 shrink-0 flex items-center gap-1.5 font-medium border-border hover:bg-destructive/90 cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                Limpiar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {BILLETES.map((valor) => (
              <Button
                key={valor}
                type="button"
                variant="accent"
                disabled={!esEfectivo}
                className="h-10 w-full"
                onClick={() => handleSumarBillete(valor)}
              >
                {valor}
              </Button>
            ))}
          </div>

          <div className="flex pt-3">
            <div className="flex items-center justify-center space-x-2 w-full">
              <Checkbox
                id="emitir-factura"
                checked={emitirFactura}
                onCheckedChange={setEmitirFactura}
                className="border-border data-checked:bg-accent data-checked:border-accent"
              />
              <Label htmlFor="emitir-factura" className="cursor-pointer">
                Emitir factura
              </Label>
            </div>
          </div>

          {/* Componente hijo renderizado condicionalmente */}
          {emitirFactura && <RegistroCliente />}

          <div className="flex gap-2 justify-between mt-auto pt-2">
            <Button
              type="button"
              variant="destructive"
              className="h-10 w-full"
              onClick={handleCerrar}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="accent"
              className="h-10 w-full"
            >
              Calcular
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
