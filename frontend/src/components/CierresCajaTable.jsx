import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ITEMS_POR_PAGINA = 10;

const defaultFormatoPrecio = (valor) =>
  `$${Number(valor || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatearFechaHora = (valor) => {
  if (!valor) return "—";
  const fecha = new Date(valor);
  if (isNaN(fecha.getTime())) return String(valor);
  return fecha.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function CierresCajaTable({
  cierres = [],
  cargando = false,
  formatoPrecio = defaultFormatoPrecio,
  className,
}) {
  const [paginaActual, setPaginaActual] = useState(1);

  const totalPaginas = Math.max(
    1,
    Math.ceil(cierres.length / ITEMS_POR_PAGINA)
  );

  useEffect(() => {
    setPaginaActual((prev) => Math.min(prev, totalPaginas));
  }, [cierres.length, totalPaginas]);

  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const indiceInicio = (paginaSegura - 1) * ITEMS_POR_PAGINA;
  const indiceFin = Math.min(indiceInicio + ITEMS_POR_PAGINA, cierres.length);
  const cierresPaginados = cierres.slice(indiceInicio, indiceFin);

  return (
    <div
      className={cn(
        "flex flex-1 min-h-0 flex-col rounded-lg border bg-card overflow-hidden shadow-xs",
        className
      )}
    >
      <div className="flex-1 min-h-0 overflow-auto">
        <Table containerClassName="overflow-visible" className="min-w-[950px] w-full">
          <TableHeader className="sticky top-0 z-10 bg-card shadow-xs [&_th]:bg-card">
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="px-4 py-3 font-normal text-foreground w-20 whitespace-nowrap">
                Turno
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Empleado
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Apertura
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Cierre
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Efectivo Inicial
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Efectivo Ventas
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Efectivo Esperado
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Efectivo Contado
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground text-right whitespace-nowrap">
                Diferencia
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {cargando ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-28 text-center text-muted-foreground"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Cargando cierres de caja...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : cierresPaginados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-28 text-center text-muted-foreground"
                >
                  No se encontraron registros de cierres de caja
                </TableCell>
              </TableRow>
            ) : (
              cierresPaginados.map((item) => {
                const estaCerrada = item.estado === "cerrada";
                const montoInicial = Number(item.montoInicial ?? 0);
                const ventasEfectivo = Number(item.ventasEfectivo ?? 0);
                const montoEsperado =
                  item.montoEsperado !== undefined
                    ? Number(item.montoEsperado)
                    : montoInicial + ventasEfectivo;
                const montoFinal =
                  item.montoFinal !== null && item.montoFinal !== undefined
                    ? Number(item.montoFinal)
                    : null;
                const diferencia =
                  item.diferencia !== null && item.diferencia !== undefined
                    ? Number(item.diferencia)
                    : null;

                return (
                  <TableRow
                    key={item.idCierre}
                    className="h-14 transition-colors"
                  >
                    <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      #{item.idCierre}
                    </TableCell>

                    <TableCell className="px-4 py-3 font-medium text-foreground font-mono whitespace-nowrap">
                      @{item.username}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatearFechaHora(item.fechaApertura)}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {estaCerrada ? (
                        formatearFechaHora(item.fechaCierre)
                      ) : (
                        <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Caja abierta
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      {formatoPrecio(montoInicial)}
                    </TableCell>

                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      {formatoPrecio(ventasEfectivo)}
                    </TableCell>

                    <TableCell className="px-4 py-3 font-medium whitespace-nowrap">
                      {formatoPrecio(montoEsperado)}
                    </TableCell>

                    <TableCell className="px-4 py-3 font-medium whitespace-nowrap">
                      {estaCerrada && montoFinal !== null
                        ? formatoPrecio(montoFinal)
                        : "—"}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                      {!estaCerrada || diferencia === null ? (
                        <span className="text-xs text-muted-foreground">
                          En curso
                        </span>
                      ) : diferencia === 0 ? (
                        <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          Sin diferencia ({formatoPrecio(0)})
                        </span>
                      ) : diferencia > 0 ? (
                        <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                          Sobrante +{formatoPrecio(diferencia)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-400 border border-red-500/25">
                          Faltante -{formatoPrecio(Math.abs(diferencia))}
                        </span>
                      )}
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
          {cierres.length === 0
            ? "Sin cierres de caja para mostrar"
            : `Mostrando ${indiceInicio + 1}–${indiceFin} de ${cierres.length} turnos`}
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

export default CierresCajaTable;
