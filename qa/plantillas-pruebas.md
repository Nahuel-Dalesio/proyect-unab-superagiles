# Scripts de Prueba - Kwik-E-Mart
**Tester / QA:** Federico Siboldi  
**Materia:** Metodologías Superágiles  

---
# Scripts de Prueba - Kwik-E-Mart
**Tester / QA:** Federico Siboldi  
**Materia:** Metodologías Superágiles  
**Issue vinculada:** #33 - Casos de prueba: Cajero intentando acceder a rutas de Admin (HU-02 / Sprint 1)

---

### Script de Prueba 01
| Campo | Detalle |
| :--- | :--- |
| **ID de Caso de Prueba** | TC-AUTH-001 |
| **Nombre de Caso de prueba** | Bloqueo de acceso y ocultamiento de Inventario para rol Cajero |
| **Descripción** | Se probará que un usuario autenticado como Cajero no pueda visualizar la opción de Inventario en el menú lateral ni acceder mediante la URL directa (`/inventario`) para consultar productos o precios de costo. |
| **Precondiciones** | 1. Backend y Frontend en ejecución.<br>2. Base de datos MySQL conectada.<br>3. Sesión iniciada con usuario `cajero1`. |
| **Relaciones Casos de uso** | CU: Iniciar sesión / HU-02: Restricción de acceso por rol (Cajero) - Issue #33 |
| **Pasos y condiciones ejecución** | 1. Iniciar sesión con la cuenta de `cajero1`.<br>2. Comprobar las opciones disponibles en la barra lateral de navegación.<br>3. Escribir manualmente en la barra de direcciones: `http://localhost:5173/inventario` y presionar Enter. |
| **Resultado Esperado** | 1. En la barra lateral solo debe figurar la opción "Caja".<br>2. Al ingresar a `/inventario`, el sistema debe denegar el acceso, redirigir a `/caja` y advertir la falta de permisos sin exponer costos. |
| **Estado Caso de Prueba** | [x] Exitoso  /  [ ] Fallido  /  [ ] Frenado  /  [ ] Pendiente |
| **Resultado Obtenido** | El menú lateral solo muestra "Caja". Al tipear la URL `/inventario`, redirige automáticamente a `/caja` mostrando el modal: "Acceso no autorizado: No tenés permisos para acceder a esa sección."<br><br>![Cajero Bloqueado](./img/tc-auth-001-cajero-bloqueado.png) |
| **Errores Asociados** | Ninguno. Comportamiento conforme a los criterios de aceptación. |
| **Responsable Diseño** | Federico Siboldi |
| **Responsable Ejecución** | Federico Siboldi |
| **Comentarios** | Cumple con los requerimientos de restricción y seguridad para perfiles no administrativos. |

---

### Script de Prueba 02
| Campo | Detalle |
| :--- | :--- |
| **ID de Caso de Prueba** | TC-AUTH-002 |
| **Nombre de Caso de prueba** | Acceso completo a módulos administrativos para rol Administrador |
| **Descripción** | Se probará que un usuario con rol Admin pueda visualizar el menú de gestión y acceder a la pantalla de Inventario visualizando costos, stock y alta de productos. |
| **Precondiciones** | 1. Backend y Frontend en ejecución.<br>2. Sesión iniciada con credenciales de usuario `admin`. |
| **Relaciones Casos de uso** | CU: Administrar catálogo / HU-02: Restricción de acceso por rol - Issue #33 |
| **Pasos y condiciones ejecución** | 1. Iniciar sesión con usuario `admin`.<br>2. Verificar opciones en el menú lateral.<br>3. Hacer clic en "Inventario" (`/inventario`). |
| **Resultado Esperado** | Debe mostrar en la barra lateral "Caja" e "Inventario". Al acceder a `/inventario` debe cargar el listado completo con columnas de Precio costo, Precio venta, Stock y botón "+ Nuevo Producto". |
| **Estado Caso de Prueba** | [x] Exitoso  /  [ ] Fallido  /  [ ] Frenado  /  [ ] Pendiente |
| **Resultado Obtenido** | El administrador visualiza "Inventario" en la barra lateral. Al ingresar a `/inventario`, se despliega correctamente la tabla completa con precios de costo, precio venta, stock y botón de nuevo producto.<br><br>![Admin Inventario](./img/tc-auth-002-admin-inventario.png) |

| **Errores Asociados** | Ninguno. |
| **Responsable Diseño** | Federico Siboldi |
| **Responsable Ejecución** | Federico Siboldi |
| **Comentarios** | Valida el acceso total sin restricciones para el usuario Administrador.