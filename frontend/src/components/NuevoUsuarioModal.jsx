import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
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
import { crearUsuario } from "@/service/usuario.service";
import { showError, showSuccess, showWarning } from "@/utils/alerts";

const FORM_INICIAL = {
  username: "",
  rol: "cajero",
  password: "",
  confirmPassword: "",
  activo: true,
};

export function NuevoUsuarioModal({ open, onOpenChange, onSuccess }) {
  const [form, setForm] = useState(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);

  const cerrarModal = () => {
    setForm(FORM_INICIAL);
    onOpenChange(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const usernameLimpio = form.username.trim().toLowerCase();

    if (!usernameLimpio) {
      showWarning("El nombre de usuario es obligatorio.");
      return;
    }

    if (usernameLimpio.length > 50) {
      showWarning("El nombre de usuario admite hasta 50 caracteres.");
      return;
    }

    if (!form.password) {
      showWarning("La contraseña es obligatoria.");
      return;
    }

    if (form.password.length < 8) {
      showWarning("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      showWarning("Las contraseñas no coinciden.");
      return;
    }

    setGuardando(true);
    try {
      const response = await crearUsuario({
        username: usernameLimpio,
        password: form.password,
        rol: form.rol,
        activo: form.activo,
      });

      const usuarioCreado = response?.user || response;
      showSuccess(
        `Usuario "@${usuarioCreado.username || usernameLimpio}" registrado exitosamente.`,
        "Usuario Creado"
      );

      cerrarModal();
      onSuccess?.(usuarioCreado);
    } catch (error) {
      showError(error.message || "No se pudo registrar el usuario.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) cerrarModal();
        else onOpenChange(true);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-accent/10 text-accent rounded-lg">
              <UserPlus className="size-5" />
            </div>
            <div>
              <DialogTitle>Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Completá los datos para registrar un usuario en el sistema.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nuevoUsername">Usuario *</Label>
              <Input
                id="nuevoUsername"
                placeholder="Ej: apu"
                maxLength={50}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                disabled={guardando}
                autoFocus
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nuevoRol">Rol en el sistema *</Label>
              <select
                id="nuevoRol"
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nuevoPassword">Contraseña *</Label>
              <Input
                id="nuevoPassword"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={guardando}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nuevoConfirmPassword">Confirmar *</Label>
              <Input
                id="nuevoConfirmPassword"
                type="password"
                placeholder="Repetir contraseña"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                disabled={guardando}
                required
              />
            </div>
          </div>

          {/* Switch para estado inicial */}
          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Usuario activo</Label>
              <p className="text-xs text-muted-foreground">
                Permite o bloquea el inicio de sesión del usuario
              </p>
            </div>
            <Switch
              checked={form.activo}
              disabled={guardando}
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
              <span>{guardando ? "Guardando..." : "Guardar Usuario"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default NuevoUsuarioModal;
