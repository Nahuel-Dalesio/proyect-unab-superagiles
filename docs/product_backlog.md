# Product Backlog — Sistema Web de Gestión de Kiosco

**Product Owner / Scrum Master:** [Tu nombre]
**Stack:** Frontend: Vite + React + JS | Backend: Node.js + Express + JS | DB: MySQL

---

## Leyenda

- **Prioridad:** 🔴 Alta | 🟡 Media | 🟢 Baja
- **SP:** Story Points (escala Fibonacci: 1, 2, 3, 5, 8)
- **Sprint:** Sprint al que está asignada según el cronograma de la profesora

---

## EPIC 1 — Autenticación y Roles
*Sprint 1 — Entrega 24/09*

### HU-01 — Login de usuarios
**Como** usuario del sistema (Cajero o Administrador)
**Quiero** poder iniciar sesión con usuario y contraseña
**Para** acceder únicamente a las funciones que me corresponden según mi rol

**Criterios de aceptación:**
- Dado un usuario y contraseña válidos, el sistema me redirige a mi pantalla correspondiente (Cajero → POS, Admin → panel completo).
- Dado un usuario o contraseña incorrectos, el sistema muestra un mensaje de error sin especificar cuál de los dos es incorrecto.
- La sesión se maneja con JWT con expiración configurable.
- Existe botón de "Cerrar sesión" visible en todo momento.

**Prioridad:** 🔴 Alta | **SP:** 5 | **Sprint:** 1

---

### HU-02 — Restricción de acceso por rol (Cajero)
**Como** Administrador (Carlos)
**Quiero** que el Cajero solo pueda ver la pantalla de cobro
**Para** que no acceda a costos, precios ni reportes del negocio

**Criterios de aceptación:**
- El usuario con rol "Cajero" no puede navegar (ni por URL directa) a rutas de administración, productos o reportes.
- Si intenta acceder a una ruta restringida, el sistema lo redirige al POS con un mensaje de "Acceso no autorizado".
- El middleware del backend valida el rol en cada request a endpoints sensibles (no solo el frontend oculta botones).

**Prioridad:** 🔴 Alta | **SP:** 5 | **Sprint:** 1

---

### HU-03 — Acceso remoto del Administrador
**Como** Dueño del kiosco
**Quiero** poder loguearme como administrador desde mi celular en casa
**Para** gestionar precios y ver reportes sin estar físicamente en el local

**Criterios de aceptación:**
- El login y el panel de administración son responsive (funcionan en mobile).
- El acceso remoto usa el mismo sistema de autenticación JWT sin privilegios especiales adicionales.

**Prioridad:** 🟡 Media | **SP:** 3 | **Sprint:** 1

---

## EPIC 2 — Gestión de Productos
*Sprint 2 — Entrega 01/10*

### HU-04 — Alta rápida de productos
**Como** Administrador
**Quiero** cargar productos nuevos rápidamente (nombre, código de barras, costo, precio, stock)
**Para** tener el catálogo actualizado sin perder tiempo

**Criterios de aceptación:**
- Formulario con campos: nombre, código de barras, precio de costo, precio de venta, stock inicial.
- Si el código de barras ya existe, el sistema avisa antes de guardar y no permite duplicados.
- Al guardar, el foco vuelve al primer campo para cargar el siguiente producto sin recargar la página.

**Prioridad:** 🔴 Alta | **SP:** 5 | **Sprint:** 2

---

### HU-05 — Búsqueda y edición de productos
**Como** Administrador
**Quiero** buscar cualquier producto fácilmente y editar su precio o stock
**Para** ajustar valores por inflación o corregir errores rápidamente

**Criterios de aceptación:**
- Buscador por nombre o código de barras con resultados en tiempo real (a medida que se tipea).
- Desde el resultado puedo editar precio de costo, precio de venta y stock, y guardar los cambios.
- El costo del producto **nunca** es visible ni editable por el rol Cajero.

**Prioridad:** 🔴 Alta | **SP:** 5 | **Sprint:** 2

---

