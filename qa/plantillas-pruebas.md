# Scripts de Prueba - Kwik-E-Mart
**Tester / QA:** Federico Siboldi  
**Materia:** Metodologías Superágiles  

---

### Script de Prueba
| Campo | Detalle |
| :--- | :--- |
| **ID de Caso de Prueba** | TC-AUTH-001 |
| **Nombre de Caso de prueba** | Restricción de acceso a rutas administrativas para rol Cajero |
| **Descripción** | Se probará que un usuario autenticado con rol Cajero no pueda visualizar opciones de gestión ni acceder mediante URL directa a la pantalla de productos/costos. |
| **Precondiciones** | 1. Backend y Frontend iniciados.<br>2. Sesión activa con credenciales de `cajero1`. |
| **Relaciones Casos de uso** | CU001 / HU-02: Restricción de acceso por rol (Cajero) - Issue #33 |
| **Pasos y condiciones ejecución** | 1. Iniciar sesión con usuario `cajero1`.<br>2. Verificar las opciones visibles en el menú lateral.<br>3. Ingresar manualmente en el navegador la URL `http://localhost:5173/productos`. |
| **Resultado Esperado** | El sidebar debe ocultar la sección de Productos y la navegación manual debe bloquear el acceso (no mostrar productos ni precios de costo). |
| **Estado Caso de Prueba** | [x] Exitoso  /  [ ] Fallido  /  [ ] Frenado  /  [ ] Pendiente |
| **Resultado Obtenido** | El menú lateral solo muestra la opción "Caja". Al forzar la URL `/productos`, el sistema responde con "Página no encontrada", restringiendo el acceso al catálogo y costos. |
| **Errores Asociados** | N/A (Comportamiento correcto según criterios de aceptación). |
| **Responsable Diseño** | Federico Siboldi |
| **Responsable Ejecución** | Federico Siboldi |
| **Comentarios** | Valida el primer criterio de la Issue #33 y requerimientos de seguridad del Sprint 1. |

### Script de Prueba (Copia)
| Campo | Detalle |
| :--- | :--- |
| **ID de Caso de Prueba** | |
| **Nombre de Caso de prueba** | |
| **Descripción** | |
| **Precondiciones** | |
| **Relaciones Casos de uso** | |
| **Pasos y condiciones ejecución** | |
| **Resultado Esperado** | |
| **Estado Caso de Prueba** | [ ] Exitoso  /  [ ] Fallido  /  [ ] Frenado  /  [ ] Pendiente |
| **Resultado Obtenido** | |
| **Errores Asociados** | |
| **Responsable Diseño** | Federico Siboldi |
| **Responsable Ejecución** | Federico Siboldi |
| **Comentarios** | |