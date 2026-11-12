import { useEffect, useState } from "react";
import { Loader2, UserCheck } from "lucide-react";
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
import { actualizarUsuario } from "@/service/usuario.service";
import { showError, showSuccess, showWarning } from "@/utils/alerts";

export function EditarUsuarioModal({
  open,
  onOpenChange,
  usuario,
  currentUserId = null,
  onSuccess,
}) {
  const [form, setForm] = useState({
    username: "",
    rol: "cajero",
    password: "",
    activo: true,
  });
  const [guardando, setGuardando] = useState(false);

  const esUsuarioActual =
    usuario && Number(currentUserId) === Number(usuario.idUsuario);

  useEffect(() => {
    if (usuario && open) {
      setForm({
        username: usuario.username || "",
        rol: usuario.rol || "cajero",
        password: "",
        activo: Boolean(usuario.activo ?? true),
      });
    }
  }, [usuario, open]);

  const cerrarModal = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuario) return;

    const usernameLimpio = form.username.trim().toLowerCase();

    if (!usernameLimpio) {
      showWarning("El nombre de usuario no puede quedar vacío.");
      return;
    }

    if (usernameLimpio.length > 50) {
      showWarning("El nombre de usuario admite hasta 50 caracteres.");
      return;
    }

    if (form.password && form.password.length < 8) {
      showWarning("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    const cambios = {
      username: usernameLimpio,
      rol: form.rol,
      activo: form.activo,
    };

    if (form.password) {
      cambios.password = form.password;
    }

    setGuardando(true);
    try {
      const response = await actualizarUsuario(usuario.idUsuario, cambios);
      const usuarioActualizado = response?.user || response;

      showSuccess(
        `Usuario "@${usuarioActualizado.username || usernameLimpio}" actualizado correctamente.`,
        "Cambios Guardados"
      );

      cerrarModal();
      onSuccess?.(usuarioActualizado);
    } catch (error) {
      showError(error.message || "No se pudo actualizar el usuario.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-accent/10 text-accent rounded-lg shrink-0">
              <UserCheck className="size-5" />
            </div>
            <div>
              <DialogTitle>Editar Usuario</DialogTitle>
              <DialogDescription>
                Modificá la información y permisos de la cuenta.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="editUsername">Usuario *</Label>
              <Input
                id="editUsername"
                maxLength={50}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                disabled={guardando}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editRol">Rol *</Label>
              <select
                id="editRol"
                value={form.rol}
                onChange={(e) => setForm({ ...form, rol: e.target.value })}
                disabled={guardando}
                className="h-8 w-full rounded-lg border border-border bg-input px-2.5 py-1 text-sm text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none transition-colors"
                required
              >
                <option value="cajero">Cajero</option>
                <option value="encargado">Encargado</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editPassword">
              Nueva contraseña{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (opcional, mínimo 8 caracteres)
              </span>
            </Label>
            <Input
              id="editPassword"
              type="password"
              placeholder="Dejar en blanco para mantener actual"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={guardando}
            />
          </div>

          {/* Switch para activar / desactivar */}
          <div className="flex items-center justify-between gap-2 rounded-lg border p-3 bg-muted/20">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Estado del usuario</Label>
              <p className="text-xs text-muted-foreground">
                {esUsuarioActual
                  ? "No podés desactivar tu propia cuenta"
                  : form.activo
                  ? "Usuario habilitado para operar en el sistema"
                  : "Usuario deshabilitado (acceso bloqueado)"}
              </p>
            </div>
            <Switch
              checked={form.activo}
              disabled={guardando || (esUsuarioActual && form.activo)}
              onCheckedChange={(checked) =>
                setForm({ ...form, activo: checked })
              }
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
              className="gap-2 cursor-pointer"
            >
              {guardando && <Loader2 className="size-4 animate-spin" />}
              <span>{guardando ? "Guardando..." : "Guardar Cambios"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditarUsuarioModal;
