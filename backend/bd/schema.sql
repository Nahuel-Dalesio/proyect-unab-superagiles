-- =========================================================
-- Esquema inicial de kiosco_db (issue #60)
-- Se puede ejecutar varias veces: lo que ya existe no se recrea.
-- =========================================================

CREATE DATABASE IF NOT EXISTS kiosco_db
    DEFAULT CHARACTER SET utf8mb4;
USE kiosco_db;

-- Se ejecuta SIEMPRE, aunque la base ya exista:
-- fija utf8mb4 como charset por defecto para las tablas nuevas.
ALTER DATABASE kiosco_db CHARACTER SET utf8mb4;

-- ---------------------------------------------------------
-- usuario: si ya existe NO se recrea (ni se pierden sus datos)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuario (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('cajero', 'admin') NOT NULL,
    activo BOOLEAN DEFAULT true
);

-- Si usuario ya existia con otro charset, se convierte a utf8mb4.
-- Los datos se conservan.
ALTER TABLE usuario CONVERT TO CHARACTER SET utf8mb4;

-- El usuario admin NO se inserta aca para no versionar un hash fijo.
-- Se crea con el script seed.js (hash bcrypt generado en cada entorno).
-- INSERT INTO usuario (username, password, rol, activo)
-- VALUES ('admin', '<HASH_BCRYPT_AQUI>', 'admin', true);

-- ---------------------------------------------------------
-- productos
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    codigo_barras VARCHAR(50) UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    precio_costo DECIMAL(10,2) NOT NULL DEFAULT 0,
    precio_venta DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    CHECK (precio_costo >= 0),
    CHECK (precio_venta >= 0),
    CHECK (stock >= 0),
    CHECK (stock_minimo >= 0)
);

-- ---------------------------------------------------------
-- clientes: solo para quienes piden factura.
-- Consumidor final = venta sin cliente (id_cliente NULL).
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    tipo_documento ENUM('DNI', 'CUIT', 'CUIL') NOT NULL,
    numero_documento VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    telefono VARCHAR(30),
    direccion VARCHAR(255),
    activo BOOLEAN NOT NULL DEFAULT true
);

-- ---------------------------------------------------------
-- ventas
-- id_cliente NULL = consumidor final (nunca significa "cliente borrado",
-- porque los clientes no se pueden borrar: ON DELETE RESTRICT).
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS ventas (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    fecha_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    idUsuario INT NOT NULL,
    id_cliente INT NULL,
    medio_pago ENUM('efectivo', 'debito', 'credito', 'transferencia', 'qr') NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('completada', 'anulada') NOT NULL DEFAULT 'completada',
    CHECK (total >= 0),
    -- Reportes por fecha (todas las ventas entre dos fechas)
    INDEX idx_ventas_fecha (fecha_hora),
    -- Reportes por usuario, y por usuario + fecha
    INDEX idx_ventas_usuario_fecha (idUsuario, fecha_hora),
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario)
        ON DELETE RESTRICT,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
        ON DELETE RESTRICT
);

-- ---------------------------------------------------------
-- detalle_venta
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS detalle_venta (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    CHECK (cantidad > 0),
    CHECK (precio_unitario >= 0),
    CHECK (subtotal >= 0),
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta)
        ON DELETE RESTRICT,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
        ON DELETE RESTRICT
);

-- ---------------------------------------------------------
-- cierres_caja
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS cierres_caja (
    id_cierre INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    fecha_apertura DATETIME NOT NULL,
    fecha_cierre DATETIME,
    monto_inicial DECIMAL(10,2) NOT NULL DEFAULT 0,
    monto_final DECIMAL(10,2),
    total_ventas DECIMAL(10,2) NOT NULL DEFAULT 0,
    diferencia DECIMAL(10,2),
    estado ENUM('abierta', 'cerrada') NOT NULL DEFAULT 'abierta',
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario)
        ON DELETE RESTRICT
);