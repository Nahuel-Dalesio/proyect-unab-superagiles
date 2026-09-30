import React, { useState } from "react";
import Swal from "sweetalert2";
import "./CajeroDashboard.css";

const MOCK_PRODUCTOS = [
  { id: 1, codigo: "779123456", nombre: "Duff Beer 473ml", precio: 2200, stock: 15 },
  { id: 2, codigo: "779987654", nombre: "Rosquilla Glaseada Rosa", precio: 1200, stock: 8 },
  { id: 3, codigo: "779555111", nombre: "Squishee Sabor Cereza", precio: 1800, stock: 20 },
  { id: 4, codigo: "779333222", nombre: "Chicle Buzz Cola", precio: 500, stock: 35 },
  { id: 5, codigo: "779444888", nombre: "Papas Fritas Krusty", precio: 1600, stock: 4 },
  { id: 6, codigo: "779777999", nombre: "Café de Filtro Apu", precio: 1100, stock: 12 },
];

export default function CajeroPOS() {
  const [productos] = useState(MOCK_PRODUCTOS);
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState("Efectivo");

  const agregarAlCarrito = (producto) => {
    const itemExistente = carrito.find((item) => item.id === producto.id);
    const cantidadActual = itemExistente ? itemExistente.cantidad : 0;

    if (cantidadActual + 1 > producto.stock) {
      Swal.fire({
        icon: "warning",
        title: "Stock insuficiente",
        text: `Solo quedan ${producto.stock} unidades de ${producto.nombre}`,
        confirmButtonColor: "#e67e22",
      });
      return;
    }

    if (itemExistente) {
      setCarrito(
        carrito.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      );
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const modificarCantidad = (id, delta) => {
    setCarrito(
      carrito
        .map((item) => {
          if (item.id === id) {
            const nuevaCantidad = item.cantidad + delta;
            return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter((item) => item.id !== id));
  };

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const finalizarVenta = () => {
    if (carrito.length === 0) {
      Swal.fire("Carrito vacío", "Agregá productos antes de cobrar", "info");
      return;
    }

    Swal.fire({
      title: "¿Confirmar cobro?",
      html: `<b>Total:</b> $${total.toLocaleString()}<br><b>Método:</b> ${metodoPago}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cobrar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#27ae60",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("¡Venta completada!", "Ticket generado correctamente", "success");
        setCarrito([]);
      }
    });
  };

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.includes(busqueda)
  );

  return (
    <div className="pos-container">
      {/* Encabezado */}
      <header className="pos-header">
        <div className="pos-brand">
          <span className="kwik-badge">KWIK-E-MART</span>
          <h1>Punto de Venta</h1>
        </div>
        <div className="pos-user-info">
          <span>Operador: <strong>cajero1</strong> (rol: cajero)</span>
          <button
            className="btn-logout"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Cuerpo principal */}
      <div className="pos-main">
        {/* Catálogo y buscador */}
        <section className="pos-catalog">
          <div className="pos-search-bar">
            <input
              type="text"
              placeholder="Buscar por código de barras o nombre de producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoFocus
            />
          </div>

          <div className="pos-products-grid">
            {productosFiltrados.map((prod) => (
              <div
                key={prod.id}
                className="pos-product-card"
                onClick={() => agregarAlCarrito(prod)}
              >
                <div className="prod-name">{prod.nombre}</div>
                <div className="prod-code">Cód: {prod.codigo}</div>
                <div className="prod-footer">
                  <span className="prod-price">${prod.precio}</span>
                  <span className={`prod-stock ${prod.stock <= 5 ? "low" : ""}`}>
                    Stock: {prod.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ticket de venta */}
        <aside className="pos-ticket">
          <h2>Ticket de Venta</h2>
          <div className="ticket-items">
            {carrito.length === 0 ? (
              <p className="empty-cart">No hay productos en el ticket</p>
            ) : (
              carrito.map((item) => (
                <div key={item.id} className="ticket-row">
                  <div className="item-info">
                    <span className="item-title">{item.nombre}</span>
                    <span className="item-unit">${item.precio} c/u</span>
                  </div>
                  <div className="item-controls">
                    <button onClick={() => modificarCantidad(item.id, -1)}>-</button>
                    <span>{item.cantidad}</span>
                    <button onClick={() => modificarCantidad(item.id, 1)}>+</button>
                  </div>
                  <div className="item-subtotal">
                    ${item.precio * item.cantidad}
                  </div>
                  <button
                    className="btn-remove"
                    onClick={() => eliminarDelCarrito(item.id)}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="ticket-summary">
            <div className="summary-line total">
              <span>Total:</span>
              <span>${total.toLocaleString()}</span>
            </div>

            <div className="payment-methods">
              <label>Forma de pago:</label>
              <div className="methods-buttons">
                {["Efectivo", "Débito", "Mercado Pago"].map((metodo) => (
                  <button
                    key={metodo}
                    type="button"
                    className={`btn-method ${metodoPago === metodo ? "active" : ""}`}
                    onClick={() => setMetodoPago(metodo)}
                  >
                    {metodo}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn-checkout" onClick={finalizarVenta}>
              COBRAR (${total.toLocaleString()})
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}