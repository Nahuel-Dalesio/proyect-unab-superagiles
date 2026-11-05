import { useEffect, useState } from "react";
import { Check, Search, UserPlus, X } from "lucide-react";
import { getClientes } from "@/service/cliente.service";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegistroCliente({ value, onChange, disabled = false }) {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const clienteSeleccionado = value?.clienteSeleccionado ?? null;
  const registrarNuevo = value?.registrarNuevo ?? false;
  const nuevoCliente = value?.nuevoCliente ?? {
    nombre: "",
    apellido: "",
    tipo_documento: "DNI",
    numero_documento: "",
  };

  useEffect(() => {
    let activo = true;
    getClientes()
      .then((data) => {
        if (activo && Array.isArray(data)) {
          setClientes(data.filter((c) => c.activo));
        }
      })
      .catch(() => {
        // Silencioso en caso de fallo de red
      });

    return () => {
      activo = false;
    };
  }, []);

  const actualizar = (parcial) => {
    onChange?.({
      clienteSeleccionado,
      registrarNuevo,
      nuevoCliente,
      ...parcial,
    });
  };

  const handleCambioNuevo = (campo, valor) => {
    actualizar({
      clienteSeleccionado: null,
      nuevoCliente: {
        ...nuevoCliente,
        [campo]: valor,
      },
    });
  };

  const termino = busqueda.trim().toLowerCase();
  const sugerencias = termino
    ? clientes
        .filter(
          (c) =>
            String(c.numero_documento ?? "")
              .toLowerCase()
              .includes(termino) ||
            `${c.nombre ?? ""} ${c.apellido ?? ""}`
              .toLowerCase()
              .includes(termino)
        )
        .slice(0, 5)
    : [];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-3">
      {/* Buscador de cliente existente */}
      {!registrarNuevo && (
        <div className="relative">
          <Label className="mb-1 block text-xs">
            Buscar cliente registrado (por DNI/CUIT o nombre)
          </Label>
          {clienteSeleccionado ? (
            <div className="flex items-center justify-between rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <Check className="size-4 text-accent shrink-0" />
                <span className="font-medium truncate">
                  {clienteSeleccionado.nombre}{" "}
                  {clienteSeleccionado.apellido || ""}
                </span>
                <span className="text-xs font-mono text-muted-foreground shrink-0">
                  ({clienteSeleccionado.tipo_documento}:{" "}
                  {clienteSeleccionado.numero_documento})
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={disabled}
                onClick={() =>
                  actualizar({
                    clienteSeleccionado: null,
                  })
                }
                title="Quitar cliente seleccionado"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ) : (
            <>
              <div className="relative flex items-center">
                <Search className="size-3.5 text-muted-foreground absolute left-2.5 pointer-events-none" />
                <Input
                  type="text"
                  disabled={disabled}
                  value={busqueda}
                  onFocus={() => setMostrarResultados(true)}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setMostrarResultados(true);
                  }}
                  placeholder="Escribí documento o nombre para buscar..."
                  className="pl-8"
                />
              </div>

              {mostrarResultados && sugerencias.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-44 overflow-y-auto rounded-lg border border-border bg-card shadow-md">
                  {sugerencias.map((c) => (
                    <button
                      key={c.id_cliente}
                      type="button"
                      onClick={() => {
                        actualizar({ clienteSeleccionado: c });
                        setBusqueda("");
                        setMostrarResultados(false);
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-muted/60 border-b border-border/50 last:border-b-0 cursor-pointer"
                    >
                      <span className="font-medium text-foreground">
                        {c.nombre} {c.apellido || ""}
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {c.tipo_documento}: {c.numero_documento}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Opción para registrar un cliente nuevo rápido desde Caja */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="registrar-cliente"
          checked={registrarNuevo}
          disabled={disabled}
          onCheckedChange={(checked) =>
            actualizar({
              registrarNuevo: Boolean(checked),
              clienteSeleccionado: checked ? null : clienteSeleccionado,
            })
          }
          className="border-border data-checked:bg-accent data-checked:border-accent"
        />
        <Label
          htmlFor="registrar-cliente"
          className="whitespace-nowrap cursor-pointer text-xs flex items-center gap-1"
        >
          <UserPlus className="size-3.5 text-accent" />
          <span>Registrar cliente nuevo</span>
        </Label>
      </div>

      {registrarNuevo && (
        <div className="flex flex-col gap-3 pt-1">
          <div className="flex justify-between gap-2">
            <div className="w-full">
              <Label className="mb-1 block text-xs">Nombre *</Label>
              <Input
                disabled={disabled}
                placeholder="Ej: Homero"
                value={nuevoCliente.nombre}
                onChange={(e) => handleCambioNuevo("nombre", e.target.value)}
              />
            </div>
            <div className="w-full">
              <Label className="mb-1 block text-xs">Apellido</Label>
              <Input
                disabled={disabled}
                placeholder="Ej: Simpson"
                value={nuevoCliente.apellido}
                onChange={(e) => handleCambioNuevo("apellido", e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 items-end">
            <div className="w-28 shrink-0">
              <Label className="mb-1 block text-xs">Tipo Doc. *</Label>
              <select
                disabled={disabled}
                value={nuevoCliente.tipo_documento}
                onChange={(e) =>
                  handleCambioNuevo("tipo_documento", e.target.value)
                }
                className="h-8 w-full rounded-lg border border-border bg-input px-2.5 py-1 text-sm text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none transition-colors"
              >
                <option value="DNI">DNI</option>
                <option value="CUIT">CUIT</option>
                <option value="CUIL">CUIL</option>
              </select>
            </div>
            <div className="flex-1 min-w-0">
              <Label className="mb-1 block text-xs">N° de Documento *</Label>
              <Input
                disabled={disabled}
                placeholder="Ej: 12345678"
                value={nuevoCliente.numero_documento}
                onChange={(e) =>
                  handleCambioNuevo("numero_documento", e.target.value)
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
