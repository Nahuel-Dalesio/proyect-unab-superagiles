import React from "react";
import { Minus, Plus } from "lucide-react";
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

const defaultFormatoPrecio = (valor) =>
  `$${Number(valor).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function CajeroTable({
  carrito = [],
  cambiarCantidad,
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
        <Table containerClassName="overflow-visible" className="min-w-[560px] w-full">
          <TableHeader className="sticky top-0 z-10 bg-card shadow-xs [&_th]:bg-card">
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Nombre
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Código de barras
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Precio
              </TableHead>
              <TableHead className="px-4 py-3 text-center font-normal text-foreground whitespace-nowrap">
                Cantidad
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-normal text-foreground whitespace-nowrap">
                Subtotal
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {carrito.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-28 text-center text-muted-foreground"
                >
                  Todavía no hay productos en la caja
                </TableCell>
              </TableRow>
            ) : (
              carrito.map((item) => (
                <TableRow key={item.idProducto}>
                  <TableCell className="px-4 py-3 font-medium whitespace-nowrap">
                    {item.nombre}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {item.codigoBarras}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    {formatoPrecio(item.precioVenta)}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        aria-label={`Quitar una unidad de ${item.nombre}`}
                        onClick={() => cambiarCantidad(item.idProducto, -1)}
                        className="size-7 rounded-md"
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">
                        {item.cantidad}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        aria-label={`Sumar una unidad de ${item.nombre}`}
                        onClick={() => cambiarCantidad(item.idProducto, 1)}
                        className="size-7 rounded-md"
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right font-medium whitespace-nowrap">
                    {formatoPrecio(item.precioVenta * item.cantidad)}
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

export default CajeroTable;
