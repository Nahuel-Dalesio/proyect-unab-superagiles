import { useState } from "react";
import { UserPlus } from "lucide-react";
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
import { showWarning } from "@/utils/alerts";

const FORM_INICIAL = {
  nombre: "",
  username: "",
  email: "",
  rol: "cajero",
  password: "",
  confirmPassword: "",
  activo: true,
};

export function NuevoUsuarioModal({ open, onOpenChange, onGuardar }) {
  const [form, setForm] = useState(FORM_INICIAL);

  const cerrarModal = () => {
    setForm(FORM_INICIAL);
    onOpenChange(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.username.trim()) {
      showWarning("El nombre de usuario es obligatorio.");
      return;
    }

    if (!form.password) {
      showWarning("La contraseña es obligatoria.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      showWarning("Las contraseñas no coinciden.");
      return;
    }

    onGuardar({
      idUsuario: Date.now(),
      nombre: form.nombre.trim(),
      username: form.username.trim().toLowerCase(),
      email: form.email.trim(),
      rol: form.rol,
      activo: form.activo,
      creadoEn: new Date().toLocaleDateString("es-AR"),
    });

    cerrarModal();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <div className="space-y-1.5">
            <Label htmlFor="nuevoNombre">Nombre completo</Label>
            <Input
              id="nuevoNombre"
              placeholder="Ej: Apu Nahasapeemapetilon"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nuevoUsername">Usuario *</Label>
              <Input
                id="nuevoUsername"
                placeholder="Ej: apu"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nuevoRol">Rol en el sistema *</Label>
              <select
                id="nuevoRol"
                value={form.rol}
                onChange={(e) => setForm({ ...form, rol: e.target.value })}
                className="h-8 w-full rounded-lg border border-input bg-card px-2.5 py-1 text-sm text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none transition-colors"
                required
              >
                <option value="cajero">Cajero</option>
                <option value="encargado">Encargado</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nuevoEmail">Correo electrónico</Label>
            <Input
              id="nuevoEmail"
              type="email"
              placeholder="Ej: usuario@kwik-e-mart.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nuevoPassword">Contraseña *</Label>
              <Input
                id="nuevoPassword"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nuevoConfirmPassword">Confirmar *</Label>
              <Input
                id="nuevoConfirmPassword"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
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
              onCheckedChange={(checked) => setForm({ ...form, activo: checked })}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={cerrarModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent" className="gap-2">
              <span>Guardar Usuario</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default NuevoUsuarioModal;
