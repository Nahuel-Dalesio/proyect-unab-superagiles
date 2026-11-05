import { useEffect, useState } from "react";
import { Ban, FileText, Loader2 } from "lucide-react";
import { getVentaById, anularVenta } from "@/service/ventas.service";
import { showConfirm, showError, showSuccess } from "@/utils/alerts";
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

export function DetalleVentaModal({
  open,
  onOpenChange,
  idVenta,
  esGestor = false,
  onVentaAnulada,
  formatoPrecio = defaultFormatoPrecio,
}) {
  const [venta, setVenta] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [anulando, setAnulando] = useState(false);

  useEffect(() => {
    if (!open || !idVenta) {
      setVenta(null);
      return;
    }

    let activo = true;
    setCargando(true);

    getVentaById(idVenta)
      .then((data) => {
        if (activo) setVenta(data);
      })
      .catch((error) => {
        if (activo) {
          showError(
            error.status ? error.message : "Error al cargar el detalle de la venta"
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [open, idVenta]);

  const handleAnular = async () => {
    if (!venta || venta.estado === "anulada") return;

    const confirmado = await showConfirm(
      `¿Querés anular la venta #${venta.idVenta}? El stock de los productos vendidos se restaurará automáticamente.`,
      {
        title: "Anular venta",
        confirmText: "Sí, anular",
        cancelText: "Cancelar",
      }
    );

    if (!confirmado) return;

    setAnulando(true);
    try {
      const data = await anularVenta(venta.idVenta);
      setVenta(data.venta ?? { ...venta, estado: "anulada" });
      await showSuccess(
        `La venta #${venta.idVenta} fue anulada y el stock fue restaurado.`,
        "Venta anulada"
      );
      await onVentaAnulada?.();
    } catch (error) {
      showError(error.status ? error.message : "Error al anular la venta");
    } finally {
      setAnulando(false);
    }
  };

  const ignorarSiEsCartel = (e) => {
    if (e.target instanceof Element && e.target.closest(".swal2-container")) {
      e.preventDefault();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[85vh] flex flex-col"
        onInteractOutside={ignorarSiEsCartel}
        onFocusOutside={ignorarSiEsCartel}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-accent" />
            <span>Detalle de Venta {idVenta ? `#${idVenta}` : ""}</span>
          </DialogTitle>
          <DialogDescription>
            Información del comprobante y desglose de productos vendidos.
          </DialogDescription>
        </DialogHeader>

        {cargando ? (
          <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            <span>Cargando comprobante...</span>
          </div>
        ) : !venta ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            No se encontró información de la venta.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-lg border bg-muted/30 p-3 text-xs">
              <div>
                <span className="text-muted-foreground block">Fecha y hora</span>
                <span className="font-semibold text-foreground">
                  {formatearFecha(venta.fechaHora)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Cajero</span>
                <span className="font-semibold text-foreground">
                  {venta.username || `ID #${venta.idUsuario}`}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Medio de pago</span>
                <span className="font-semibold uppercase text-foreground">
                  {venta.medioPago}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Estado</span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border mt-0.5",
                    venta.estado === "anulada"
                      ? "bg-destructive/15 text-destructive border-destructive/30"
                      : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                  )}
                >
                  {venta.estado === "anulada" ? "Anulada" : "Completada"}
                </span>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-auto rounded-lg border bg-card my-1">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card shadow-xs">
                  <TableRow>
                    <TableHead className="px-4 py-2.5">Producto</TableHead>
                    <TableHead className="px-4 py-2.5">Código</TableHead>
                    <TableHead className="px-4 py-2.5 text-right">Precio unit.</TableHead>
                    <TableHead className="px-4 py-2.5 text-center">Cant.</TableHead>
                    <TableHead className="px-4 py-2.5 text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(venta.detalles || []).map((item) => (
                    <TableRow key={item.idDetalle ?? item.idProducto}>
                      <TableCell className="px-4 py-2.5 font-medium">
                        {item.productoNombre}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                        {item.codigoBarras}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-right">
                        {formatoPrecio(item.precioUnitario)}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-center font-medium">
                        {item.cantidad}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-right font-semibold">
                        {formatoPrecio(item.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-2.5">
              <span className="text-sm font-medium text-muted-foreground">
                Total de la venta
              </span>
              <span className="text-xl font-bold text-foreground">
                {formatoPrecio(venta.total)}
              </span>
            </div>
          </>
        )}

        <DialogFooter className="flex items-center justify-between sm:justify-between gap-2 pt-2">
          <div>
            {esGestor && venta && venta.estado === "completada" && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleAnular}
                disabled={anulando}
                className="gap-1.5 max-w-none cursor-pointer"
              >
                {anulando ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Anulando...</span>
                  </>
                ) : (
                  <>
                    <Ban className="size-4" />
                    <span>Anular Venta</span>
                  </>
                )}
              </Button>
            )}
          </div>
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

export default DetalleVentaModal;

