// Generador e impresor de Ticket (Consumidor Final) y Factura C (con datos del cliente)

const EMISOR = {
  nombreFantasia: "KWIK-E-MART",
  razonSocial: "Kwik-E-Mart Springfield S.R.L.",
  cuit: "30-71234567-9",
  ingresosBrutos: "30-71234567-9",
  domicilio: "Av. Siempreviva 742 - Springfield",
  condicionIva: "Responsable Monotributo",
  inicioActividades: "01/03/2024",
  puntoVenta: "00001",
};

const escaparHtml = (texto) =>
  String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatoMoneda = (valor) =>
  `$${Number(valor || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatearNumeroComprobante = (idVenta) =>
  `${EMISOR.puntoVenta}-${String(Number(idVenta || 1)).padStart(8, "0")}`;

const formatearFechaHora = (fechaIso) => {
  const fecha = fechaIso ? new Date(fechaIso) : new Date();
  if (isNaN(fecha.getTime())) return String(fechaIso || "");
  return fecha.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatearFechaCorta = (fechaIso) => {
  const fecha = fechaIso ? new Date(fechaIso) : new Date();
  if (isNaN(fecha.getTime())) return String(fechaIso || "");
  return fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const generarCaeSimulado = (idVenta) => {
  const base = 74185296300000 + Number(idVenta || 1) * 137;
  return String(base).slice(0, 14);
};

const formatearMedioPago = (medio) => {
  switch (medio) {
    case "efectivo":
      return "Efectivo";
    case "transferencia":
      return "Transferencia";
    case "debito":
      return "Tarjeta de Débito";
    case "credito":
      return "Tarjeta de Crédito";
    case "qr":
      return "Pago QR";
    case "cuenta_corriente":
      return "Cuenta Corriente (Fiado)";
    default:
      return String(medio || "Efectivo").toUpperCase();
  }
};

const normalizarCliente = (venta) => {
  if (venta?.cliente && typeof venta.cliente === "object") {
    return venta.cliente;
  }
  if (venta?.idCliente || venta?.clienteNombre || venta?.clienteNumeroDocumento) {
    return {
      id_cliente: venta.idCliente,
      nombre: venta.clienteNombre || "",
      apellido: venta.clienteApellido || "",
      tipo_documento: venta.clienteTipoDocumento || "DNI",
      numero_documento: venta.clienteNumeroDocumento || "—",
      email: venta.clienteEmail || "",
      telefono: venta.clienteTelefono || "",
      direccion: venta.clienteDireccion || "",
    };
  }
  return null;
};

const generarHtmlTicket = (venta, opciones = {}) => {
  const nroComprobante = formatearNumeroComprobante(venta?.idVenta);
  const fechaHora = formatearFechaHora(venta?.fechaHora);
  const cajero = escaparHtml(venta?.username || `Usuario #${venta?.idUsuario || 1}`);
  const medioPago = escaparHtml(formatearMedioPago(venta?.medioPago));
  const detalles = Array.isArray(venta?.detalles) ? venta.detalles : [];
  const total = Number(venta?.total || 0);
  const montoRecibido =
    opciones.montoRecibido !== undefined ? Number(opciones.montoRecibido) : null;
  const cambio = opciones.cambio !== undefined ? Number(opciones.cambio) : null;

  const filasItems = detalles
    .map((item) => {
      const nombre = escaparHtml(item.productoNombre || item.nombre || "Producto");
      const cantidad = Number(item.cantidad || 1);
      const unitario = Number(item.precioUnitario ?? item.precioVenta ?? 0);
      const subtotal = Number(item.subtotal ?? cantidad * unitario);
      return `
        <tr>
          <td colspan="3" class="item-name">${nombre}</td>
        </tr>
        <tr class="item-values">
          <td>${cantidad} x ${formatoMoneda(unitario)}</td>
          <td></td>
          <td class="right">${formatoMoneda(subtotal)}</td>
        </tr>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Ticket ${nroComprobante}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 4mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: "Courier New", Courier, monospace;
      font-size: 12px;
      color: #000;
      background: #fff;
      width: 72mm;
      margin: 0 auto;
      padding: 8px 4px;
      line-height: 1.35;
    }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: bold; }
    .title {
      font-size: 16px;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .divider {
      border-top: 1px dashed #000;
      margin: 6px 0;
    }
    .meta {
      font-size: 11px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    .item-name {
      padding-top: 4px;
      font-weight: bold;
    }
    .item-values td {
      font-size: 11px;
      padding-bottom: 3px;
    }
    .total-row {
      font-size: 14px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      margin: 4px 0;
    }
    .sub-row {
      font-size: 11px;
      display: flex;
      justify-content: space-between;
      margin: 2px 0;
    }
    @media screen {
      body {
        margin: 20px auto;
        padding: 16px;
        border: 1px solid #ddd;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      }
    }
  </style>
</head>
<body>
  <div class="center">
    <div class="title">${EMISOR.nombreFantasia}</div>
    <div class="meta">${EMISOR.razonSocial}</div>
    <div class="meta">CUIT: ${EMISOR.cuit}</div>
    <div class="meta">${EMISOR.domicilio}</div>
    <div class="meta">IVA: ${EMISOR.condicionIva}</div>
  </div>

  <div class="divider"></div>

  <div class="center bold">TICKET A CONSUMIDOR FINAL</div>
  <div class="meta">Nro. Ticket: ${nroComprobante}</div>
  <div class="meta">Fecha: ${fechaHora}</div>
  <div class="meta">Cajero: ${cajero}</div>

  <div class="divider"></div>

  <table>
    <thead>
      <tr class="meta bold">
        <td style="text-align:left;">CANT x PRECIO</td>
        <td></td>
        <td class="right">IMPORTE</td>
      </tr>
    </thead>
    <tbody>
      ${filasItems}
    </tbody>
  </table>

  <div class="divider"></div>

  <div class="total-row">
    <span>TOTAL</span>
    <span>${formatoMoneda(total)}</span>
  </div>
  <div class="sub-row">
    <span>Medio de pago:</span>
    <span>${medioPago}</span>
  </div>
  ${
    venta?.medioPago === "efectivo" && montoRecibido !== null
      ? `
    <div class="sub-row">
      <span>Efectivo recibido:</span>
      <span>${formatoMoneda(montoRecibido)}</span>
    </div>
    <div class="sub-row">
      <span>Su vuelto:</span>
      <span>${formatoMoneda(Math.max(0, cambio || 0))}</span>
    </div>
  `
      : ""
  }

  <div class="divider"></div>

  <div class="center meta" style="margin-top:6px;">
    ¡Gracias por su compra!<br/>
    ¡Vuelva prontos!
  </div>
</body>
</html>`;
};

const generarHtmlFacturaC = (venta) => {
  const cliente = normalizarCliente(venta);
  const nroComprobante = formatearNumeroComprobante(venta?.idVenta);
  const fechaEmision = formatearFechaCorta(venta?.fechaHora);
  const fechaHora = formatearFechaHora(venta?.fechaHora);
  const cae = generarCaeSimulado(venta?.idVenta);
  const medioPago = escaparHtml(formatearMedioPago(venta?.medioPago));
  const cajero = escaparHtml(venta?.username || `Usuario #${venta?.idUsuario || 1}`);
  const detalles = Array.isArray(venta?.detalles) ? venta.detalles : [];
  const total = Number(venta?.total || 0);

  const nombreCompleto = escaparHtml(
    cliente
      ? `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() || "Consumidor Final"
      : "Consumidor Final"
  );
  const tipoDoc = escaparHtml(cliente?.tipo_documento || "DNI");
  const nroDoc = escaparHtml(cliente?.numero_documento || "—");
  const direccion = escaparHtml(cliente?.direccion || "Sin especificar");
  const telefono = escaparHtml(cliente?.telefono || "—");
  const email = escaparHtml(cliente?.email || "—");
  const condicionIvaReceptor =
    tipoDoc === "CUIT" ? "Responsable Monotributo / Inscripto" : "Consumidor Final";

  const filasItems = detalles
    .map((item, idx) => {
      const codigo = escaparHtml(item.codigoBarras || item.idProducto || idx + 1);
      const nombre = escaparHtml(item.productoNombre || item.nombre || "Producto");
      const cantidad = Number(item.cantidad || 1);
      const unitario = Number(item.precioUnitario ?? item.precioVenta ?? 0);
      const subtotal = Number(item.subtotal ?? cantidad * unitario);
      return `
        <tr>
          <td class="center mono">${codigo}</td>
          <td>${nombre}</td>
          <td class="center">${cantidad}</td>
          <td class="right">${formatoMoneda(unitario)}</td>
          <td class="center">0,00%</td>
          <td class="right bold">${formatoMoneda(subtotal)}</td>
        </tr>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Factura C ${nroComprobante}</title>
  <style>
    @page {
      size: A4;
      margin: 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12px;
      color: #111;
      background: #fff;
      max-width: 780px;
      margin: 0 auto;
      padding: 12px;
    }
    .box {
      border: 1.5px solid #000;
      margin-bottom: -1.5px;
    }
    .header-top {
      text-align: center;
      font-weight: bold;
      font-size: 13px;
      padding: 6px;
      border-bottom: 1.5px solid #000;
      background: #f5f5f5;
      letter-spacing: 1px;
    }
    .header-grid {
      display: grid;
      grid-template-columns: 1fr 76px 1fr;
      position: relative;
    }
    .header-col {
      padding: 14px 16px;
      line-height: 1.55;
    }
    .header-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      border-left: 1.5px solid #000;
      border-right: 1.5px solid #000;
      padding: 8px 4px;
      background: #fafafa;
    }
    .letra-factura {
      font-size: 36px;
      font-weight: bold;
      line-height: 1;
    }
    .cod-factura {
      font-size: 10px;
      font-weight: bold;
      margin-top: 4px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 6px;
    }
    .doc-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 6px;
    }
    .client-box {
      padding: 12px 16px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 16px;
      line-height: 1.45;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      border: 1.5px solid #000;
    }
    .items-table th {
      background: #f0f0f0;
      border: 1px solid #000;
      padding: 8px;
      font-size: 11px;
      text-transform: uppercase;
    }
    .items-table td {
      border-left: 1px solid #000;
      border-right: 1px solid #000;
      border-bottom: 1px solid #ddd;
      padding: 7px 8px;
      font-size: 12px;
    }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: bold; }
    .mono { font-family: "Courier New", Courier, monospace; }
    .totals-box {
      margin-top: 12px;
      border: 1.5px solid #000;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
    }
    .total-line {
      display: flex;
      justify-content: space-between;
      width: 260px;
      font-size: 13px;
    }
    .total-final {
      font-size: 16px;
      font-weight: bold;
      border-top: 1.5px solid #000;
      padding-top: 6px;
    }
    .footer-cae {
      margin-top: 10px;
      border: 1.5px solid #000;
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      background: #fafafa;
    }
  </style>
