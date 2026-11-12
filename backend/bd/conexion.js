// conexion.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "kiosco_db",
  ssl:
    process.env.DB_SSL === "true"
      ? { minVersion: "TLSv1.2", rejectUnauthorized: true }
      : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Asegura que las columnas de Cuenta Corriente existan en bases de datos ya creadas
const ensureCuentaCorrienteSchema = async (connection) => {
  const [clientesCols] = await connection.query("SHOW COLUMNS FROM clientes");
  const clientesFields = new Set(clientesCols.map((c) => c.Field));

  if (!clientesFields.has("cuenta_corriente_habilitada")) {
    await connection.query(
      `ALTER TABLE clientes
       ADD COLUMN cuenta_corriente_habilitada BOOLEAN NOT NULL DEFAULT false AFTER direccion`
    );
  }

  if (!clientesFields.has("limite_credito")) {
    await connection.query(
      `ALTER TABLE clientes
       ADD COLUMN limite_credito DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER cuenta_corriente_habilitada`
    );
  }

  if (!clientesFields.has("deuda_actual")) {
    await connection.query(
      `ALTER TABLE clientes
       ADD COLUMN deuda_actual DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER limite_credito`
    );
  }

  const [ventasCols] = await connection.query("SHOW COLUMNS FROM ventas");
  const ventasMap = new Map(ventasCols.map((c) => [c.Field, c]));

  const medioPagoCol = ventasMap.get("medio_pago");
  if (medioPagoCol && !String(medioPagoCol.Type).includes("cuenta_corriente")) {
    await connection.query(
      `ALTER TABLE ventas
       MODIFY COLUMN medio_pago ENUM(
         'efectivo',
         'debito',
         'credito',
         'transferencia',
         'qr',
         'cuenta_corriente'
       ) NOT NULL`
    );
  }

  if (!ventasMap.has("estado_pago")) {
    await connection.query(
      `ALTER TABLE ventas
       ADD COLUMN estado_pago ENUM('pagada', 'pendiente', 'cancelada') NOT NULL DEFAULT 'pagada' AFTER estado`
    );
  }
};

// Test de conexion al arrancar y verificacion automatica de columnas nuevas
pool
  .getConnection()
  .then(async (connection) => {
    try {
      console.log("Conectado a MySQL correctamente");
      await ensureCuentaCorrienteSchema(connection);
    } catch (schemaError) {
      console.error(
        "Advertencia al verificar esquema de Cuenta Corriente:",
        schemaError.message
      );
    } finally {
      connection.release();
    }
  })
  .catch((error) => {
    console.error("Error al conectar a la base de datos:", error.message);
  });

export default pool;
