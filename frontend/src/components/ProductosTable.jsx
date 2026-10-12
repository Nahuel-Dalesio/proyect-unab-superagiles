import React from "react";
import { EllipsisVertical, PackagePlus, Pencil } from "lucide-react";
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

export function ProductosTable({
  inventario = [],
  onAgregarStock,
  onEditarStock,
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
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card shadow-xs [&_th]:bg-card">
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="px-4 py-3 font-normal text-foreground">
                Nombre
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground">
                Código de barras
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground">
                Precio costo
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground">
                Precio venta
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground">
                Stock
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventario.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-28 text-center text-muted-foreground"
                >
                  Todavía no hay productos en el inventario
                </TableCell>
              </TableRow>
            ) : (
              inventario.map((item) => (
                <TableRow key={item.idProducto}>
                  <TableCell className="px-4 py-3 font-medium">
                    {item.nombre}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {item.codigoBarras}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {formatoPrecio(item.precioCosto ?? 0)}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium">
                    {formatoPrecio(item.precioVenta)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border",
                        item.stock <= 20
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-muted text-foreground border-border"
                      )}
                    >
                      {item.stock} u.
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:bg-muted text-muted-foreground hover:text-foreground"
                            aria-label="Opciones de producto"
                          >
                            <EllipsisVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={() => onAgregarStock?.(item)}
                            className="cursor-pointer gap-2"
                          >
                            <PackagePlus className="size-4 text-muted-foreground" />
                            <span>Agregar Stock</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEditarStock?.(item)}
                            className="cursor-pointer gap-2"
                          >
                            <Pencil className="size-4 text-muted-foreground" />
                            <span>Editar Stock</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default ProductosTable;
