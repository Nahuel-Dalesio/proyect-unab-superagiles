import { useCallback, useContext, useEffect, useState } from "react";
import { History, RefreshCw } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { ROLES } from "@/utils/roles";
import { getVentas, anularVenta } from "@/service/ventas.service";
import { showConfirm, showError, showSuccess } from "@/utils/alerts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VentasTable } from "@/components/VentasTable";
import { DetalleVentaModal } from "@/components/DetalleVentaModal";
import { cn } from "@/lib/utils";

const formatoPrecio = (valor) =>
  `$${Number(valor).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function Ventas() {
  const { user } = useContext(AuthContext);
  const esGestor =
    !user || user.rol === ROLES.ADMIN || user.rol === ROLES.ENCARGADO;

  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // Modal de detalle de venta
  const [idVentaDetalle, setIdVentaDetalle] = useState(null);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [anulandoId, setAnulandoId] = useState(null);

  const cargarVentas = useCallback(async () => {
    setCargando(true);
    try {
      const data = await getVentas({
        desde: desde ? `${desde} 00:00:00` : "",
        hasta: hasta ? `${hasta} 23:59:59` : "",
      });
      setVentas(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(
        error.status
          ? error.message
          : "Error de conexión al cargar el historial de ventas"
      );
    } finally {
      setCargando(false);
    }
  }, [desde, hasta]);

  useEffect(() => {
    cargarVentas();
  }, [cargarVentas]);

  const handleVerDetalle = (idVenta) => {
    setIdVentaDetalle(idVenta);
    setModalDetalleOpen(true);
  };

  const handleAnularVenta = async (venta) => {
    if (!venta || venta.estado === "anulada") return;

    const confirmado = await showConfirm(
      `¿Querés anular la venta #${venta.idVenta} por ${formatoPrecio(
        venta.total
      )}? Se restaurará el stock de los productos vendidos.`,
      {
        title: "Anular venta",
        confirmText: "Sí, anular",
        cancelText: "Cancelar",
      }
    );

    if (!confirmado) return;

    setAnulandoId(venta.idVenta);
    try {
      await anularVenta(venta.idVenta);
      showSuccess(
        `La venta #${venta.idVenta} fue anulada y el stock fue restaurado.`,
        "Venta anulada"
      );
      await cargarVentas();
    } catch (error) {
      showError(error.status ? error.message : "Error al anular la venta");
    } finally {
      setAnulandoId(null);
    }
  };

  const handleLimpiarFechas = () => {
    setDesde("");
    setHasta("");
  };

  const ventasFiltradas = (ventas || []).filter((v) => {
    const term = busqueda.toLowerCase().trim();
    if (!term) return true;

    const coincideId = String(v.idVenta ?? "").includes(term);
    const coincideUsuario =
      v.username && v.username.toLowerCase().includes(term);
    const coincideMedio =
      v.medioPago && v.medioPago.toLowerCase().includes(term);
    const coincideEstado =
      v.estado && v.estado.toLowerCase().includes(term);
    const coincideProducto = (v.detalles || []).some(
      (d) =>
        (d.productoNombre && d.productoNombre.toLowerCase().includes(term)) ||
        (d.codigoBarras && String(d.codigoBarras).toLowerCase().includes(term))
    );

    return (
      coincideId ||
      coincideUsuario ||
      coincideMedio ||
      coincideEstado ||
      coincideProducto
    );
  });

  return (
    <div className="flex flex-1 flex-col w-full min-h-0 overflow-hidden">
      {/* Encabezado con título y botón de actualización */}
      <div className="mb-6 flex shrink-0 items-center justify-between gap-4">
        <div className="flex flex-row items-center">
          <History
            strokeWidth={1.5}
            className="size-12 p-2 border border-border rounded-lg bg-card shrink-0"
          />
          <div className="px-3">
            <div className="text-lg font-semibold">Historial de Ventas</div>
            <div className="text-sm text-muted-foreground">
              Registro de operaciones, comprobantes y anulaciones
            </div>
          </div>
        </div>

        <Button
          variant="accent"
          type="button"
          onClick={cargarVentas}
          disabled={cargando}
          className="gap-2 font-medium h-10 px-4 max-w-none cursor-pointer"
        >
          <RefreshCw className={cn("size-4", cargando && "animate-spin")} />
          <span>Actualizar</span>
        </Button>
      </div>

      {/* Barra de búsqueda y filtro por fechas */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="mb-4 shrink-0 flex flex-wrap items-center justify-between gap-3"
      >
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por N° venta, cajero, medio de pago o producto..."
          className="w-1/4 min-w-72 rounded-md border border-border bg-input px-4 py-2.5 text-sm outline-none shadow-2xs placeholder:text-muted-foreground"
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Desde:</span>
            <Input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-40 h-10"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Hasta:</span>
            <Input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-40 h-10"
            />
          </div>
          {(desde || hasta) && (
            <Button
              type="button"
              variant="outline"
              onClick={handleLimpiarFechas}
              className="h-10 px-3 cursor-pointer"
            >
              Limpiar fechas
            </Button>
          )}
        </div>
      </form>

      {/* Tabla de Ventas */}
      <VentasTable
        ventas={ventasFiltradas}
        cargando={cargando}
        esGestor={esGestor}
        anulandoId={anulandoId}
        onVerDetalle={handleVerDetalle}
        onAnularVenta={handleAnularVenta}
        formatoPrecio={formatoPrecio}
      />

      {/* Modal para ver detalle del comprobante */}
      <DetalleVentaModal
        open={modalDetalleOpen}
        onOpenChange={setModalDetalleOpen}
        idVenta={idVentaDetalle}
        esGestor={esGestor}
        formatoPrecio={formatoPrecio}
        onVentaAnulada={cargarVentas}
      />
    </div>
  );
}
