import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Loader2, PackagePlus, RefreshCw } from "lucide-react";
import { getProductosStockBajo } from "@/service/product.service";
import { showError } from "@/utils/alerts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const defaultFormatoPrecio = (valor) =>
  `$${Number(valor).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function StockBajoModal({
  open,
  onOpenChange,
  onAgregarStock,
  formatoPrecio = defaultFormatoPrecio,
}) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);

  const cargarStockBajo = useCallback(async () => {
    setCargando(true);
    try {
      const data = await getProductosStockBajo();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(
        error.status
          ? error.message
          : "Error al obtener los productos con stock bajo"
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      cargarStockBajo();
    }
  }, [open, cargarStockBajo]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              <span>Productos con Stock Bajo / Reposición</span>
            </DialogTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={cargarStockBajo}
              disabled={cargando}
              className="gap-1.5 cursor-pointer"
            >
              <RefreshCw className={cn("size-3.5", cargando && "animate-spin")} />
              <span>Actualizar</span>
            </Button>
          </div>
          <DialogDescription>
            Listado de productos activos cuyo stock actual es menor o igual al
            stock mínimo configurado.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-auto rounded-lg border bg-card my-2">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card shadow-xs">
              <TableRow>
                <TableHead className="px-4 py-3">Producto</TableHead>
                <TableHead className="px-4 py-3">Código</TableHead>
                <TableHead className="px-4 py-3">Costo</TableHead>
                <TableHead className="px-4 py-3 text-center">Stock actual</TableHead>
                <TableHead className="px-4 py-3 text-center">Stock mín.</TableHead>
                <TableHead className="px-4 py-3 text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargando ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      <span>Consultando productos en alerta...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : productos.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-28 text-center text-muted-foreground"
                  >
                    ¡Excelente! No hay productos con stock bajo en este momento.
                  </TableCell>
                </TableRow>
              ) : (
                productos.map((item) => {
                  const agotado = Number(item.stock) === 0;
                  return (
                    <TableRow key={item.idProducto}>
                      <TableCell className="px-4 py-2.5 font-medium">
                        {item.nombre}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                        {item.codigoBarras}
                      </TableCell>
                      <TableCell className="px-4 py-2.5">
                        {formatoPrecio(item.precioCosto ?? 0)}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border",
                            agotado
                              ? "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-400 border-red-500/25"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                          )}
                        >
                          {item.stock} u.
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-center text-muted-foreground">
                        {item.stockMinimo} u.
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-right">
                        <Button
                          type="button"
                          variant="accent"
                          size="sm"
                          onClick={() => {
                            onOpenChange(false);
                            onAgregarStock?.(item);
                          }}
                          className="gap-1.5 cursor-pointer"
                        >
                          <PackagePlus className="size-3.5" />
                          <span>Reponer</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <span className="text-xs text-muted-foreground">
            Total en alerta: <strong>{productos.length}</strong> producto(s)
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default StockBajoModal;