</head>
<body>
  <div class="box">
    <div class="header-top">ORIGINAL</div>
    <div class="header-grid">
      <div class="header-col">
        <div class="brand-title">${EMISOR.nombreFantasia}</div>
        <div><strong>Razón Social:</strong> ${EMISOR.razonSocial}</div>
        <div><strong>Domicilio Comercial:</strong> ${EMISOR.domicilio}</div>
        <div><strong>Condición frente al IVA:</strong> ${EMISOR.condicionIva}</div>
      </div>

      <div class="header-center">
        <div class="letra-factura">C</div>
        <div class="cod-factura">COD. 011</div>
      </div>

      <div class="header-col">
        <div class="doc-title">FACTURA</div>
        <div><strong>Punto de Venta:</strong> ${EMISOR.puntoVenta} &nbsp; <strong>Comp. Nro:</strong> ${String(Number(venta?.idVenta || 1)).padStart(8, "0")}</div>
        <div><strong>Fecha de Emisión:</strong> ${fechaEmision}</div>
        <div><strong>CUIT:</strong> ${EMISOR.cuit}</div>
        <div><strong>Ingresos Brutos:</strong> ${EMISOR.ingresosBrutos}</div>
        <div><strong>Inicio de Actividades:</strong> ${EMISOR.inicioActividades}</div>
      </div>
    </div>
  </div>

  <div class="box client-box">
    <div><strong>Apellido y Nombre / Razón Social:</strong> ${nombreCompleto}</div>
    <div><strong>${tipoDoc}:</strong> ${nroDoc}</div>
    <div><strong>Condición frente al IVA:</strong> ${condicionIvaReceptor}</div>
    <div><strong>Domicilio:</strong> ${direccion}</div>
    <div><strong>Teléfono:</strong> ${telefono}</div>
    <div><strong>Email:</strong> ${email}</div>
    <div><strong>Condición de Venta:</strong> ${medioPago}</div>
    <div><strong>Atendido por:</strong> ${cajero} (${fechaHora})</div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 110px;">Código</th>
        <th style="text-align: left;">Producto / Servicio</th>
        <th style="width: 70px;">Cantidad</th>
        <th style="width: 110px;">Precio Unit.</th>
        <th style="width: 80px;">% Bonif.</th>
        <th style="width: 120px;">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${filasItems}
    </tbody>
  </table>

  <div class="totals-box">
    <div class="total-line">
      <span>Subtotal:</span>
      <span>${formatoMoneda(total)}</span>
    </div>
    <div class="total-line">
      <span>Importe Otros Tributos:</span>
      <span>$0,00</span>
    </div>
    <div class="total-line total-final">
      <span>Importe Total:</span>
      <span>${formatoMoneda(total)}</span>
    </div>
  </div>

  <div class="footer-cae">
    <div>
      Comprobante emitido por Responsable Monotributo.<br/>
      El crédito fiscal discriminado en el presente comprobante no corresponde.
    </div>
    <div class="right">
      <div><strong>CAE N°:</strong> ${cae}</div>
      <div><strong>Fecha de Vto. de CAE:</strong> ${fechaEmision}</div>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Abre la ventana de impresión con el comprobante correspondiente:
 * - Si la venta tiene un cliente asociado (o se pide tipo='factura'), imprime Factura C.
 * - Si la venta es anónima (Consumidor Final) (o se pide tipo='ticket'), imprime Ticket.
 */
export const imprimirComprobante = (venta, opciones = {}) => {
  if (!venta) return;

  const cliente = normalizarCliente(venta);
  const tipo =
    opciones.tipo || (cliente ? "factura" : "ticket");

  const html =
    tipo === "factura"
      ? generarHtmlFacturaC(venta)
      : generarHtmlTicket(venta, opciones);

  const ventana = window.open("", "_blank", "width=850,height=720");
  if (!ventana) {
    // Fallback con iframe oculto si el navegador bloquea popups
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1500);
      }, 250);
    }
    return;
  }

  ventana.document.open();
  ventana.document.write(html);
  ventana.document.close();

  ventana.onload = () => {
    ventana.focus();
    ventana.print();
  };
};