### HU-06 — Alertas de stock bajo
**Como** Administrador
**Quiero** que el sistema me marque en color los productos con poco stock (<5 unidades)
**Para** saber qué tengo que reponer sin tener que revisar producto por producto

**Criterios de aceptación:**
- En el listado de productos, los que tienen stock < 5 se resaltan visualmente (ej. fila en rojo/amarillo).
- Existe un filtro/vista rápida de "Productos con stock bajo".
- El umbral de "stock bajo" queda parametrizado (configurable a futuro, aunque el default sea 5).

**Prioridad:** 🟡 Media | **SP:** 3 | **Sprint:** 2

---

### HU-07 — Actualización masiva de precios
**Como** Administrador
**Quiero** poder actualizar precios de varios productos a la vez (ej. por inflación general)
**Para** no tener que editar producto por producto

**Criterios de aceptación:**
- Puedo seleccionar varios productos y aplicar un % de aumento sobre el precio de venta.
- El sistema muestra una previsualización de los nuevos precios antes de confirmar.

**Prioridad:** 🟢 Baja | **SP:** 5 | **Sprint:** 2

---

## EPIC 3 — Gestión de Clientes
*Sprint 2/3*

### HU-08 — Cliente "Consumidor Final" por defecto
**Como** Cajero
**Quiero** que toda venta arranque asociada a "Consumidor Final"
**Para** no trabar la caja cuando el cliente no pide factura

**Criterios de aceptación:**
- Al iniciar una venta nueva, el cliente por defecto es "Consumidor Final" (sin necesidad de ninguna acción).
- La venta se puede cobrar sin nunca tocar el módulo de clientes.

**Prioridad:** 🔴 Alta | **SP:** 2 | **Sprint:** 3

---

### HU-09 — Búsqueda y alta rápida de cliente por CUIT/DNI
**Como** Cajero
**Quiero** un botón rápido para buscar un cliente por CUIT/DNI y cargarlo si es nuevo
**Para** poder facturarle a nombre de la persona/oficina que lo pide sin perder tiempo

**Criterios de aceptación:**
- Botón visible en el POS: "Asociar cliente".
- Si el CUIT/DNI ya existe, se autocompletan los datos (razón social, domicilio, teléfono).
- Si es nuevo, se abre una ventana modal simple (DNI/CUIT, razón social, domicilio, teléfono) que guarda el cliente en la base para futuras compras.
- El flujo de alta de cliente no supera unos pocos segundos/clicks.

**Prioridad:** 🔴 Alta | **SP:** 5 | **Sprint:** 3

---

## EPIC 4 — Punto de Venta (POS) / Carrito
*Sprint 3 — Entrega 15/10*

### HU-10 — Escaneo rápido con lector de código de barras
**Como** Cajero
**Quiero** escanear (o tipear) el código y que con Enter el producto se agregue al carrito
**Para** cobrar rápido sin usar el mouse, evitando filas largas

**Criterios de aceptación:**
- El campo de entrada tiene foco automático al entrar a la pantalla de venta.
- Al escanear/tipear código + Enter, el producto se agrega al carrito sin clicks adicionales.
- Si el código no existe, se muestra un mensaje de error visible sin romper el flujo.

**Prioridad:** 🔴 Alta | **SP:** 5 | **Sprint:** 3

---

### HU-11 — Suma de cantidad por producto repetido
**Como** Cajero
**Quiero** que si escaneo el mismo producto dos veces, se sume la cantidad en la misma fila
**Para** no llenar el carrito de filas repetidas

**Criterios de aceptación:**
- Al escanear un código ya presente en el carrito, se incrementa su cantidad (no se crea una fila nueva).
- El subtotal de esa fila y el total general se recalculan automáticamente.

**Prioridad:** 🔴 Alta | **SP:** 3 | **Sprint:** 3

---

### HU-12 — Edición y eliminación de ítems del carrito
**Como** Cajero
**Quiero** poder cambiar la cantidad o eliminar un producto del carrito antes de cobrar
**Para** corregir errores de escaneo

