import { useCallback, useEffect, useState } from "react";
import { ClipboardCheck, RefreshCw } from "lucide-react";
import { getHistorialCierres } from "@/service/caja.service";
import { showError } from "@/utils/alerts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CierresCajaTable } from "@/components/CierresCajaTable";
import { cn } from "@/lib/utils";

const formatoPrecio = (valor) =>
  `$${Number(valor || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function CierresCaja() {
  const [cierres, setCierres] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const cargarCierres = useCallback(async () => {
    setCargando(true);
    try {
      const data = await getHistorialCierres();
      setCierres(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(
        error.status
          ? error.message
          : "Error de conexión al cargar el historial de cierres de caja"
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarCierres();
  }, [cargarCierres]);

  const handleLimpiarFechas = () => {
    setDesde("");
    setHasta("");
  };

  const cierresFiltrados = (cierres || []).filter((item) => {
    const term = busqueda.toLowerCase().trim();
    const coincideTexto =
      !term ||
      (item.username && item.username.toLowerCase().includes(term)) ||
      String(item.idCierre ?? "").includes(term) ||
      (item.estado && item.estado.toLowerCase().includes(term));

    if (!coincideTexto) return false;

    if (desde && item.fechaApertura) {
      const fechaAp = new Date(item.fechaApertura);
      const fechaDesde = new Date(`${desde}T00:00:00`);
      if (fechaAp < fechaDesde) return false;
    }

    if (hasta && item.fechaApertura) {
      const fechaAp = new Date(item.fechaApertura);
      const fechaHasta = new Date(`${hasta}T23:59:59`);
      if (fechaAp > fechaHasta) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-1 flex-col w-full min-h-0 overflow-hidden">
      {/* Encabezado con título y botón de actualización */}
      <div className="mb-6 flex shrink-0 items-center justify-between gap-4">
        <div className="flex flex-row items-center">
          <ClipboardCheck
            strokeWidth={1.5}
            className="size-12 p-2 border border-border rounded-lg bg-card shrink-0"
          />
          <div className="px-3">
            <div className="text-lg font-semibold">Historial de Cierres de Caja</div>
            <div className="text-sm text-muted-foreground">
              Control de turnos por empleado, efectivo ingresado y diferencias de arqueo
            </div>
          </div>
        </div>

        <Button
          variant="accent"
          type="button"
          onClick={cargarCierres}
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
          placeholder="Buscar por empleado o N° de turno..."
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

      {/* Tabla de Cierres de Caja */}
      <CierresCajaTable
        cierres={cierresFiltrados}
        cargando={cargando}
        formatoPrecio={formatoPrecio}
      />
    </div>
  );
}

