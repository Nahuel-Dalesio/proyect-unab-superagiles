import { useCallback, useContext, useEffect, useState } from "react";
import { Plus, UserCheck } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { ROLES } from "@/utils/roles";
import {
  getClientes,
  actualizarCliente,
  desactivarCliente,
} from "@/service/cliente.service";
import { Button } from "@/components/ui/button";
import { ClientesTable } from "@/components/ClientesTable";
import { NuevoClienteModal } from "@/components/NuevoClienteModal";
import { EditarClienteModal } from "@/components/EditarClienteModal";
import { showError, showSuccess } from "@/utils/alerts";

export default function Clientes() {
  const { user } = useContext(AuthContext);
  const esGestor =
    !user || user.rol === ROLES.ADMIN || user.rol === ROLES.ENCARGADO;

  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Modales
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [clienteAEditar, setClienteAEditar] = useState(null);

  const cargarClientes = useCallback(async () => {
    setCargando(true);
    try {
      const data = await getClientes();
      setClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(
        error.status ? error.message : "Error de conexión al obtener los clientes"
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  // Alternar estado activo / inactivo contra el backend
  const handleToggleActivo = async (cliente) => {
    if (!cliente || !esGestor) return;

    const nuevoEstado = !cliente.activo;

    try {
      if (nuevoEstado) {
        await actualizarCliente(cliente.id_cliente, { activo: true });
      } else {
        await desactivarCliente(cliente.id_cliente);
      }

      setClientes((prev) =>
        prev.map((c) =>
          c.id_cliente === cliente.id_cliente
            ? { ...c, activo: nuevoEstado }
            : c
        )
      );

      showSuccess(
        `Cliente "${cliente.nombre}${cliente.apellido ? ` ${cliente.apellido}` : ""}" ${
          nuevoEstado ? "activado" : "desactivado"
        } correctamente.`,
        "Estado actualizado"
      );
    } catch (error) {
      showError(
        error.status ? error.message : "Error al actualizar el estado del cliente"
      );
    }
  };

  // Editar cliente
  const handleAbrirEditar = (cliente) => {
    setClienteAEditar(cliente);
    setModalEditarAbierto(true);
  };

  // Filtrado de clientes
  const clientesFiltrados = clientes.filter((c) => {
    const term = busqueda.toLowerCase().trim();
    if (!term) return true;
    return (
      (c.nombre && c.nombre.toLowerCase().includes(term)) ||
      (c.apellido && c.apellido.toLowerCase().includes(term)) ||
      (c.numero_documento &&
        String(c.numero_documento).toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.telefono && String(c.telefono).toLowerCase().includes(term))
    );
  });

  return (
    <div className="flex flex-1 flex-col w-full min-h-0 overflow-hidden">
      {/* Encabezado con título y botón de alta */}
      <div className="mb-6 flex shrink-0 items-center justify-between gap-4">
        <div className="flex flex-row items-center">
          <UserCheck
            strokeWidth={1.5}
            className="size-12 p-2 border border-border rounded-lg bg-card shrink-0 text-accent"
          />
          <div className="px-3">
            <div className="text-lg font-semibold">Clientes</div>
            <div className="text-sm text-muted-foreground">
              Gestión de clientes y datos de facturación
            </div>
          </div>
        </div>

        <Button
          variant="accent"
          onClick={() => setModalNuevoAbierto(true)}
          className="gap-2 font-medium h-10 px-4 cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Nuevo Cliente</span>
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <form onSubmit={(e) => e.preventDefault()} className="mb-4 shrink-0">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar cliente por nombre, apellido, documento o email..."
          className="w-1/4 min-w-72 rounded-md border border-border bg-input px-4 py-2.5 text-sm outline-none shadow-2xs placeholder:text-muted-foreground"
        />
      </form>

      {/* Tabla de Clientes */}
      <ClientesTable
        clientes={clientesFiltrados}
        cargando={cargando}
        esGestor={esGestor}
        onEditarCliente={handleAbrirEditar}
        onToggleActivo={handleToggleActivo}
      />

      {/* Modal para nuevo cliente */}
      <NuevoClienteModal
        open={modalNuevoAbierto}
        onOpenChange={setModalNuevoAbierto}
        onSuccess={cargarClientes}
      />

      {/* Modal para editar cliente */}
      <EditarClienteModal
        open={modalEditarAbierto}
        onOpenChange={setModalEditarAbierto}
        cliente={clienteAEditar}
        onSuccess={cargarClientes}
      />
    </div>
  );
}
