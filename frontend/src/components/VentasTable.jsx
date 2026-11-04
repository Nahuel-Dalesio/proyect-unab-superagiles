import React from "react";
import { Ban, EllipsisVertical, Eye, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

const defaultFormatoPrecio = (valor) =>
  `$${Number(valor).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatearFecha = (fechaIso) => {
  if (!fechaIso) return "—";
  const fecha = new Date(fechaIso);
  if (isNaN(fecha.getTime())) return String(fechaIso);
  return fecha.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function VentasTable({
  ventas = [],
  cargando = false,
  esGestor = false,
  anulandoId = null,
  onVerDetalle,
  onAnularVenta,
  formatoPrecio = defaultFormatoPrecio,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-1 min-h-0 flex-col rounded-lg border bg-card overflow-hidden shadow-xs",
        className
      )}
    >
      <div className="flex-1 min-h-0 overflow-auto">
        <Table containerClassName="overflow-visible" className="min-w-[850px] w-full">
          <TableHeader className="sticky top-0 z-10 bg-card shadow-xs [&_th]:bg-card">
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="px-4 py-3 font-normal text-foreground w-24 whitespace-nowrap">
                N° Venta
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Fecha y Hora
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Cajero
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Medio de pago
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground text-center whitespace-nowrap">
                Unidades
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Estado
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground text-right whitespace-nowrap">
                Total
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
                  colSpan={8}
                  className="h-28 text-center text-muted-foreground"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Cargando historial de ventas...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : ventas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-28 text-center text-muted-foreground"
                >
                  No se encontraron ventas registradas
                </TableCell>
              </TableRow>
            ) : (
              ventas.map((venta) => {
                const anulada = venta.estado === "anulada";
                const totalUnidades = (venta.detalles || []).reduce(
                  (acc, d) => acc + Number(d.cantidad || 0),
                  0
                );

                return (
                  <TableRow
                    key={venta.idVenta}
                    className={cn(
                      "transition-colors",
                      anulada && "opacity-60 bg-muted/20"
                    )}
                  >
                    <TableCell className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">
                      #{venta.idVenta}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {formatearFecha(venta.fechaHora)}
                    </TableCell>

                    <TableCell className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                      {venta.username || `Usuario #${venta.idUsuario}`}
                    </TableCell>

                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium uppercase border bg-muted/40 text-foreground">
                        {venta.medioPago}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border bg-muted text-foreground border-border">
                        {totalUnidades} u.
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border",
                          anulada
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                        )}
                      >
                        {anulada ? "Anulada" : "Completada"}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                      {formatoPrecio(venta.total)}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                              aria-label="Opciones de venta"
                            >
                              {anulandoId === venta.idVenta ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <EllipsisVertical className="size-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => onVerDetalle?.(venta.idVenta)}
                              className="cursor-pointer gap-2"
                            >
                              <Eye className="size-4 text-accent" />
                              <span>Ver Detalle</span>
                            </DropdownMenuItem>
                            {esGestor && !anulada && (
                              <DropdownMenuItem
                                onClick={() => onAnularVenta?.(venta)}
                                className="cursor-pointer gap-2"
                              >
                                <Ban className="size-4 text-destructive" />
                                <span className="text-destructive">
                                  Anular Venta
                                </span>
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
    </div>
  );
}

export default VentasTable;

