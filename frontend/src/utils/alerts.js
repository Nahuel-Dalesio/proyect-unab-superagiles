import Swal from "sweetalert2";

// Opciones comunes a todas las alertas de la app
const baseOptions = {
  customClass: {
    popup: "swal-mobile",
  },
};

// Alerta genérica: permite sobreescribir cualquier opción de Swal
export const showAlert = (options) =>
  Swal.fire({
    ...baseOptions,
    ...options,
    customClass: { ...baseOptions.customClass, ...options.customClass },
  });

export const showSuccess = (text, title = "¡Listo!") =>
  showAlert({ title, text, icon: "success" });

export const showError = (text, title = "Error") =>
  showAlert({ title, text, icon: "error" });

export const showWarning = (text, title = "Atención") =>
  showAlert({ title, text, icon: "warning" });

export const showInfo = (text, title = "Información") =>
  showAlert({ title, text, icon: "info" });

// Confirmación: devuelve true si el usuario confirma, false si cancela
export const showConfirm = async (
  text,
  { title = "¿Estás seguro?", confirmText = "Sí", cancelText = "Cancelar" } = {}
) => {
  const result = await showAlert({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });
  return result.isConfirmed;
};

// Mensaje específico para HU-02 (acceso restringido por rol)
export const showUnauthorized = () =>
  showWarning("No tenés permisos para acceder a esa sección.", "Acceso no autorizado");