import React, { useState, useContext } from "react";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";
import "./AdminDashboard.css";

const PRODUCTOS_INICIALES = [
  { id: 1, codigo: "779123456", nombre: "Duff Beer 473ml", categoria: "Bebidas", precio: 2200, stock: 18, stockMinimo: 10 },
  { id: 2, codigo: "779987654", nombre: "Rosquilla Glaseada Rosa", categoria: "Panadería", precio: 1200, stock: 4, stockMinimo: 8 },
  { id: 3, codigo: "779555111", nombre: "Squishee Sabor Cereza", categoria: "Bebidas", precio: 1800, stock: 2, stockMinimo: 5 },
  { id: 4, codigo: "779333222", nombre: "Chicle Buzz Cola", categoria: "Golosinas", precio: 500, stock: 45, stockMinimo: 15 },
  { id: 5, codigo: "779444888", nombre: "Papas Fritas Krusty", categoria: "Snacks", precio: 1600, stock: 0, stockMinimo: 6 },
  { id: 6, codigo: "779777999", nombre: "Café de Filtro Apu", categoria: "Cafetería", precio: 1100, stock: 12, stockMinimo: 5 },
];

export default function AdminDashboard() {
  const { logout } = useContext(AuthContext);
  const [productos, setProductos] = useState(PRODUCTOS_INICIALES);
  const [busqueda, setBusqueda] = useState("");
  
  // Modal y edición
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEdicion, setProductoEdicion] = useState(null);
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    categoria: "General",
    precio: "",
    stock: "",
    stockMinimo: 5,
  });

  const abrirModal = (prod = null) => {
    if (prod) {
      setProductoEdicion(prod);
      setForm(prod);
    } else {
      setProductoEdicion(null);
      setForm({ codigo: "", nombre: "", categoria: "General", precio: "", stock: "", stockMinimo: 5 });
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoEdicion(null);
  };

  const handleGuardar = (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.codigo.trim() || form.precio === "" || form.stock === "") {
      Swal.fire("Atención", "Todos los campos son obligatorios", "warning");
      return;
    }

    if (productoEdicion) {
      setProductos(productos.map((p) => (p.id === productoEdicion.id ? { ...form, id: p.id, precio: Number(form.precio), stock: Number(form.stock) } : p)));
      Swal.fire("Actualizado", "Producto modificado exitosamente", "success");
    } else {
      const nuevo = { ...form, id: Date.now(), precio: Number(form.precio), stock: Number(form.stock) };
      setProductos([...productos, nuevo]);
      Swal.fire("Creado", "Nuevo producto incorporado al catálogo", "success");
    }
    cerrarModal();
  };

  const handleEliminar = (id, nombre) => {
    Swal.fire({
      title: `¿Eliminar ${nombre}?`,
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#c0392b",
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setProductos(productos.filter((p) => p.id !== id));
        Swal.fire("Eliminado", "El producto fue dado de baja", "success");
      }
    });
  };

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.includes(busqueda) ||
      p.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="admin-layout">
      {/* Barra superior */}
      <header className="admin-header">
        <div className="admin-brand">
          <span className="kwik-badge">KWIK-E-MART</span>
          <h2>Panel de Administración & Inventario</h2>
        </div>
        <div className="admin-user-nav">
          <span>Usuario: <strong>admin</strong> (Administrador)</span>
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
            placeholder="Buscar por código de barras, nombre o categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button className="btn-add-product" onClick={() => abrirModal()}>
            + Nuevo Producto
          </button>
        </div>

        {/* Tabla de Inventario */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock Actual</th>
                <th>Estado</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                    No se encontraron productos coincidentes
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((prod) => {
                  const esCritico = prod.stock === 0;
                  const esBajo = prod.stock > 0 && prod.stock <= prod.stockMinimo;

                  return (
                    <tr key={prod.id} className={esCritico ? "row-critico" : esBajo ? "row-bajo" : ""}>
                      <td><strong>{prod.codigo}</strong></td>
                      <td>{prod.nombre}</td>
                      <td><span className="cat-pill">{prod.categoria}</span></td>
                      <td className="col-precio">${prod.precio.toLocaleString()}</td>
                      <td><strong>{prod.stock}</strong> u.</td>
                      <td>
                        {esCritico ? (
                          <span className="badge badge-critico">AGOTADO</span>
                        ) : esBajo ? (
                          <span className="badge badge-bajo">STOCK BAJO</span>
                        ) : (
                          <span className="badge badge-ok">NORMAL</span>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button className="btn-action edit" onClick={() => abrirModal(prod)}>
                          Editar
                        </button>
                        <button className="btn-action delete" onClick={() => handleEliminar(prod.id, prod.nombre)}>
                          Borrar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal de Alta / Edición */}
      {modalAbierto && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3>{productoEdicion ? "Modificar Producto" : "Nuevo Producto"}</h3>
            <form onSubmit={handleGuardar}>
              <div className="modal-field">
                <label>Código de Barras</label>
                <input
                  type="text"
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                  required
                />
              </div>

              <div className="modal-field">
                <label>Nombre del Producto</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="modal-field">
                <label>Categoría</label>
                <input
                  type="text"
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  required
                />
              </div>

              <div className="modal-row-2">
                <div className="modal-field">
                  <label>Precio ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.precio}
                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-field">
                  <label>Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}