import React, { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Loader2,
  Pencil,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const ITEMS_POR_PAGINA = 10;

const formatoPrecio = (valor) =>
  `$${Number(valor || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function ClientesTable({
  clientes = [],
  cargando = false,
  esGestor = true,
  onEditarCliente,
  onToggleActivo,
  onCobrarDeuda,
  className,
}) {
  const [paginaActual, setPaginaActual] = useState(1);
  const totalColumnas = 9;

  const clientesOrdenados = useMemo(
    () =>
      [...clientes].sort((a, b) => {
        const nombreA = `${a.nombre || ""} ${a.apellido || ""}`.trim();
        const nombreB = `${b.nombre || ""} ${b.apellido || ""}`.trim();
        return nombreA.localeCompare(nombreB, "es", { sensitivity: "base" });
      }),
    [clientes]
  );

  const totalPaginas = Math.max(
    1,
    Math.ceil(clientesOrdenados.length / ITEMS_POR_PAGINA)
  );

  useEffect(() => {
    setPaginaActual((prev) => Math.min(prev, totalPaginas));
  }, [clientesOrdenados.length, totalPaginas]);

  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const indiceInicio = (paginaSegura - 1) * ITEMS_POR_PAGINA;
  const indiceFin = Math.min(
    indiceInicio + ITEMS_POR_PAGINA,
    clientesOrdenados.length
  );
  const clientesPaginados = clientesOrdenados.slice(indiceInicio, indiceFin);

  return (
    <div
      className={cn(
        "flex flex-1 min-h-0 flex-col rounded-lg border bg-card overflow-hidden shadow-xs",
        className
      )}
    >
      <div className="flex-1 min-h-0 overflow-auto">
        <Table containerClassName="overflow-visible" className="min-w-[1050px] w-full">
          <TableHeader className="sticky top-0 z-10 bg-card shadow-xs [&_th]:bg-card">
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="px-4 py-3 font-normal text-foreground w-20 whitespace-nowrap">
                Estado
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Cliente
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Documento
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Cuenta Corriente
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground text-center whitespace-nowrap">
                Cobrar Deuda
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Teléfono
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Email
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Dirección
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground text-right whitespace-nowrap">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargando ? (
              <TableRow>
                <TableCell
                  colSpan={totalColumnas}
                  className="h-28 text-center text-muted-foreground"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Cargando clientes...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : clientesPaginados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={totalColumnas}
                  className="h-28 text-center text-muted-foreground"
                >
                  No se encontraron clientes registrados
                </TableCell>
              </TableRow>
            ) : (
              clientesPaginados.map((item) => {
                const tieneCuenta = Boolean(item.cuenta_corriente_habilitada);
                const limite = Number(item.limite_credito || 0);
                const deuda = Number(item.deuda_actual || 0);
                const disponible =
                  item.credito_disponible !== undefined
                    ? Number(item.credito_disponible)
                    : Math.max(0, limite - deuda);

                return (
                  <TableRow
                    key={item.id_cliente}
                    className={cn(
                      "transition-colors",
                      !item.activo && "opacity-60 bg-muted/20"
                    )}
                  >
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center">
                        <Switch
                          checked={Boolean(item.activo)}
                          disabled={!esGestor}
                          onCheckedChange={() => onToggleActivo?.(item)}
                          aria-label={`Cambiar estado de ${item.nombre} ${item.apellido || ""}`}
                        />
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                      {item.nombre} {item.apellido || ""}
                    </TableCell>

                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-mono border bg-muted/40 text-foreground">
                        <span className="font-semibold mr-1">{item.tipo_documento}:</span>
                        {item.numero_documento}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      {tieneCuenta ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "inline-flex w-fit items-center rounded-md px-2 py-0.5 text-xs font-semibold border",
                              disponible > 0
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-400 border-red-500/25"
                            )}
                          >
                            Disp: {formatoPrecio(disponible)}
                          </span>
                          {deuda > 0 && (
                            <span className="inline-flex w-fit items-center rounded-md px-2 py-0.5 text-xs font-semibold border bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-400 border-red-500/25">
                              Deuda: {formatoPrecio(deuda)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border bg-muted text-muted-foreground border-border">
                          Sin cuenta
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                      {tieneCuenta && deuda > 0 ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="accent"
                          onClick={() => onCobrarDeuda?.(item)}
                          className="h-7 px-2.5 text-xs gap-1 max-w-none cursor-pointer"
                        >
                          <Banknote className="size-3.5" />
                          <span>Cobrar deuda</span>
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-muted-foreground text-sm whitespace-nowrap">
                      {item.telefono || "—"}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-muted-foreground text-sm whitespace-nowrap">
                      {item.email || "—"}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                      {item.direccion || "—"}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                              aria-label="Opciones de cliente"
                            >
                              <EllipsisVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            {deuda > 0 && (
                              <DropdownMenuItem
                                onClick={() => onCobrarDeuda?.(item)}
                                className="cursor-pointer gap-2"
                              >
                                <Banknote className="size-4 text-accent" />
                                <span>Cobrar deuda</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => onEditarCliente?.(item)}
                              className="cursor-pointer gap-2"
                            >
                              <Pencil className="size-4 text-muted-foreground" />
                              <span>Editar Cliente</span>
                            </DropdownMenuItem>
                            {esGestor && (
                              <DropdownMenuItem
                                onClick={() => onToggleActivo?.(item)}
                                className="cursor-pointer gap-2"
                              >
                                {item.activo ? (
                                  <>
                                    <UserX className="size-4 text-destructive" />
                                    <span className="text-destructive">Desactivar</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="size-4 text-emerald-600" />
                                    <span className="text-emerald-600">Activar</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pie de paginación */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t bg-card px-3 sm:px-4 py-2.5 text-xs text-muted-foreground">
        <span>
          {clientesOrdenados.length === 0
            ? "Sin clientes para mostrar"
            : `Mostrando ${indiceInicio + 1}–${indiceFin} de ${clientesOrdenados.length} clientes`}
        </span>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
            disabled={paginaSegura <= 1}
            className="h-7 px-2 sm:px-2.5 gap-1 cursor-pointer"
          >
            <ChevronLeft className="size-3.5" />
            <span>Anterior</span>
          </Button>

          <span className="px-1 sm:px-2 font-medium text-foreground">
            Página {paginaSegura} de {totalPaginas}
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
            disabled={paginaSegura >= totalPaginas}
            className="h-7 px-2 sm:px-2.5 gap-1 cursor-pointer"
          >
            <span>Siguiente</span>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ClientesTable;
