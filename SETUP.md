# Guía de Setup — Sistema Kiosco

Esta guía explica paso a paso cómo dejar el proyecto funcionando en tu máquina local, tanto backend como frontend.

**Stack:** Frontend (Vite + React + JavaScript) | Backend (Node.js + Express + JavaScript) | Base de datos (MySQL)

---

## Requisitos previos

Antes de arrancar, asegurate de tener instalado:

- **Node.js** (v18 o superior) — verificá con `node -v`
- **MySQL** instalado y corriendo localmente (Workbench, XAMPP, WAMP, o el motor MySQL solo)
- **Git**

---

## 1. Clonar el repositorio

```powershell
git clone https://github.com/Nahuel-Dalesio/proyect-unab-superagiles.git
cd proyect-unab-superagiles
```

---

## 2. Setup del Backend

### 2.1 Instalar dependencias

```powershell
cd backend
npm install
```

Esto va a instalar automáticamente todo lo que está en `package.json`: `express`, `mysql2`, `bcryptjs`, `jsonwebtoken`, `dotenv`, `cors`, y `nodemon` (como dependencia de desarrollo).

### 2.2 Configurar variables de entorno

Copiá el archivo de ejemplo y renombralo:

```powershell
copy .env.example .env
```

Abrí `.env` y completá:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_de_mysql
DB_NAME=kiosco_db

JWT_SECRET=generar_uno_propio_ver_abajo

PORT=3001
```

**Para generar tu propio `JWT_SECRET`** (no uses el de ejemplo ni copies el de otro compañero, cada uno debería generar el suyo para desarrollo local):

```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copiá el resultado como valor de `JWT_SECRET`.

**Importante:** el archivo `.env` nunca se sube al repo (está en `.gitignore`). Cada integrante tiene que crear el suyo con sus propios datos locales.

### 2.3 Crear la base de datos y la tabla

Conectate a MySQL (por Workbench o por consola):

```powershell
mysql -u root -p
```

Y corré:

```sql
CREATE DATABASE kiosco_db;
USE kiosco_db;

CREATE TABLE IF NOT EXISTS usuario (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('cajero', 'admin') NOT NULL,
    activo BOOLEAN DEFAULT true
);
```

(este mismo script está guardado en `backend/bd/seed-usuario.sql` por si preferís correrlo desde ahí)

Verificá que se creó bien:
```sql
SHOW TABLES;
DESCRIBE usuario;
EXIT;
```

### 2.4 Crear los usuarios de prueba

Con la base y la tabla ya creadas, corré el seed (parado en `backend/`):

```powershell
node scripts/seed.js
```

Esto crea 2 usuarios de prueba:
- `admin` / `admin123` (rol: admin)
- `cajero1` / `cajero123` (rol: cajero)

**Cambiá estas contraseñas antes de la entrega final**, no son para dejar en producción.

### 2.5 Levantar el servidor

```powershell
npm run dev
```

Si todo salió bien, vas a ver en consola:
```
Conectado a MySQL correctamente
Servidor corriendo en http://localhost:3001
```

Dejá esta terminal abierta mientras trabajás — el server se reinicia solo con cada cambio gracias a `nodemon`.

### 2.6 Probar que el backend responde (opcional, para verificar antes de tocar el frontend)

En otra terminal:
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}'
```

Deberías recibir un JSON con `token` y `user`.

---

## 3. Setup del Frontend

### 3.1 Instalar dependencias

En **otra terminal nueva** (dejá el backend corriendo en la anterior):

```powershell
cd frontend
npm install
```

### 3.2 Levantar el frontend

```powershell
npm run dev
```

Vite te va a mostrar una URL, típicamente:
```
http://localhost:5173
```

Abrila en el navegador.

### 3.3 Probar el login

- Andá a `http://localhost:5173/login`
- Probá con `admin` / `admin123` → debería llevarte a `/admin/productos`
- Probá con `cajero1` / `cajero123` → debería llevarte a `/`
- Si entrás a una ruta que no te corresponde por rol, el sistema te redirige automáticamente a tu pantalla correcta (no rompe ni queda en blanco)

