# Flujo de trabajo con Git

Nadie sube directo a `main`. Todo cambio entra por una rama + Pull Request.

## Checklist

### 1. Antes de empezar
- [ ] Ir a main: `git checkout main`
- [ ] Traer lo último: `git pull origin main`
- [ ] Crear tu rama: `git checkout -b tipo/descripcion-corta`
  - Ejemplos: `feat/alta-producto`, `fix/validacion-login`, `docs/tabla-permisos`

### 2. Mientras trabajás
- [ ] Trabajá solo en tu rama (verificá con `git branch`)
- [ ] Commits chicos y con mensaje claro: `git add .` y `git commit -m "feat: formulario de alta de producto"`

### 3. Antes de subir
- [ ] Traer cambios nuevos de main: `git pull origin main` (resolvé conflictos si aparecen)
- [ ] Probar que el proyecto levanta y tu cambio funciona

### 4. Subir la rama
- [ ] `git push -u origin nombre-de-tu-rama` (la primera vez)
- [ ] Después alcanza con `git push`

### 5. Pull Request
- [ ] Abrir PR en GitHub hacia `main`
- [ ] En la descripción, una línea por issue: `Closes #39`
- [ ] Pedir revisión a otro integrante
- [ ] Mergear solo después de la aprobación

### 6. Después del merge
- [ ] `git checkout main` y `git pull origin main`
- [ ] Borrar la rama local: `git branch -d nombre-de-tu-rama`

## Reglas
- Nunca hacer push directo a `main`.
- Una rama por tarea o grupo de tareas relacionadas.
- Si hay dudas o conflictos, avisar al Scrum Master antes de forzar nada (nada de `push --force`).