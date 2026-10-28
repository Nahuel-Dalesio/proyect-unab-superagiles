import React from "react";
import { EllipsisVertical, Pencil, UserCheck, UserX } from "lucide-react";
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

export function ClientesTable({
  clientes = [],
  onEditarCliente,
  onToggleActivo,
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
        <Table containerClassName="overflow-visible" className="min-w-[900px] w-full">
          <TableHeader className="sticky top-0 z-10 bg-card shadow-xs [&_th]:bg-card">
            <TableRow className="hover:bg-transparent border-b">
              {/* Primer columna con el Switch para activar o desactivar */}
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
            {clientes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-28 text-center text-muted-foreground"
                >
                  No se encontraron clientes registrados
                </TableCell>
              </TableRow>
            ) : (
              clientes.map((item) => (
                <TableRow
                  key={item.id_cliente}
                  className={cn(
                    "transition-colors",
                    !item.activo && "opacity-60 bg-muted/20"
                  )}
                >
                  {/* Primer columna: Switch para activar o desactivar */}
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center">
                      <Switch
                        checked={item.activo}
                        onCheckedChange={() => onToggleActivo?.(item.id_cliente)}
                        aria-label={`Cambiar estado de ${item.nombre} ${item.apellido}`}
                      />
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 font-medium text-foreground">
                    {item.nombre} {item.apellido}
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-mono border bg-muted/40 text-foreground">
                      <span className="font-semibold mr-1">{item.tipo_documento}:</span>
                      {item.numero_documento}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                    {item.telefono || "—"}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-muted-foreground text-sm">
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
                          <DropdownMenuItem
                            onClick={() => onEditarCliente?.(item)}
                            className="cursor-pointer gap-2"
                          >
                            <Pencil className="size-4 text-muted-foreground" />
                            <span>Editar Cliente</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onToggleActivo?.(item.id_cliente)}
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

export default ClientesTable;
