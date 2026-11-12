import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Loader2,
  Pencil,
  Shield,
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

const ROLE_BADGES = {
  admin: {
    label: "Administrador",
    className:
      "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  },
  encargado: {
    label: "Encargado",
    className:
      "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  },
  cajero: {
    label: "Cajero",
    className:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
};

export function UsuariosTable({
  usuarios = [],
  cargando = false,
  currentUserId = null,
  onEditarUsuario,
  onToggleActivo,
  className,
}) {
  const [paginaActual, setPaginaActual] = useState(1);

  const usuariosOrdenados = useMemo(
    () =>
      [...usuarios].sort((a, b) =>
        String(a.username || "").localeCompare(String(b.username || ""), "es", {
          sensitivity: "base",
        })
      ),
    [usuarios]
  );

  const totalPaginas = Math.max(
    1,
    Math.ceil(usuariosOrdenados.length / ITEMS_POR_PAGINA)
  );

  useEffect(() => {
    setPaginaActual((prev) => Math.min(prev, totalPaginas));
  }, [usuariosOrdenados.length, totalPaginas]);

  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const indiceInicio = (paginaSegura - 1) * ITEMS_POR_PAGINA;
  const indiceFin = Math.min(
    indiceInicio + ITEMS_POR_PAGINA,
    usuariosOrdenados.length
  );
  const usuariosPaginados = usuariosOrdenados.slice(indiceInicio, indiceFin);

  return (
    <div
      className={cn(
        "flex flex-1 min-h-0 flex-col rounded-lg border bg-card overflow-hidden shadow-xs",
        className
      )}
    >
      <div className="flex-1 min-h-0 overflow-auto">
        <Table containerClassName="overflow-visible" className="min-w-[650px] w-full">
          <TableHeader className="sticky top-0 z-10 bg-card shadow-xs [&_th]:bg-card">
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="px-4 py-3 font-normal text-foreground w-20 whitespace-nowrap">
                Estado
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground w-24 whitespace-nowrap">
                ID
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Usuario
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-foreground whitespace-nowrap">
                Rol
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
                  colSpan={5}
                  className="h-28 text-center text-muted-foreground"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Cargando usuarios...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : usuariosPaginados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-28 text-center text-muted-foreground"
                >
                  No se encontraron usuarios registrados
                </TableCell>
              </TableRow>
            ) : (
              usuariosPaginados.map((item) => {
                const roleConfig = ROLE_BADGES[item.rol] || {
                  label: item.rol,
                  className: "bg-muted text-foreground border-border",
                };
                const esUsuarioActual =
                  Number(currentUserId) === Number(item.idUsuario);

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
                      <div className="flex items-center">
                        <Switch
                          checked={Boolean(item.activo)}
                          disabled={esUsuarioActual && Boolean(item.activo)}
                          onCheckedChange={() => onToggleActivo?.(item)}
                          aria-label={`Cambiar estado de ${item.username}`}
                        />
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      #{item.idUsuario}
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground font-mono">
                          @{item.username}
                        </span>
                        {esUsuarioActual && (
                          <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-accent/15 text-accent border border-accent/30">
                            Sesión actual
                          </span>
                        )}
                      </div>
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

                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
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
                            {!(esUsuarioActual && item.activo) && (
                              <DropdownMenuItem
                                onClick={() => onToggleActivo?.(item)}
                                className="cursor-pointer gap-2"
                              >
                                {item.activo ? (
                                  <>
                                    <UserX className="size-4 text-destructive" />
                                    <span className="text-destructive">
                                      Desactivar
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="size-4 text-emerald-600" />
                                    <span className="text-emerald-600">
                                      Activar
                                    </span>
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
          {usuariosOrdenados.length === 0
            ? "Sin usuarios para mostrar"
            : `Mostrando ${indiceInicio + 1}–${indiceFin} de ${usuariosOrdenados.length} usuarios`}
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

export default UsuariosTable;