**Criterios de aceptación:**
- Cada fila del carrito tiene opción de +/- cantidad y botón de eliminar.
- El total se recalcula en tiempo real ante cualquier cambio.

**Prioridad:** 🔴 Alta | **SP:** 3 | **Sprint:** 3

---

### HU-13 — Cobro y cálculo de vuelto
**Como** Cajero
**Quiero** indicar el medio de pago (efectivo/tarjeta), ingresar el monto recibido y que el sistema calcule el vuelto
**Para** cobrar rápido y sin errores de cálculo mental

**Criterios de aceptación:**
- Selector de medio de pago: Efectivo / Tarjeta.
- Si es efectivo, botones grandes con billetes comunes (ej. $10.000, $20.000) y botón "Pago exacto".
- El sistema calcula y muestra el vuelto exacto a entregar.
- Si es tarjeta, no se solicita cálculo de vuelto.
- Al confirmar el cobro, se descuenta el stock automáticamente de cada producto vendido.

**Prioridad:** 🔴 Alta | **SP:** 8 | **Sprint:** 3

---

## EPIC 5 — Cierre de Caja y Reportes
*Sprint 4 — Entrega 05/11*

### HU-14 — Cierre de caja / turno
**Como** Cajero o Administrador
**Quiero** apretar un botón al finalizar el turno y ver el total en efectivo, en tarjeta y la cantidad de operaciones
**Para** poder contar la caja física y verificar que coincida

**Criterios de aceptación:**
- Botón "Cerrar turno/caja" disponible desde el POS.
- El resumen muestra: total efectivo, total tarjeta, cantidad de ventas del turno.
- El cierre queda registrado con el usuario (cajero) que estaba a cargo, fecha y hora.
- Si hay un faltante/sobrante declarado, queda anotado en el registro de cierre asociado a ese usuario.

**Prioridad:** 🔴 Alta | **SP:** 5 | **Sprint:** 4

---

### HU-15 — Reporte de productos más vendidos
**Como** Administrador
**Quiero** ver un reporte simple de los productos que más se venden
**Para** priorizar la reposición de mercadería

**Criterios de aceptación:**
- Listado ordenado por cantidad vendida, filtrable por rango de fechas.
- Se puede ver al menos: producto, cantidad vendida, total facturado.

**Prioridad:** 🟡 Media | **SP:** 3 | **Sprint:** 4

---

### HU-16 — Descarga de reporte de cierre en PDF
**Como** Administrador
**Quiero** poder descargar el cierre de caja en PDF
**Para** tener un respaldo del día/turno

**Criterios de aceptación:**
- Botón "Descargar PDF" en la pantalla de cierre de caja.
- El PDF incluye: fecha, turno, usuario responsable, totales por medio de pago y cantidad de ventas.

**Prioridad:** 🟢 Baja | **SP:** 3 | **Sprint:** 4

---

## Resumen por Sprint

| Sprint | Fecha entrega | Historias | SP Total |
|---|---|---|---|
| Sprint 1 | 24/09 | HU-01, HU-02, HU-03 | 13 |
| Sprint 2 | 01/10 | HU-04, HU-05, HU-06, HU-07 | 18 |
| Sprint 3 | 15/10 | HU-08, HU-09, HU-10, HU-11, HU-12, HU-13 | 26 |
| Sprint 4 | 05/11 | HU-14, HU-15, HU-16 | 11 |

**Total Backlog:** 16 Historias de Usuario | 68 Story Points

---

## Notas para GitHub Projects

- Cada HU se sugiere cargar como **Issue** individual, con label de Epic (`epic:auth`, `epic:productos`, `epic:clientes`, `epic:pos`, `epic:caja`) y label de prioridad (`prioridad:alta/media/baja`).
- Usar **Milestones** = Sprints (Sprint 1, Sprint 2, Sprint 3, Sprint 4) con sus fechas de entrega.
- Columnas sugeridas del tablero: `Backlog` → `Sprint Planeado` → `En progreso` → `En revisión` → `Hecho`.