---

## 4. Estructura del proyecto

```
proyect-unab-superagiles/
├── backend/
│   ├── server.js              # Punto de entrada de Express
│   ├── .env                   # Variables de entorno (NO se sube al repo)
│   ├── .env.example           # Plantilla de las variables necesarias
│   ├── bd/
│   │   ├── conexion.js        # Conexion a MySQL (pool)
│   │   └── seed-usuario.sql   # Script de creacion de la tabla usuario
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js # verifyToken, isAdmin
│   ├── models/
│   │   └── auth.model.js
│   ├── routes/
│   │   └── auth.routes.js
│   ├── scripts/
│   │   └── seed.js            # Crea usuarios de prueba
│   └── services/               # (vacio por ahora)
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── config.js           # URL base del backend
│       ├── routes/
│       │   └── AppRoutes.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── components/
│       │   └── ProtectedRoute.jsx
│       └── pages/
│           ├── Login.jsx
│           ├── AdminDashboard.jsx  # placeholder, se reemplaza en Sprint 2/3
│           └── CajeroPOS.jsx       # placeholder, se reemplaza en Sprint 3
└── docs/
    └── product_backlog.md
```

---

## 5. Errores comunes y cómo resolverlos

| Error | Causa probable | Solución |
|---|---|---|
| `Cannot use import statement outside a module` | Falta `"type": "module"` en `package.json` | Agregar esa línea al `package.json` del backend |
| `ERR_MODULE_NOT_FOUND` en algún `import` | Ruta relativa mal escrita (ej. `../conexion.js` en vez de `../bd/conexion.js`) | Revisar que la ruta del import coincida con la ubicación real del archivo |
| `Access denied for user 'root'@'localhost'` | `DB_PASSWORD` en el `.env` no coincide con tu contraseña real de MySQL | Verificar la contraseña conectándote por consola con `mysql -u root -p` |
| Pantalla en blanco al entrar a `/` o `/admin/...` | Sesión vieja en `localStorage` con datos inconsistentes | Limpiar con `localStorage.clear()` en la consola del navegador (F12) y recargar |
| El backend no responde desde el frontend (error de CORS) | El backend no está corriendo, o `BASE_URL` en `config.js` no coincide con el puerto real del backend | Confirmar que `npm run dev` del backend esté corriendo y que `config.js` diga `http://localhost:3001` |

---

## 6. Flujo de trabajo con Git (recordatorio rápido)

1. Traé los últimos cambios: `git checkout main` → `git pull origin main`
2. Creá tu rama: `git checkout -b feature/nombre-de-tu-tarea`
3. Trabajá y commiteá: `git add .` → `git commit -m "mensaje descriptivo"`
4. Subí tu rama: `git push origin feature/nombre-de-tu-tarea`
5. Abrí un Pull Request en GitHub, referenciando la/s issue/s que cierra (ej. `Closes #21`)
6. Esperá revisión (o mergeá si no hay nadie disponible y hace falta destrabar)
7. Volvé a `main` y traé los cambios: `git checkout main` → `git pull origin main`
8. Borrá tu rama local si ya no la necesitás: `git branch -d feature/nombre-de-tu-tarea`

---

## 7. Convención de nombres

- Carpetas: **plural** (`controllers/`, `models/`, `routes/`, `middlewares/`)
- Archivos: **singular**, describiendo el módulo (`auth.controller.js`, `auth.model.js`)
- Ramas: `feature/descripcion-corta` (ej. `feature/hu-01-backend-login`)

---

¿Dudas o algo no funciona siguiendo esta guía? Avisale a Nahuel (Scrum Master) o abrí un comentario en la issue correspondiente.