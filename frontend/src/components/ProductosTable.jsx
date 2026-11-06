import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  PackageCheck,
  PackagePlus,
  PackageX,
  Pencil,
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

const defaultFormatoPrecio = (valor) =>
  `$${Number(valor).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function ProductosTable({
  inventario = [],
  onAgregarStock,
  onEditarStock,
  onToggleActivo,
  formatoPrecio = defaultFormatoPrecio,
  className,
  esGestor = true,
}) {
  const [paginaActual, setPaginaActual] = useState(1);
  const totalColumnas = esGestor ? 7 : 5;

  const inventarioOrdenado = useMemo(
    () =>
      [...inventario].sort((a, b) =>
        String(a.nombre || "").localeCompare(String(b.nombre || ""), "es", {
          sensitivity: "base",
        })
      ),
    [inventario]
  );

  const totalPaginas = Math.max(
    1,
    Math.ceil(inventarioOrdenado.length / ITEMS_POR_PAGINA)
  );

  // Si cambia la cantidad de resultados por búsqueda o filtro, ajustar la página actual
  useEffect(() => {
    setPaginaActual((prev) => Math.min(prev, totalPaginas));
  }, [inventarioOrdenado.length, totalPaginas]);

  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const indiceInicio = (paginaSegura - 1) * ITEMS_POR_PAGINA;
  const indiceFin = Math.min(
    indiceInicio + ITEMS_POR_PAGINA,
    inventarioOrdenado.length
  );
  const inventarioPaginado = inventarioOrdenado.slice(indiceInicio, indiceFin);

  return (
    <div
      className={cn(
        "flex flex-1 min-h-0 flex-col rounded-lg border bg-card overflow-hidden shadow-xs",
        className
      )}
    >
      {/* Contenedor con overflow-auto para permitir desplazamiento vertical y horizontal en pantallas chicas */}
      <div className="flex-1 min-h-0 overflow-auto">
        <Table containerClassName="overflow-visible" className="min-w-[850px] w-full">
          <TableHeader className="sticky top-0 z-10 bg-card shadow-xs [&_th]:bg-card">
            <TableRow className="hover:bg-transparent border-b">
              {/* Primer columna con el Switch para activar o desactivar */}
              <TableHead className="px-4 py-3 font-normal text-foreground w-20 whitespace-nowrap">
                Estado
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Nombre
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Código de barras
              </TableHead>
              {esGestor && (
                <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                  Precio costo
                </TableHead>
              )}
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Precio venta
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Stock
              </TableHead>
              {esGestor && (
                <TableHead className="px-4 py-3 font-normal text-foreground text-right whitespace-nowrap">
                  Acciones
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventarioPaginado.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={totalColumnas}
                  className="h-28 text-center text-muted-foreground"
                >
                  Todavía no hay productos en el inventario
                </TableCell>
              </TableRow>
            ) : (
              inventarioPaginado.map((item) => {
                const id = item.idProducto ?? item.id_producto;
                const isActivo = item.activo ?? true;

                return (
                  <TableRow
                    key={id}
                    className={cn(
                      "transition-colors",
                      !isActivo && "opacity-60 bg-muted/20"
                    )}
                  >
                    {/* Primer columna: Switch para activar o desactivar */}
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Switch
                          checked={isActivo}
                          onCheckedChange={() => onToggleActivo?.(id)}
                          aria-label={`Cambiar estado de ${item.nombre}`}
                        />
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 font-medium whitespace-nowrap">
                      {item.nombre}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground font-mono text-xs whitespace-nowrap">
                      {item.codigoBarras}
                    </TableCell>
                    {esGestor && (
                      <TableCell className="px-4 py-3 whitespace-nowrap">
                        {formatoPrecio(item.precioCosto ?? 0)}
                      </TableCell>
                    )}
                    <TableCell className="px-4 py-3 font-medium whitespace-nowrap">
                      {formatoPrecio(item.precioVenta)}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border",
                          item.stock <= (item.stockMinimo ?? 5)
                            ? "bg-destructive/10 text-destructive border-destructive/20 font-semibold"
                            : "bg-muted text-foreground border-border"
                        )}
                      >
                        {item.stock} u.
                      </span>
                    </TableCell>
                    {esGestor && (
                      <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                                aria-label="Opciones de producto"
                              >
                                <EllipsisVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => onAgregarStock?.(item)}
                                className="cursor-pointer gap-2"
                              >
                                <PackagePlus className="size-4 text-accent" />
                                <span>Agregar Stock</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onEditarStock?.(item)}
                                className="cursor-pointer gap-2"
                              >
                                <Pencil className="size-4 text-muted-foreground" />
                                <span>Editar Precios / Stock</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onToggleActivo?.(id)}
                                className="cursor-pointer gap-2"
                              >
                                {isActivo ? (
                                  <>
                                    <PackageX className="size-4 text-destructive" />
                                    <span className="text-destructive">Desactivar</span>
                                  </>
                                ) : (
                                  <>
                                    <PackageCheck className="size-4 text-emerald-600" />
                                    <span className="text-emerald-600">Activar</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pie de paginación */}
      <div className="flex shrink-0 items-center justify-between border-t bg-card px-4 py-2.5 text-xs text-muted-foreground">
        <span>
          {inventarioOrdenado.length === 0
            ? "Sin productos para mostrar"
            : `Mostrando ${indiceInicio + 1}–${indiceFin} de ${inventarioOrdenado.length} productos`}
        </span>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
            disabled={paginaSegura <= 1}
            className="h-7 px-2.5 gap-1 cursor-pointer"
          >
            <ChevronLeft className="size-3.5" />
            <span>Anterior</span>
          </Button>

          <span className="px-2 font-medium text-foreground">
            Página {paginaSegura} de {totalPaginas}
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
            disabled={paginaSegura >= totalPaginas}
            className="h-7 px-2.5 gap-1 cursor-pointer"
          >
            <span>Siguiente</span>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProductosTable;
