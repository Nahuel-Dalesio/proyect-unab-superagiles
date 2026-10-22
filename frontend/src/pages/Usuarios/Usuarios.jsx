import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsuariosTable } from "@/components/UsuariosTable";
import { NuevoUsuarioModal } from "@/components/NuevoUsuarioModal";
import { EditarUsuarioModal } from "@/components/EditarUsuarioModal";
import { MOCK_USUARIOS } from "@/mocks/usuarios.mock";
import { showSuccess } from "@/utils/alerts";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState(MOCK_USUARIOS);
  const [busqueda, setBusqueda] = useState("");

  // Modales
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [usuarioAEditar, setUsuarioAEditar] = useState(null);

  // Alternar estado activo / inactivo directamente desde la tabla
  const handleToggleActivo = (idUsuario) => {
    setUsuarios((prev) =>
      prev.map((u) => {
        if (u.idUsuario === idUsuario) {
          const nuevoEstado = !u.activo;
          showSuccess(
            `Usuario "${u.username}" ${
              nuevoEstado ? "activado" : "desactivado"
            } correctamente.`,
            "Estado actualizado"
          );
          return { ...u, activo: nuevoEstado };
        }
        return u;
      })
    );
  };

  // Crear usuario
  const handleCrearUsuario = (nuevoUsuario) => {
    setUsuarios((prev) => [nuevoUsuario, ...prev]);
    showSuccess(
      `Usuario "${nuevoUsuario.username}" registrado exitosamente.`,
      "Usuario Creado"
    );
  };

  // Editar usuario
  const handleAbrirEditar = (usuario) => {
    setUsuarioAEditar(usuario);
    setModalEditarAbierto(true);
  };

  const handleGuardarEdicion = (usuarioActualizado) => {
    setUsuarios((prev) =>
      prev.map((u) =>
        u.idUsuario === usuarioActualizado.idUsuario ? usuarioActualizado : u
      )
    );
    showSuccess(
      `Usuario "${usuarioActualizado.username}" actualizado correctamente.`,
      "Cambios Guardados"
    );
  };

  // Filtrado de usuarios
  const usuariosFiltrados = usuarios.filter((u) => {
    const term = busqueda.toLowerCase().trim();
    if (!term) return true;
    return (
      (u.nombre && u.nombre.toLowerCase().includes(term)) ||
      (u.username && u.username.toLowerCase().includes(term)) ||
      (u.rol && u.rol.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term))
    );
  });

  return (
    <div className="flex flex-1 flex-col w-full min-h-0 overflow-hidden">
      {/* Encabezado con título y botón de alta */}
      <div className="mb-6 flex shrink-0 items-center justify-between gap-4">
        <div className="flex flex-row items-center">
          <Users
            strokeWidth={1.5}
            className="size-12 p-2 border border-border rounded-lg bg-card shrink-0 text-accent"
          />
          <div className="px-3">
            <div className="text-lg font-semibold">Usuarios</div>
            <div className="text-sm text-muted-foreground">
              Gestión de cuentas de acceso y permisos del personal
            </div>
          </div>
        </div>

        <Button
          variant="accent"
          onClick={() => setModalNuevoAbierto(true)}
          className="gap-2 font-medium h-10 px-4 cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Nuevo Usuario</span>
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <form onSubmit={(e) => e.preventDefault()} className="mb-4 shrink-0">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por usuario, nombre, rol o email..."
          className="w-1/4 min-w-72 rounded-md border bg-card px-4 py-2.5 text-sm outline-none shadow-2xs placeholder:text-muted-foreground"
        />
      </form>

      {/* Tabla de Usuarios */}
      <UsuariosTable
        usuarios={usuariosFiltrados}
        onEditarUsuario={handleAbrirEditar}
        onToggleActivo={handleToggleActivo}
      />

      {/* Modal para nuevo usuario */}
      <NuevoUsuarioModal
        open={modalNuevoAbierto}
        onOpenChange={setModalNuevoAbierto}
        onGuardar={handleCrearUsuario}
      />

      {/* Modal para editar usuario */}
      <EditarUsuarioModal
        open={modalEditarAbierto}
        onOpenChange={setModalEditarAbierto}
        usuario={usuarioAEditar}
        onGuardar={handleGuardarEdicion}
      />
    </div>
  );
}
