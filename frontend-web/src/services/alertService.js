// SweetAlert2 loaded via CDN
const Swal = window.Swal;

class AlertService {
  // Confirmación básica
  static async confirm(title, text, icon = 'question') {
    const result = await Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    });
    
    return result.isConfirmed;
  }

  // Confirmación para eliminar
  static async confirmDelete(itemName = 'este elemento') {
    return this.confirm(
      '¿Estás seguro?',
      `¿Estás seguro de que quieres eliminar ${itemName}? Esta acción no se puede deshacer.`,
      'warning'
    );
  }

  // Confirmación para desactivar
  static async confirmDeactivate(itemName = 'este elemento') {
    return this.confirm(
      '¿Desactivar?',
      `¿Estás seguro de que quieres desactivar ${itemName}?`,
      'warning'
    );
  }

  // Confirmación para activar
  static async confirmActivate(itemName = 'este elemento') {
    return this.confirm(
      '¿Activar?',
      `¿Estás seguro de que quieres activar ${itemName}?`,
      'question'
    );
  }

  // Confirmación para verificar
  static async confirmVerify(itemName = 'este elemento') {
    return this.confirm(
      '¿Verificar?',
      `¿Estás seguro de que quieres verificar ${itemName}?`,
      'question'
    );
  }
  // Éxito
  static success(title, text = '') {
    Swal.fire({
      title,
      text,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  }

  // Error
  static error(title, text = '') {
    Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonColor: '#d33'
    });
  }

  // Información
  static info(title, text = '') {
    Swal.fire({
      title,
      text,
      icon: 'info'
    });
  }

  // Advertencia
  static warning(title, text = '') {
    Swal.fire({
      title,
      text,
      icon: 'warning'
    });
  }

  // Confirmación para limpiar logs
  static async confirmCleanLogs() {
    return this.confirm(
      '¿Limpiar logs?',
      '¿Estás seguro de que quieres limpiar los logs antiguos? Esta acción no se puede deshacer.',
      'warning'
    );
  }

  // Confirmación para resetear permisos
  static async confirmResetPermissions() {
    return this.confirm(
      '¿Resetear permisos?',
      '¿Estás seguro de que quieres resetear los permisos del usuario?',
      'warning'
    );
  }
}

export default AlertService; 