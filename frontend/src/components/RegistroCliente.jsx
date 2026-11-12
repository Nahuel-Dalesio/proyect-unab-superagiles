import { useEffect, useState } from "react";
import { AlertTriangle, Check, Search, UserPlus, Wallet, X } from "lucide-react";
import {
  getClientes,
  MONTOS_CUENTA_CORRIENTE,
} from "@/service/cliente.service";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const formatoPrecio = (valor) =>
  `$${Number(valor || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatoMontoCorto = (valor) =>
  `$${Number(valor || 0).toLocaleString("es-AR")}`;

export default function RegistroCliente({
  value,
  onChange,
  disabled = false,
  modoFiado = false,
  totalCompra = 0,
}) {
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
    telefono: "",
    email: "",
    limite_credito: 0,
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

  const disponibleClienteSeleccionado = clienteSeleccionado
    ? Number(
        clienteSeleccionado.credito_disponible ??
          Math.max(
            0,
            Number(clienteSeleccionado.limite_credito || 0) -
              Number(clienteSeleccionado.deuda_actual || 0)
          )
      )
    : 0;

  const saldoRestanteSeleccionado = Math.round(
    (disponibleClienteSeleccionado - Number(totalCompra || 0)) * 100
  ) / 100;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-3">
      {/* Buscador de cliente existente */}
      {!registrarNuevo && (
        <div className="relative">
          <Label className="mb-1 block text-xs">
            {modoFiado
              ? "Seleccionar cliente para descontar de su Cuenta Corriente *"
              : "Buscar cliente registrado (por DNI/CUIT o nombre)"}
          </Label>
          {clienteSeleccionado ? (
            <div className="flex flex-col gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-2">
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

              {/* Resumen de Cuenta Corriente del cliente seleccionado */}
              {clienteSeleccionado.cuenta_corriente_habilitada ? (
                <div
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs",
                    modoFiado && saldoRestanteSeleccionado < 0
                      ? "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-400 border-red-500/25"
                      : "bg-card text-foreground border-border"
                  )}
                >
                  <div>
                    <span className="text-muted-foreground">Saldo disponible: </span>
                    <strong>{formatoPrecio(disponibleClienteSeleccionado)}</strong>
                  </div>
                  {modoFiado && (
                    <div>
                      {saldoRestanteSeleccionado >= 0 ? (
                        <>
                          <span className="text-muted-foreground">
                            Quedará a favor:{" "}
                          </span>
                          <strong className="text-emerald-600 dark:text-emerald-400">
                            {formatoPrecio(saldoRestanteSeleccionado)}
                          </strong>
                        </>
                      ) : (
                        <span className="font-semibold flex items-center gap-1">
                          <AlertTriangle className="size-3.5" />
                          Saldo insuficiente (faltan{" "}
                          {formatoPrecio(Math.abs(saldoRestanteSeleccionado))})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                modoFiado && (
                  <div className="flex items-center gap-1.5 rounded-md border bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-400 border-red-500/25 px-2.5 py-1.5 text-xs font-medium">
                    <AlertTriangle className="size-3.5 shrink-0" />
                    <span>
                      Este cliente no tiene una Cuenta Corriente habilitada.
                    </span>
                  </div>
                )
              )}
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
                <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-card shadow-md">
                  {sugerencias.map((c) => {
                    const disp = Number(
                      c.credito_disponible ??
                        Math.max(
                          0,
                          Number(c.limite_credito || 0) -
                            Number(c.deuda_actual || 0)
                        )
                    );
                    return (
                      <button
                        key={c.id_cliente}
                        type="button"
                        onClick={() => {
                          actualizar({ clienteSeleccionado: c });
                          setBusqueda("");
                          setMostrarResultados(false);
                        }}
                        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs hover:bg-muted/60 border-b border-border/50 last:border-b-0 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate">
                            {c.nombre} {c.apellido || ""}
                          </div>
                          <div className="font-mono text-[11px] text-muted-foreground">
                            {c.tipo_documento}: {c.numero_documento}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium border",
                            c.cuenta_corriente_habilitada
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {c.cuenta_corriente_habilitada
                            ? `Disp: ${formatoPrecio(disp)}`
                            : "Sin Cta. Cte."}
                        </span>
                      </button>
                    );
                  })}
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
          <div className="flex flex-col sm:flex-row justify-between gap-2">
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
            <div className="w-24 sm:w-28 shrink-0">
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
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={20}
                disabled={disabled}
                placeholder="Ej: 12345678"
                value={nuevoCliente.numero_documento}
                onChange={(e) =>
                  handleCambioNuevo(
                    "numero_documento",
                    e.target.value.replace(/\D/g, "")
                  )
                }
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <div className="w-full">
              <Label className="mb-1 block text-xs">Teléfono</Label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={30}
                disabled={disabled}
                placeholder="Ej: 1145678901"
                value={nuevoCliente.telefono || ""}
                onChange={(e) =>
                  handleCambioNuevo(
                    "telefono",
                    e.target.value.replace(/\D/g, "")
                  )
                }
              />
            </div>
            <div className="w-full">
              <Label className="mb-1 block text-xs">Correo electrónico</Label>
              <Input
                type="email"
                disabled={disabled}
                placeholder="Ej: cliente@email.com"
                value={nuevoCliente.email || ""}
                onChange={(e) => handleCambioNuevo("email", e.target.value)}
              />
            </div>
          </div>

          {/* Selección de Cuenta Corriente para nuevo cliente */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-1">
                <Wallet className="size-3.5 text-accent" />
                <span>
                  Cuenta Corriente (Saldo a favor){modoFiado ? " *" : ""}
                </span>
              </Label>
              <span className="text-[11px] font-semibold text-accent">
                {Number(nuevoCliente.limite_credito) > 0
                  ? formatoMontoCorto(nuevoCliente.limite_credito)
                  : "Sin cuenta"}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              <Button
                type="button"
                size="sm"
                disabled={disabled}
                variant={
                  Number(nuevoCliente.limite_credito || 0) === 0
                    ? "accent"
                    : "outline"
                }
                onClick={() => handleCambioNuevo("limite_credito", 0)}
                className="w-full max-w-none text-xs cursor-pointer"
              >
                Sin cuenta
              </Button>
              {MONTOS_CUENTA_CORRIENTE.map((monto) => (
                <Button
                  key={monto}
                  type="button"
                  size="sm"
                  disabled={disabled}
                  variant={
                    Number(nuevoCliente.limite_credito) === monto
                      ? "accent"
                      : "outline"
                  }
                  onClick={() => handleCambioNuevo("limite_credito", monto)}
                  className="w-full max-w-none text-xs cursor-pointer"
                >
                  {formatoMontoCorto(monto)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
