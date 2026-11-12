import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { showError, showWarning } from "@/utils/alerts";
import { imprimirComprobante } from "@/utils/comprobante";
import {
  Banknote,
  CreditCard,
  Landmark,
  Loader2,
  RotateCcw,
  Wallet,
} from "lucide-react";
import { registrarVenta } from "@/service/ventas.service";
import { crearCliente } from "@/service/cliente.service";
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
  { id: "cuenta_corriente", label: "Fiado", icon: Wallet },
];

const ESTADO_FACTURA_INICIAL = {
  clienteSeleccionado: null,
  registrarNuevo: false,
  nuevoCliente: {
    nombre: "",
    apellido: "",
    tipo_documento: "DNI",
    numero_documento: "",
    telefono: "",
    email: "",
    limite_credito: 0,
  },
};

export default function CalculadoraCambio({
  open,
  onOpenChange,
  total = 0,
  carrito = [],
  formatoPrecio,
  onExito,
}) {
  const [medioPago, setMedioPago] = useState("efectivo");
  const [tipoTarjeta, setTipoTarjeta] = useState("debito");
  const [recibido, setRecibido] = useState("");
  const [emitirFactura, setEmitirFactura] = useState(false);
  const [datosFactura, setDatosFactura] = useState(ESTADO_FACTURA_INICIAL);
  const [procesando, setProcesando] = useState(false);

  const esEfectivo = medioPago === "efectivo";
  const esFiado = medioPago === "cuenta_corriente";
  const requiereCliente = emitirFactura || esFiado;

  useEffect(() => {
    if (open) {
      setMedioPago("efectivo");
      setTipoTarjeta("debito");
      setRecibido("");
      setEmitirFactura(false);
      setDatosFactura(ESTADO_FACTURA_INICIAL);
      setProcesando(false);
    }
  }, [open]);

  const handleSeleccionarMedioPago = (nuevoMedio) => {
    setMedioPago(nuevoMedio);
    if (nuevoMedio !== "efectivo") {
      setRecibido("");
    }
  };

  const format =
    formatoPrecio ||
    ((val) =>
      `$${Number(val || 0).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`);

  const handleCerrar = () => {
    if (!procesando) {
      onOpenChange?.(false);
    }
  };

  const handleCalcular = async (e) => {
    e?.preventDefault();
    if (procesando) return;

    let montoRecibido = total;
    let cambio = 0;

    if (esEfectivo) {
      montoRecibido = Number(recibido);

      if (!recibido || isNaN(montoRecibido) || montoRecibido <= 0) {
        showWarning("Ingresá un monto recibido válido.");
        return;
      }

      cambio = montoRecibido - total;

      if (cambio < 0) {
        await Swal.fire({
          title: "Falta dinero",
          text: `Faltan ${format(Math.abs(cambio))}`,
          icon: "warning",
        });
        return;
      }
    }

    // Validación de cliente si se marcó "Emitir factura" o si el pago es "Fiado" (cuenta_corriente)
    if (requiereCliente) {
      if (datosFactura.registrarNuevo) {
        const nombre = datosFactura.nuevoCliente.nombre.trim();
        const numeroDoc = datosFactura.nuevoCliente.numero_documento.trim();
        const limiteNuevo = Number(datosFactura.nuevoCliente.limite_credito) || 0;

        if (!nombre || !numeroDoc) {
          showWarning(
            "Completá el nombre y el número de documento para registrar al cliente."
          );
          return;
        }

        if (esFiado && limiteNuevo <= 0) {
          showWarning(
            "Seleccioná un monto de Cuenta Corriente ($100.000, $200.000, $300.000 o $500.000) para poder cobrarle fiado al nuevo cliente."
          );
          return;
        }

        if (esFiado && limiteNuevo < total) {
          showWarning(
            `El monto de la venta (${format(total)}) supera el límite de cuenta corriente seleccionado (${format(limiteNuevo)}).`
          );
          return;
        }
      } else if (!datosFactura.clienteSeleccionado) {
        showWarning(
          esFiado
            ? "Seleccioná un cliente con Cuenta Corriente o registrá uno nuevo para cobrar al fiado."
            : "Seleccioná un cliente existente o marcá 'Registrar cliente nuevo' para emitir la factura."
        );
        return;
      } else if (esFiado) {
        const cli = datosFactura.clienteSeleccionado;
        if (!cli.cuenta_corriente_habilitada) {
          showWarning(
            `El cliente "${cli.nombre} ${cli.apellido || ""}" no tiene una Cuenta Corriente habilitada.`
          );
          return;
        }

        const disponible = Number(
          cli.credito_disponible ??
            Math.max(
              0,
              Number(cli.limite_credito || 0) - Number(cli.deuda_actual || 0)
            )
        );

        if (disponible < total) {
          showWarning(
            `Saldo insuficiente en la Cuenta Corriente del cliente. Disponible: ${format(
              disponible
            )} — Total a cobrar: ${format(total)}.`
          );
          return;
        }
      }
    }

    const medioPagoBackend =
      medioPago === "tarjeta" ? tipoTarjeta : medioPago;

    setProcesando(true);

    try {
      let idCliente = null;
      let clienteAsociado = null;
      let saldoDisponiblePrevio = 0;

      if (requiereCliente) {
        if (datosFactura.registrarNuevo) {
          const limiteNuevo =
            Number(datosFactura.nuevoCliente.limite_credito) || 0;
          const resCliente = await crearCliente({
            nombre: datosFactura.nuevoCliente.nombre.trim(),
            apellido: datosFactura.nuevoCliente.apellido.trim(),
            tipo_documento: datosFactura.nuevoCliente.tipo_documento,
            numero_documento:
              datosFactura.nuevoCliente.numero_documento.trim(),
            telefono: (datosFactura.nuevoCliente.telefono || "").trim(),
            email: (datosFactura.nuevoCliente.email || "").trim(),
            cuenta_corriente_habilitada: limiteNuevo > 0,
            limite_credito: limiteNuevo,
          });
          clienteAsociado = resCliente?.client ?? null;
          idCliente = clienteAsociado?.id_cliente ?? null;
          saldoDisponiblePrevio = limiteNuevo;
        } else {
          const cli = datosFactura.clienteSeleccionado;
          clienteAsociado = cli ?? null;
          idCliente = cli?.id_cliente ?? null;
          saldoDisponiblePrevio = Number(
            cli?.credito_disponible ??
              Math.max(
                0,
                Number(cli?.limite_credito || 0) -
                  Number(cli?.deuda_actual || 0)
              )
          );
        }
      }

      let ventaRegistrada = null;

      if (Array.isArray(carrito) && carrito.length > 0) {
        const items = carrito.map((item) => ({
          idProducto: item.idProducto,
          cantidad: item.cantidad,
        }));

        const data = await registrarVenta({
          items,
          medioPago: medioPagoBackend,
          idCliente,
        });
        ventaRegistrada = data?.venta ?? null;
      }

      const esFacturaC = Boolean(idCliente);
      const textoBotonImprimir = esFacturaC
        ? "Imprimir Factura C"
        : "Imprimir Ticket";

      let tituloSwal = "Venta registrada";
      let textoSwal = "";

      if (esEfectivo) {
        textoSwal = `Devolver ${format(cambio)} de cambio.`;
      } else if (esFiado) {
        const saldoRestante = Math.max(0, saldoDisponiblePrevio - total);
        tituloSwal = "Venta al fiado registrada";
        textoSwal = `Se descontaron ${format(
          total
        )} de la Cuenta Corriente del cliente. Saldo disponible restante: ${format(
          saldoRestante
        )}.`;
      } else {
        const etiquetaMedio =
          medioPago === "tarjeta"
            ? `tarjeta (${tipoTarjeta})`
            : "transferencia";
        textoSwal = `Cobro por ${format(
          total
        )} mediante ${etiquetaMedio}. No requiere devolver cambio.`;
      }

      const resultadoSwal = await Swal.fire({
        title: tituloSwal,
        text: textoSwal,
        icon: "success",
        showCancelButton: true,
        confirmButtonText: textoBotonImprimir,
        cancelButtonText: "Cerrar",
        reverseButtons: true,
      });

      if (resultadoSwal.isConfirmed && ventaRegistrada) {
        imprimirComprobante(
          {
            ...ventaRegistrada,
            cliente: clienteAsociado || undefined,
          },
          {
            tipo: esFacturaC ? "factura" : "ticket",
            montoRecibido,
            cambio,
          }
        );
      }

      onOpenChange?.(false);
      await onExito?.({
        venta: ventaRegistrada,
        medioPago: medioPagoBackend,
        montoRecibido,
        cambio,
      });
    } catch (error) {
      showError(
        error.status ? error.message : "Error al registrar la venta en el servidor"
      );
    } finally {
      setProcesando(false);
    }
  };

  const handleSumarBillete = (valor) => {
    if (!esEfectivo || procesando) return;
    setRecibido((prev) => {
      const actual = Number(prev) || 0;
      return (actual + valor).toString();
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleCerrar}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-[600px] max-h-[90dvh] overflow-y-auto p-4 sm:p-6 flex flex-col gap-3"
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
              {MEDIOS_PAGO.map(({ id, label, icon: Icon }) => {
                const seleccionado = medioPago === id;
                return (
                  <Button
                    key={id}
                    type="button"
                    variant={seleccionado ? "accent" : "outline"}
                    onClick={() => handleSeleccionarMedioPago(id)}
                    disabled={procesando}
                    className="h-10 w-full max-w-none flex items-center justify-center gap-1.5 sm:gap-2 px-2 text-xs sm:text-sm cursor-pointer"
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </Button>
                );
              })}
            </div>

            {medioPago === "tarjeta" && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={tipoTarjeta === "debito" ? "accent" : "outline"}
                  onClick={() => setTipoTarjeta("debito")}
                  disabled={procesando}
                  className="w-full max-w-none cursor-pointer"
                >
                  Tarjeta de Débito
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={tipoTarjeta === "credito" ? "accent" : "outline"}
                  onClick={() => setTipoTarjeta("credito")}
                  disabled={procesando}
                  className="w-full max-w-none cursor-pointer"
                >
                  Tarjeta de Crédito
                </Button>
              </div>
            )}
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
                    : esFiado
                    ? "Se descontará de la Cuenta Corriente del cliente"
                    : "No aplica para pagos con tarjeta o transferencia"
                }
                autoFocus={esEfectivo}
                disabled={!esEfectivo || procesando}
                value={recibido}
                onChange={(e) => setRecibido(e.target.value)}
                className="border border-border bg-input flex-1 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => setRecibido("")}
                disabled={!esEfectivo || !recibido || procesando}
                className="h-8 px-3 shrink-0 flex items-center gap-1.5 font-medium border-border hover:bg-destructive/90 cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                Limpiar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {BILLETES.map((valor) => (
              <Button
                key={valor}
                type="button"
                variant="accent"
                disabled={!esEfectivo || procesando}
                className="h-10 w-full px-1 text-xs sm:text-sm"
                onClick={() => handleSumarBillete(valor)}
              >
                {valor}
              </Button>
            ))}
          </div>

          {!esFiado && (
            <div className="flex pt-3">
              <div className="flex items-center justify-center space-x-2 w-full">
                <Checkbox
                  id="emitir-factura"
                  checked={emitirFactura}
                  onCheckedChange={setEmitirFactura}
                  disabled={procesando}
                  className="border-border data-checked:bg-accent data-checked:border-accent"
                />
                <Label htmlFor="emitir-factura" className="cursor-pointer">
                  Emitir factura
                </Label>
              </div>
            </div>
          )}

          {/* Selección / Registro de cliente (obligatorio en Fiado o al emitir factura) */}
          {requiereCliente && (
            <RegistroCliente
              value={datosFactura}
              onChange={setDatosFactura}
              disabled={procesando}
              modoFiado={esFiado}
              totalCompra={total}
            />
          )}

          <div className="flex gap-2 justify-between mt-auto pt-2">
            <Button
              type="button"
              variant="destructive"
              className="h-10 w-full"
              onClick={handleCerrar}
              disabled={procesando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="accent"
              className="h-10 w-full gap-2"
              disabled={procesando}
            >
              {procesando ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Cobrar...</span>
                </>
              ) : esFiado ? (
                "Confirmar Fiado"
              ) : (
                "Confirmar Cobro"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
