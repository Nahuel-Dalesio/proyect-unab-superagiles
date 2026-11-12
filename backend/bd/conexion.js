// conexion.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: ".env2" });

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

pool.getConnection()
  .then((connection) => {
    console.log("Conectado a la base de datos correctamente");
    connection.release();
  })
  .catch((error) => {
    console.error("Error al conectar a la base de datos:", error.message);
  });

export default pool;