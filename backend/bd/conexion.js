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
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test de conexion al arrancar (opcional, util para detectar errores rapido)
pool.getConnection()
  .then((connection) => {
    console.log("Conectado a MySQL correctamente");
    connection.release();
  })
  .catch((error) => {
    console.error("Error al conectar a MySQL:", error.message);
  });

export default pool;