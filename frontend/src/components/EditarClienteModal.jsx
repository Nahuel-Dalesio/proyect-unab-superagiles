import { useEffect, useState } from "react";
import { Loader2, UserCheck } from "lucide-react";
import { actualizarCliente } from "@/service/cliente.service";
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
    activo: true,
  });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (cliente && open) {
      setForm({
        nombre: cliente.nombre || "",
        apellido: cliente.apellido || "",
        tipo_documento: cliente.tipo_documento || "DNI",
        numero_documento: cliente.numero_documento || "",
        email: cliente.email || "",
        telefono: cliente.telefono || "",
        direccion: cliente.direccion || "",
        activo: Boolean(cliente.activo ?? true),
      });
    }
  }, [cliente, open]);

  const cerrarModal = () => {
    if (!guardando) {
      onOpenChange(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cliente) return;

    const nombre = form.nombre.trim();
    const apellido = form.apellido.trim();
    const numero_documento = form.numero_documento.trim();

    if (!nombre) {
      showWarning("El nombre del cliente es obligatorio.");
      return;
    }

    if (!numero_documento) {
      showWarning("El número de documento es obligatorio.");
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
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim(),
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        onInteractOutside={ignorarSiEsCartel}
        onFocusOutside={ignorarSiEsCartel}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-accent/10 text-accent rounded-lg">
              <UserCheck className="size-5" />
            </div>
            <div>
              <DialogTitle>Editar Cliente</DialogTitle>
              <DialogDescription>
                Modificá la información de contacto y facturación del cliente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
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

          <div className="grid grid-cols-3 gap-3">
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

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="editNumeroDocumento">Número de Documento *</Label>
              <Input
                id="editNumeroDocumento"
                maxLength={20}
                value={form.numero_documento}
                onChange={(e) =>
                  setForm({ ...form, numero_documento: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="editClienteTelefono">Teléfono</Label>
              <Input
                id="editClienteTelefono"
                maxLength={30}
                value={form.telefono}
                onChange={(e) =>
                  setForm({ ...form, telefono: e.target.value })
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

          {/* Switch para activar / desactivar */}
          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
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
