import React, { useState, useContext, useEffect, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getProductos, crearProducto } from "../../service/product.service";
import { showSuccess, showError, showWarning } from "../../utils/alerts";
import { ROLES } from "../../utils/roles";
import "./Productos.css";

const FORM_INICIAL = {
  codigoBarras: "",
  nombre: "",
  descripcion: "",
  precioCosto: "",
  precioVenta: "",
  stock: "",
  stockMinimo: 5,
};

// MySQL devuelve los DECIMAL como string ("2200.00"), por eso se convierte a número
const formatoPrecio = (valor) =>
  `$${Number(valor).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Para comparar textos sin importar mayúsculas, tildes ni espacios en los bordes
const normalizar = (texto) =>
  String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export default function Productos() {
  const { user, logout } = useContext(AuthContext);

  // Solo UX: la seguridad real está en el backend (authorizeRoles y filtro de precioCosto)
  const esGestor = user?.rol === ROLES.ADMIN || user?.rol === ROLES.ENCARGADO;
  const totalColumnas = esGestor ? 8 : 6;

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // Modal de alta
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    setErrorCarga("");

    try {
      const data = await getProductos();
      setProductos(data);
    } catch (error) {
      setErrorCarga(
        error.status ? error.message : "Error de conexión con el servidor"
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const abrirModal = () => {
    setForm(FORM_INICIAL);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();

    const codigoBarras = form.codigoBarras.trim();
    const nombre = form.nombre.trim();

    if (!codigoBarras || !nombre) {
      showWarning("El código de barras y el nombre son obligatorios.");
      return;
    }

    setGuardando(true);

    try {
      await crearProducto({
        codigoBarras,
        nombre,
        descripcion: form.descripcion.trim(),
        precioCosto: Number(form.precioCosto),
        precioVenta: Number(form.precioVenta),
        stock: Number(form.stock),
        stockMinimo: Number(form.stockMinimo),
      });

      cerrarModal();
      showSuccess("Nuevo producto incorporado al catálogo.", "Creado");
      await cargarProductos();
    } catch (error) {
      showError(
        error.status ? error.message : "Error de conexión con el servidor"
      );
    } finally {
      setGuardando(false);
    }
  };

  // Nombre: coincidencia parcial. Código de barras: coincide por prefijo
  // (los que empiezan con lo escrito), a medida que se tipea.
  const termino = normalizar(busqueda);
  const productosFiltrados = productos.filter(
    (p) =>
      normalizar(p.nombre).includes(termino) ||
      normalizar(p.codigoBarras).startsWith(termino)
  );

  const renderCuerpoTabla = () => {
    if (cargando) {
      return (
        <tr>
          <td colSpan={totalColumnas} style={{ textAlign: "center", padding: "20px" }}>
            Cargando productos...
          </td>
        </tr>
      );
    }

    if (errorCarga) {
      return (
        <tr>
          <td colSpan={totalColumnas} style={{ textAlign: "center", padding: "20px" }}>
            {errorCarga}{" "}
            <button className="btn-action edit" onClick={cargarProductos}>
              Reintentar
            </button>
          </td>
        </tr>
      );
    }

    if (productosFiltrados.length === 0) {
      return (
        <tr>
          <td colSpan={totalColumnas} style={{ textAlign: "center", padding: "20px" }}>
            No se encontraron productos coincidentes
          </td>
        </tr>
      );
    }

    return productosFiltrados.map((prod) => {
      const esCritico = prod.stock === 0;
      const esBajo = prod.stock > 0 && prod.stock <= prod.stockMinimo;

      return (
        <tr
          key={prod.idProducto}
          className={esCritico ? "row-critico" : esBajo ? "row-bajo" : ""}
        >
          <td><strong>{prod.codigoBarras}</strong></td>
          <td>{prod.nombre}</td>
          {esGestor && <td>{formatoPrecio(prod.precioCosto)}</td>}
          <td className="col-precio">{formatoPrecio(prod.precioVenta)}</td>
          <td><strong>{prod.stock}</strong> u.</td>
          <td>{prod.stockMinimo} u.</td>
          <td>
            {esCritico ? (
              <span className="badge badge-critico">AGOTADO</span>
            ) : esBajo ? (
              <span className="badge badge-bajo">STOCK BAJO</span>
            ) : (
              <span className="badge badge-ok">NORMAL</span>
            )}
          </td>
          {esGestor && (
            <td style={{ textAlign: "center" }}>
              <button className="btn-action edit" disabled title="Próximamente">
                Editar
              </button>
              <button className="btn-action delete" disabled title="Próximamente">
                Borrar
              </button>
            </td>
          )}
        </tr>
      );
    });
  };

  return (
    <div className="admin-layout">
      {/* Barra superior */}
      <header className="admin-header">
        <div className="admin-brand">
          <span className="kwik-badge">KWIK-E-MART</span>
          <h2>Inventario de Productos</h2>
        </div>
        <div className="admin-user-nav">
          <span>Usuario: <strong>{user?.username}</strong> ({user?.rol})</span>
          <button
            className="btn-admin-logout"
            onClick={() => {
              if (logout) logout();
              else {
                localStorage.clear();
                window.location.href = "/login";
              }
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="admin-content">
        <div className="admin-toolbar">
          <input
            type="text"
            className="input-search"
            placeholder="Buscar por nombre o código de barras..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {esGestor && (
            <button className="btn-add-product" onClick={abrirModal}>
              + Nuevo Producto
            </button>
          )}
        </div>

        {/* Tabla de Inventario */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                {esGestor && <th>Precio costo</th>}
                <th>Precio venta</th>
                <th>Stock actual</th>
                <th>Stock mínimo</th>
                <th>Estado</th>
                {esGestor && <th style={{ textAlign: "center" }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>{renderCuerpoTabla()}</tbody>
          </table>
        </div>
      </main>

      {/* Modal de alta (solo admin y encargado) */}
      {esGestor && modalAbierto && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3>Nuevo Producto</h3>
            <form onSubmit={handleGuardar}>
              <div className="modal-field">
                <label>Código de barras</label>
                <input
                  type="text"
                  maxLength={50}
                  value={form.codigoBarras}
                  onChange={(e) => setForm({ ...form, codigoBarras: e.target.value })}
                  required
                />
              </div>

              <div className="modal-field">
                <label>Nombre del producto</label>
                <input
                  type="text"
                  maxLength={100}
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="modal-field">
                <label>Descripción (opcional)</label>
                <input
                  type="text"
                  maxLength={255}
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                />
              </div>

              <div className="modal-row-2">
                <div className="modal-field">
                  <label>Precio de costo ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.precioCosto}
                    onChange={(e) => setForm({ ...form, precioCosto: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-field">
                  <label>Precio de venta ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.precioVenta}
                    onChange={(e) => setForm({ ...form, precioVenta: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-row-2">
                <div className="modal-field">
                  <label>Stock</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-field">
                  <label>Stock mínimo</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stockMinimo}
                    onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}