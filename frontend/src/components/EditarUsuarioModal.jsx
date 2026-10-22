import { useEffect, useState } from "react";
import { UserCheck } from "lucide-react";
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

export function EditarUsuarioModal({
  open,
  onOpenChange,
  usuario,
  onGuardar,
}) {
  const [form, setForm] = useState({
    nombre: "",
    username: "",
    email: "",
    rol: "cajero",
    password: "",
    activo: true,
  });

  useEffect(() => {
    if (usuario && open) {
      setForm({
        nombre: usuario.nombre || "",
        username: usuario.username || "",
        email: usuario.email || "",
        rol: usuario.rol || "cajero",
        password: "",
        activo: usuario.activo ?? true,
      });
    }
  }, [usuario, open]);

  const cerrarModal = () => {
    onOpenChange(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!usuario) return;

    if (!form.username.trim()) {
      showWarning("El nombre de usuario no puede quedar vacío.");
      return;
    }

    onGuardar({
      ...usuario,
      nombre: form.nombre.trim(),
      username: form.username.trim().toLowerCase(),
      email: form.email.trim(),
      rol: form.rol,
      activo: form.activo,
    });

    cerrarModal();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-accent/10 text-accent rounded-lg">
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
          <div className="space-y-1.5">
            <Label htmlFor="editNombre">Nombre completo</Label>
            <Input
              id="editNombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="editUsername">Usuario *</Label>
              <Input
                id="editUsername"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editRol">Rol *</Label>
              <select
                id="editRol"
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
            <Label htmlFor="editEmail">Correo electrónico</Label>
            <Input
              id="editEmail"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editPassword">
              Nueva contraseña{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (opcional)
              </span>
            </Label>
            <Input
              id="editPassword"
              type="password"
              placeholder="Dejar en blanco para mantener actual"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {/* Switch para activar / desactivar */}
          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Estado del usuario</Label>
              <p className="text-xs text-muted-foreground">
                {form.activo
                  ? "Usuario habilitado para operar en el sistema"
                  : "Usuario deshabilitado (acceso bloqueado)"}
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
            <Button type="submit" variant="accent">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditarUsuarioModal;
