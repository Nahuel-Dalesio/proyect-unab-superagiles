import { useEffect, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { crearCliente } from "@/service/cliente.service";
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

const FORM_INICIAL = {
  nombre: "",
  apellido: "",
  tipo_documento: "DNI",
  numero_documento: "",
  email: "",
  telefono: "",
  direccion: "",
};

export function NuevoClienteModal({ open, onOpenChange, onSuccess }) {
  const [form, setForm] = useState(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(FORM_INICIAL);
    }
  }, [open]);

  const cerrarModal = () => {
    if (!guardando) {
      setForm(FORM_INICIAL);
      onOpenChange(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const data = await crearCliente({
        nombre,
        apellido,
        tipo_documento: form.tipo_documento,
        numero_documento,
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim(),
      });

      onOpenChange(false);
      showSuccess(
        `Cliente "${nombre}${apellido ? ` ${apellido}` : ""}" registrado con éxito.`,
        "Cliente Creado"
      );

      if (onSuccess) {
        await onSuccess(data?.client);
      }
    } catch (error) {
      showError(
        error.status ? error.message : "Error al registrar el cliente"
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
              <UserPlus className="size-5" />
            </div>
            <div>
              <DialogTitle>Nuevo Cliente</DialogTitle>
              <DialogDescription>
                Ingresá los datos del cliente para la emisión de facturas y registros.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nuevoClienteNombre">Nombre *</Label>
              <Input
                id="nuevoClienteNombre"
                placeholder="Ej: Homero"
                maxLength={100}
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nuevoClienteApellido">Apellido</Label>
              <Input
                id="nuevoClienteApellido"
                placeholder="Ej: Simpson"
                maxLength={100}
                value={form.apellido}
                onChange={(e) => setForm({ ...form, apellido: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tipoDocumento">Tipo Doc. *</Label>
              <select
                id="tipoDocumento"
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
              <Label htmlFor="numeroDocumento">Número de Documento *</Label>
              <Input
                id="numeroDocumento"
                placeholder="Ej: 12345678 o 20-12345678-9"
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
              <Label htmlFor="nuevoClienteTelefono">Teléfono</Label>
              <Input
                id="nuevoClienteTelefono"
                placeholder="Ej: 11-4567-8901"
                maxLength={30}
                value={form.telefono}
                onChange={(e) =>
                  setForm({ ...form, telefono: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nuevoClienteEmail">Correo electrónico</Label>
              <Input
                id="nuevoClienteEmail"
                type="email"
                placeholder="Ej: homero@springfield.com"
                maxLength={100}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nuevoClienteDireccion">Dirección</Label>
            <Input
              id="nuevoClienteDireccion"
              placeholder="Ej: Avenida Siempreviva 742"
              maxLength={255}
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
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
                "Guardar Cliente"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default NuevoClienteModal;
