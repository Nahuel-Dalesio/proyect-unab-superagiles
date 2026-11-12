import { useCallback, useContext, useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import {
  getUsuarios,
  actualizarUsuario,
  desactivarUsuario,
} from "@/service/usuario.service";
import { Button } from "@/components/ui/button";
import { UsuariosTable } from "@/components/UsuariosTable";
import { NuevoUsuarioModal } from "@/components/NuevoUsuarioModal";
import { EditarUsuarioModal } from "@/components/EditarUsuarioModal";
import { showError, showSuccess } from "@/utils/alerts";

export default function Usuarios() {
  const { user } = useContext(AuthContext);

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Modales
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [usuarioAEditar, setUsuarioAEditar] = useState(null);

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    try {
      const data = await getUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(
        error.status
          ? error.message
          : "Error de conexión al obtener los usuarios"
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  // Alternar estado activo / inactivo contra el backend
  const handleToggleActivo = async (usuario) => {
    if (!usuario) return;

    const nuevoEstado = !usuario.activo;

    try {
      if (nuevoEstado) {
        await actualizarUsuario(usuario.idUsuario, { activo: true });
      } else {
        await desactivarUsuario(usuario.idUsuario);
      }

      setUsuarios((prev) =>
        prev.map((u) =>
          u.idUsuario === usuario.idUsuario ? { ...u, activo: nuevoEstado } : u
        )
      );

      showSuccess(
        `Usuario "@${usuario.username}" ${
          nuevoEstado ? "activado" : "desactivado"
        } correctamente.`,
        "Estado actualizado"
      );
    } catch (error) {
      showError(
        error.status
          ? error.message
          : "Error al actualizar el estado del usuario"
      );
    }
  };

  // Editar usuario
  const handleAbrirEditar = (usuario) => {
    setUsuarioAEditar(usuario);
    setModalEditarAbierto(true);
  };

  // Filtrado de usuarios por username, rol o ID
  const usuariosFiltrados = usuarios.filter((u) => {
    const term = busqueda.toLowerCase().trim();
    if (!term) return true;
    return (
      (u.username && u.username.toLowerCase().includes(term)) ||
      (u.rol && u.rol.toLowerCase().includes(term)) ||
      (u.idUsuario && String(u.idUsuario).includes(term))
    );
  });

  return (
    <div className="flex flex-1 flex-col w-full min-h-0 overflow-hidden">
      {/* Encabezado con título y botón de alta */}
      <div className="mb-4 sm:mb-6 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex flex-row items-center min-w-0">
          <Users
            strokeWidth={1.5}
            className="size-12 p-2 border border-border rounded-lg bg-card shrink-0"
          />
          <div className="px-3 min-w-0">
            <div className="text-lg font-semibold">Usuarios</div>
            <div className="text-sm text-muted-foreground truncate">
              Gestión de cuentas de acceso y permisos del personal
            </div>
          </div>
        </div>

        <Button
          variant="accent"
          onClick={() => setModalNuevoAbierto(true)}
          className="gap-2 font-medium h-10 px-4 w-full sm:w-auto max-w-none cursor-pointer"
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
          placeholder="Buscar por usuario o rol..."
          className="w-full sm:w-1/3 lg:w-1/4 sm:min-w-72 rounded-md border border-border bg-input px-4 py-2.5 text-sm outline-none shadow-2xs placeholder:text-muted-foreground"
        />
      </form>

      {/* Tabla de Usuarios */}
      <UsuariosTable
        usuarios={usuariosFiltrados}
        cargando={cargando}
        currentUserId={user?.id}
        onEditarUsuario={handleAbrirEditar}
        onToggleActivo={handleToggleActivo}
      />

      {/* Modal para nuevo usuario */}
      <NuevoUsuarioModal
        open={modalNuevoAbierto}
        onOpenChange={setModalNuevoAbierto}
        onSuccess={cargarUsuarios}
      />

      {/* Modal para editar usuario */}
      <EditarUsuarioModal
        open={modalEditarAbierto}
        onOpenChange={setModalEditarAbierto}
        usuario={usuarioAEditar}
        currentUserId={user?.id}
        onSuccess={cargarUsuarios}
      />
    </div>
  );
}
