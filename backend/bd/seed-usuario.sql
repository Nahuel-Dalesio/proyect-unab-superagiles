-- =========================================================
-- Seed inicial: crea la tabla usuario y el usuario Administrador
-- El usuario Cajero se creara mas adelante DESDE la app,
-- por el propio Admin (fuera del alcance del Sprint 1)
-- =========================================================

CREATE TABLE IF NOT EXISTS usuario (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('cajero', 'admin') NOT NULL,
    activo BOOLEAN DEFAULT true
);

-- La contraseña de abajo corresponde al hash bcrypt de "admin123"
-- generalo vos mismo con el script seed.js (ver mas abajo) para no
-- versionar un hash fijo en el repo.

-- INSERT INTO usuario (username, password, rol, activo)
-- VALUES ('admin', '<HASH_BCRYPT_AQUI>', 'admin', true);
