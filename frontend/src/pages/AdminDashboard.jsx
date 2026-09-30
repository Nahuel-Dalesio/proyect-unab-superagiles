import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);

  // Lista inicial de productos típicos de kiosco
  const [productos, setProductos] = useState([
    { id: 1, codigo: "779123456", nombre: "Alfajor Capitán del Espacio", categoria: "Golosinas", costo: 600, venta: 1100, stock: 24, min: 5 },
    { id: 2, codigo: "779987654", nombre: "Coca Cola 500ml", categoria: "Bebidas", costo: 1200, venta: 2000, stock: 4, min: 6 },
    { id: 3, codigo: "779112233", nombre: "Papas Lays Clásicas 85g", categoria: "Snacks", costo: 1500, venta: 2500, stock: 12, min: 4 },
    { id: 4, codigo: "779445566", nombre: "Caramelos Sugus 50g", categoria: "Golosinas", costo: 400, venta: 800, stock: 3, min: 5 },
    { id: 5, codigo: "779778899", nombre: "Agua Mineral 500ml", categoria: "Bebidas", costo: 700, venta: 1300, stock: 18, min: 5 }
  ]);

  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevo, setNuevo] = useState({
    codigo: "",
    nombre: "",
    categoria: "Golosinas",
    costo: "",
    venta: "",
    stock: ""
  });

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.includes(busqueda)
  );

  const handleCrear = (e) => {
    e.preventDefault();
    if (!nuevo.nombre || !nuevo.venta || !nuevo.stock) return;

    const productoNuevo = {
      id: Date.now(),
      codigo: nuevo.codigo || Math.floor(100000000 + Math.random() * 900000000).toString(),
      nombre: nuevo.nombre,
      categoria: nuevo.categoria,
      costo: Number(nuevo.costo) || 0,
      venta: Number(nuevo.venta),
      stock: Number(nuevo.stock),
      min: 5
    };

    setProductos([productoNuevo, ...productos]);
    setNuevo({ codigo: "", nombre: "", categoria: "Golosinas", costo: "", venta: "", stock: "" });
    setMostrarModal(false);
  };

  const handleSumarStock = (id) => {
    setProductos(
      productos.map((p) => (p.id === id ? { ...p, stock: p.stock + 1 } : p))
    );
  };

  return (
    <div className="layout-admin">
      {/* Sidebar lateral estilo Figma */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="mini-badge">
            <span>KWIK-E</span>
            <span>MART</span>
          </div>
          <div>
            <h3>Kwik-E-Mart</h3>
            <p className="admin-tag">Super Admin</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">📦 Inventario / Stock</button>
          <button className="nav-item">🛒 Punto de Venta (Caja)</button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-pill">
            <span className="user-icon">👤</span>
            <div className="user-meta">
              <strong>{user?.username || "admin"}</strong>
              <small>Conectado</small>
            </div>
          </div>
          <button type="button" className="btn-logout" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="main-content">
        <header className="content-header">
          <div>
            <h1>Gestión de Inventario</h1>
            <p className="subtitle">Sprint 2: Control de existencias, costos y precios</p>
          </div>
          <button className="btn-primary" onClick={() => setMostrarModal(true)}>
            + Nuevo Producto
          </button>
        </header>

        {/* Barra de Filtros */}
        <section className="search-section">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre o escanear código de barras..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
        </section>

        {/* Tabla de Productos */}
        <div className="table-card">
          <table className="products-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Costo</th>
                <th>Precio Venta</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "24px" }}>
                    No se encontraron productos coincidentes.
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((item) => {
                  const bajoStock = item.stock <= item.min;
                  return (
                    <tr key={item.id} className={bajoStock ? "row-warning" : ""}>
                      <td className="code-text">{item.codigo}</td>
                      <td><strong>{item.nombre}</strong></td>
                      <td><span className="badge-cat">{item.categoria}</span></td>
                      <td className="cost-text">${item.costo.toLocaleString()}</td>
                      <td className="price-text">${item.venta.toLocaleString()}</td>
                      <td className="stock-cell">
                        <strong>{item.stock}</strong> u.
                      </td>
                      <td>
                        {bajoStock ? (
                          <span className="tag-alert">⚠️ Reponer</span>
                        ) : (
                          <span className="tag-ok">Normal</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-quick-add"
                          title="Sumar 1 unidad al stock"
                          onClick={() => handleSumarStock(item.id)}
                        >
                          +1 Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de Alta de Producto */}
        {mostrarModal && (
          <div className="modal-overlay">
            <div className="modal-window">
              <h3>Agregar Producto al Stock</h3>
              <form onSubmit={handleCrear}>
                <div className="modal-form-grid">
                  <div className="form-field">
                    <label>Código de Barras</label>
                    <input
                      type="text"
                      placeholder="ej: 779000123"
                      value={nuevo.codigo}
                      onChange={(e) => setNuevo({ ...nuevo, codigo: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Nombre del Producto *</label>
                    <input
                      type="text"
                      placeholder="ej: Chicles Beldent Menta"
                      value={nuevo.nombre}
                      onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Categoría</label>
                    <select
                      value={nuevo.categoria}
                      onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })}
                    >
                      <option value="Golosinas">Golosinas</option>
                      <option value="Bebidas">Bebidas</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Cigarrillos">Cigarrillos</option>
                      <option value="Almacén">Almacén</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Precio Costo (Compra)</label>
                    <input
                      type="number"
                      placeholder="ej: 500"
                      value={nuevo.costo}
                      onChange={(e) => setNuevo({ ...nuevo, costo: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Precio Venta (Kiosco) *</label>
                    <input
                      type="number"
                      placeholder="ej: 950"
                      value={nuevo.venta}
                      onChange={(e) => setNuevo({ ...nuevo, venta: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Stock Inicial *</label>
                    <input
                      type="number"
                      placeholder="ej: 20"
                      value={nuevo.stock}
                      onChange={(e) => setNuevo({ ...nuevo, stock: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setMostrarModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Guardar Producto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;