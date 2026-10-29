import { useState } from "react";
import { Plus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientesTable } from "@/components/ClientesTable";
import { NuevoClienteModal } from "@/components/NuevoClienteModal";
import { EditarClienteModal } from "@/components/EditarClienteModal";
import { MOCK_CLIENTES } from "@/mocks/clientes.mock";
import { showSuccess } from "@/utils/alerts";

export default function Clientes() {
  const [clientes, setClientes] = useState(MOCK_CLIENTES);
  const [busqueda, setBusqueda] = useState("");

  // Modales
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [clienteAEditar, setClienteAEditar] = useState(null);

  // Alternar estado activo / inactivo directamente desde la tabla con el switch
  const handleToggleActivo = (idCliente) => {
    setClientes((prev) =>
      prev.map((c) => {
        if (c.id_cliente === idCliente) {
          const nuevoEstado = !c.activo;
          showSuccess(
            `Cliente "${c.nombre} ${c.apellido}" ${
              nuevoEstado ? "activado" : "desactivado"
            } correctamente.`,
            "Estado actualizado"
          );
          return { ...c, activo: nuevoEstado };
        }
        return c;
      })
    );
  };

  // Crear cliente
  const handleCrearCliente = (nuevoCliente) => {
    setClientes((prev) => [nuevoCliente, ...prev]);
    showSuccess(
      `Cliente "${nuevoCliente.nombre} ${nuevoCliente.apellido}" registrado con éxito.`,
      "Cliente Creado"
    );
  };

  // Editar cliente
  const handleAbrirEditar = (cliente) => {
    setClienteAEditar(cliente);
    setModalEditarAbierto(true);
  };

  const handleGuardarEdicion = (clienteActualizado) => {
    setClientes((prev) =>
      prev.map((c) =>
        c.id_cliente === clienteActualizado.id_cliente ? clienteActualizado : c
      )
    );
    showSuccess(
      `Cliente "${clienteActualizado.nombre} ${clienteActualizado.apellido}" actualizado correctamente.`,
      "Cambios Guardados"
    );
  };

  // Filtrado de clientes
  const clientesFiltrados = clientes.filter((c) => {
    const term = busqueda.toLowerCase().trim();
    if (!term) return true;
    return (
      (c.nombre && c.nombre.toLowerCase().includes(term)) ||
      (c.apellido && c.apellido.toLowerCase().includes(term)) ||
      (c.numero_documento && c.numero_documento.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.telefono && c.telefono.toLowerCase().includes(term))
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
        onEditarCliente={handleAbrirEditar}
        onToggleActivo={handleToggleActivo}
      />

      {/* Modal para nuevo cliente */}
      <NuevoClienteModal
        open={modalNuevoAbierto}
        onOpenChange={setModalNuevoAbierto}
        onGuardar={handleCrearCliente}
      />

      {/* Modal para editar cliente */}
      <EditarClienteModal
        open={modalEditarAbierto}
        onOpenChange={setModalEditarAbierto}
        cliente={clienteAEditar}
        onGuardar={handleGuardarEdicion}
      />
    </div>
  );
}
