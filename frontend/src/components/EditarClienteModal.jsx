import { useEffect, useState } from "react";
import { Loader2, RotateCcw, UserCheck, Wallet } from "lucide-react";
import {
  actualizarCliente,
  MONTOS_CUENTA_CORRIENTE,
} from "@/service/cliente.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

const formatoMontoCorto = (valor) =>
  `$${Number(valor || 0).toLocaleString("es-AR")}`;

export function EditarClienteModal({
  open,
  onOpenChange,
  cliente,
  onSuccess,
}) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    tipo_documento: "DNI",
    numero_documento: "",
    email: "",
    telefono: "",
    direccion: "",
    limite_credito: 0,
    deuda_actual: 0,
    activo: true,
  });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (cliente && open) {
      const habilitada = Boolean(cliente.cuenta_corriente_habilitada);
      const limite = habilitada ? Number(cliente.limite_credito || 0) : 0;

      setForm({
        nombre: cliente.nombre || "",
        apellido: cliente.apellido || "",
        tipo_documento: cliente.tipo_documento || "DNI",
        numero_documento: String(cliente.numero_documento || "").replace(/\D/g, ""),
        email: cliente.email || "",
        telefono: String(cliente.telefono || "").replace(/\D/g, ""),
        direccion: cliente.direccion || "",
        limite_credito: limite,
        deuda_actual: Number(cliente.deuda_actual || 0),
        activo: Boolean(cliente.activo ?? true),
      });
    }
  }, [cliente, open]);

  const cerrarModal = () => {
    if (!guardando) {
      onOpenChange(false);
    }
  };

  const handleSeleccionarMontoCuenta = (monto) => {
    const nuevoLimite = Number(monto) || 0;
    // Si el nuevo límite es menor a la deuda actual (o se quita la cuenta), reiniciamos deuda_actual a 0
    const nuevaDeuda =
      nuevoLimite < Number(form.deuda_actual) ? 0 : Number(form.deuda_actual);

    setForm({
      ...form,
      limite_credito: nuevoLimite,
      deuda_actual: nuevaDeuda,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cliente) return;

    const nombre = form.nombre.trim();
    const apellido = form.apellido.trim();
    const numero_documento = form.numero_documento.trim();
    const telefono = form.telefono.trim();
    const limiteCredito = Number(form.limite_credito) || 0;
    const deudaActual = limiteCredito > 0 ? Number(form.deuda_actual) || 0 : 0;

    if (!nombre) {
      showWarning("El nombre del cliente es obligatorio.");
      return;
    }

    if (!numero_documento) {
      showWarning("El número de documento es obligatorio.");
      return;
    }

    if (!/^\d+$/.test(numero_documento)) {
      showWarning("El número de documento debe contener únicamente números.");
      return;
    }

    if (telefono && !/^\d+$/.test(telefono)) {
      showWarning("El teléfono debe contener únicamente números.");
      return;
    }

    setGuardando(true);

    try {
      const data = await actualizarCliente(cliente.id_cliente, {
        nombre,
        apellido,
        tipo_documento: form.tipo_documento,
        numero_documento,
        email: form.email.trim(),
        telefono,
        direccion: form.direccion.trim(),
        cuenta_corriente_habilitada: limiteCredito > 0,
        limite_credito: limiteCredito,
        deuda_actual: deudaActual,
        activo: form.activo,
      });

      onOpenChange(false);
      showSuccess(
        `Cliente "${nombre}${apellido ? ` ${apellido}` : ""}" actualizado correctamente.`,
        "Cambios Guardados"
      );

      if (onSuccess) {
        await onSuccess(data?.client);
      }
    } catch (error) {
      showError(
        error.status ? error.message : "Error al actualizar el cliente"
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

  const saldoDisponible = Math.max(
    0,
    Number(form.limite_credito || 0) - Number(form.deuda_actual || 0)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        onInteractOutside={ignorarSiEsCartel}
        onFocusOutside={ignorarSiEsCartel}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-accent/10 text-accent rounded-lg shrink-0">
              <UserCheck className="size-5" />
            </div>
            <div>
              <DialogTitle>Editar Cliente</DialogTitle>
              <DialogDescription>
                Modificá la información de contacto, facturación y cuenta corriente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="editClienteNombre">Nombre *</Label>
              <Input
                id="editClienteNombre"
                maxLength={100}
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editClienteApellido">Apellido</Label>
              <Input
                id="editClienteApellido"
                maxLength={100}
                value={form.apellido}
                onChange={(e) => setForm({ ...form, apellido: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="editTipoDocumento">Tipo Doc. *</Label>
              <select
                id="editTipoDocumento"
                value={form.tipo_documento}
                onChange={(e) =>
                  setForm({ ...form, tipo_documento: e.target.value })
                }
                className="h-8 w-full rounded-lg border border-border bg-input px-2.5 py-1 text-sm text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none transition-colors"
                required
              >
                <option value="DNI">DNI</option>
                <option value="CUIT">CUIT</option>
                <option value="CUIL">CUIL</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="editNumeroDocumento">Número de Documento *</Label>
              <Input
                id="editNumeroDocumento"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={20}
                value={form.numero_documento}
                onChange={(e) =>
                  setForm({
                    ...form,
                    numero_documento: e.target.value.replace(/\D/g, ""),
                  })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="editClienteTelefono">Teléfono</Label>
              <Input
                id="editClienteTelefono"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={30}
                value={form.telefono}
                onChange={(e) =>
                  setForm({
                    ...form,
                    telefono: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editClienteEmail">Correo electrónico</Label>
              <Input
                id="editClienteEmail"
                type="email"
                maxLength={100}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editClienteDireccion">Dirección</Label>
            <Input
              id="editClienteDireccion"
              maxLength={255}
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            />
          </div>

          {/* Configuración de Cuenta Corriente con montos fijos */}
          <div className="space-y-2.5 rounded-lg border border-border bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Wallet className="size-4 text-accent" />
                <span>Cuenta Corriente (Saldo para Fiado)</span>
              </Label>
              <span className="text-xs font-semibold text-accent">
                {Number(form.limite_credito) > 0
                  ? `Límite: ${formatoMontoCorto(form.limite_credito)}`
                  : "Sin cuenta corriente"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              <Button
                type="button"
                size="sm"
                variant={Number(form.limite_credito) === 0 ? "accent" : "outline"}
                onClick={() => handleSeleccionarMontoCuenta(0)}
                className="w-full max-w-none text-xs cursor-pointer"
              >
                Sin cuenta
              </Button>
              {MONTOS_CUENTA_CORRIENTE.map((monto) => (
                <Button
                  key={monto}
                  type="button"
                  size="sm"
                  variant={
                    Number(form.limite_credito) === monto ? "accent" : "outline"
                  }
                  onClick={() => handleSeleccionarMontoCuenta(monto)}
                  className="w-full max-w-none text-xs cursor-pointer"
                >
                  {formatoMontoCorto(monto)}
                </Button>
              ))}
            </div>

            {Number(form.limite_credito) > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/80 bg-card px-3 py-2 text-xs">
                <div className="space-y-0.5">
                  <div>
                    <span className="text-muted-foreground">Saldo disponible: </span>
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {formatoMoneda(saldoDisponible)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Consumido (fiado): </span>
                    <strong className="text-foreground">
                      {formatoMoneda(form.deuda_actual)}
                    </strong>
                  </div>
                </div>

                {Number(form.deuda_actual) > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setForm({ ...form, deuda_actual: 0 })}
                    className="h-7 px-2.5 text-xs gap-1 max-w-none cursor-pointer"
                  >
                    <RotateCcw className="size-3" />
                    <span>Saldar deuda / Restablecer</span>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Switch para activar / desactivar */}
          <div className="flex items-center justify-between gap-2 rounded-lg border p-3 bg-muted/20">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Estado del cliente</Label>
              <p className="text-xs text-muted-foreground">
                {form.activo
                  ? "Cliente habilitado para compras y facturación"
                  : "Cliente inactivo / deshabilitado"}
              </p>
            </div>
            <Switch
              checked={form.activo}
              onCheckedChange={(checked) => setForm({ ...form, activo: checked })}
            />
          </div>

          <DialogFooter className="pt-2">
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
                "Guardar Cambios"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditarClienteModal;
