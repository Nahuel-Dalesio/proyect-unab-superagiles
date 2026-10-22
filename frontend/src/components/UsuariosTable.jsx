import React from "react";
import { EllipsisVertical, Pencil, Shield, UserCheck, UserX } from "lucide-react";
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

const ROLE_BADGES = {
  admin: {
    label: "Administrador",
    className: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  },
  encargado: {
    label: "Encargado",
    className: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  },
  cajero: {
    label: "Cajero",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
};

export function UsuariosTable({
  usuarios = [],
  onEditarUsuario,
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
        <Table containerClassName="overflow-visible" className="min-w-[800px] w-full">
          <TableHeader className="sticky top-0 z-10 bg-card shadow-xs [&_th]:bg-card">
            <TableRow className="hover:bg-transparent border-b">
              {/* Primer columna con el Switch para activar o desactivar */}
              <TableHead className="px-4 py-3 font-normal text-foreground w-28 whitespace-nowrap">
                Estado
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Usuario
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Email
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Rol
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Alta
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground text-right whitespace-nowrap">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-28 text-center text-muted-foreground"
                >
                  No se encontraron usuarios registrados
                </TableCell>
              </TableRow>
            ) : (
              usuarios.map((item) => {
                const roleConfig = ROLE_BADGES[item.rol] || {
                  label: item.rol,
                  className: "bg-muted text-foreground border-border",
                };

                return (
                  <TableRow
                    key={item.idUsuario}
                    className={cn(
                      "transition-colors",
                      !item.activo && "opacity-60 bg-muted/20"
                    )}
                  >
                    {/* Primer columna: Switch para activar o desactivar */}
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.activo}
                          onCheckedChange={() => onToggleActivo?.(item.idUsuario)}
                          aria-label={`Cambiar estado de ${item.username}`}
                        />
                        <span
                          className={cn(
                            "text-xs font-medium inline-flex items-center gap-1",
                            item.activo
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground"
                          )}
                        >
                          {item.activo ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {item.nombre || item.username}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          @{item.username}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                      {item.email || "—"}
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium border",
                          roleConfig.className
                        )}
                      >
                        <Shield className="size-3" />
                        {roleConfig.label}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                      {item.creadoEn || "—"}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 hover:bg-muted text-muted-foreground hover:text-foreground"
                              aria-label="Opciones de usuario"
                            >
                              <EllipsisVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => onEditarUsuario?.(item)}
                              className="cursor-pointer gap-2"
                            >
                              <Pencil className="size-4 text-muted-foreground" />
                              <span>Editar Usuario</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onToggleActivo?.(item.idUsuario)}
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default UsuariosTable;
