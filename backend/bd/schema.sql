USE kiosco_db;

-- La tabla usuario ya existe y no se recrea.

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

CREATE TABLE IF NOT EXISTS clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    tipo_documento ENUM('DNI', 'CUIT', 'OTRO'),
    numero_documento VARCHAR(20) UNIQUE,
    email VARCHAR(100),
    telefono VARCHAR(30),
    direccion VARCHAR(255),
    activo BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS medios_pago (
    id_medio_pago INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS ventas (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    fecha_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    idUsuario INT NOT NULL,
    id_cliente INT,
    id_medio_pago INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('completada', 'anulada') NOT NULL DEFAULT 'completada',
    CHECK (total >= 0),
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
        ON DELETE SET NULL,
    FOREIGN KEY (id_medio_pago) REFERENCES medios_pago(id_medio_pago)
);

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
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

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
);

INSERT IGNORE INTO medios_pago (nombre) VALUES
    ('Efectivo'),
    ('Débito'),
    ('Crédito'),
    ('Transferencia'),
    ('QR');