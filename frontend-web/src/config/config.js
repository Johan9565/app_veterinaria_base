// Configuración de la aplicación
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configuración de la aplicación
export const APP_CONFIG = {
  name: 'Veterinaria App',
  version: '1.0.0',
  description: 'Sistema de gestión veterinaria',
  apiUrl: API_BASE_URL,
  defaultLanguage: 'es',
  defaultCurrency: 'MXN',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm',
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50]
  }
};

// Configuración de validaciones
export const VALIDATION_CONFIG = {
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Número de teléfono inválido'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email inválido'
  }
};

// Configuración de roles y permisos
export const ROLES = {
  ADMIN: 'admin',
  VETERINARIO: 'veterinario',
  CLIENTE: 'cliente'
};

export const PERMISSIONS = {
  // Usuarios
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  
  // Veterinarias
  VETERINARIES_VIEW: 'veterinaries.view',
  VETERINARIES_CREATE: 'veterinaries.create',
  VETERINARIES_UPDATE: 'veterinaries.update',
  VETERINARIES_DELETE: 'veterinaries.delete',
  VETERINARIES_MINE_VIEW: 'veterinaries.mine.view',
  
  // Mascotas
  PETS_VIEW: 'pets.view',
  PETS_CREATE: 'pets.create',
  PETS_UPDATE: 'pets.update',
  PETS_DELETE: 'pets.delete',
  
  // Citas
  APPOINTMENTS_VIEW: 'appointments.view',
  APPOINTMENTS_CREATE: 'appointments.create',
  APPOINTMENTS_UPDATE: 'appointments.update',
  APPOINTMENTS_DELETE: 'appointments.delete',
  
  // Permisos
  PERMISSIONS_VIEW: 'permissions.view',
  PERMISSIONS_CREATE: 'permissions.create',
  PERMISSIONS_UPDATE: 'permissions.update',
  PERMISSIONS_DELETE: 'permissions.delete',
  
  // Logs
  LOGS_VIEW: 'logs.view',
  LOGS_CREATE: 'logs.create',
  LOGS_UPDATE: 'logs.update',
  LOGS_DELETE: 'logs.delete'
};

// Configuración de tipos de cita
export const APPOINTMENT_TYPES = {
  CONSULTA_GENERAL: 'consulta_general',
  VACUNACION: 'vacunacion',
  CIRUGIA: 'cirugia',
  RADIOGRAFIA: 'radiografia',
  LABORATORIO: 'laboratorio',
  GROOMING: 'grooming',
  EMERGENCIA: 'emergencia',
  SEGUIMIENTO: 'seguimiento',
  ESPECIALIDAD: 'especialidad',
  OTRO: 'otro'
};

// Configuración de estados de cita
export const APPOINTMENT_STATUSES = {
  PROGRAMADA: 'programada',
  CONFIRMADA: 'confirmada',
  EN_PROCESO: 'en_proceso',
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada',
  NO_SHOW: 'no_show'
};

// Configuración de prioridades
export const PRIORITIES = {
  BAJA: 'baja',
  NORMAL: 'normal',
  ALTA: 'alta',
  URGENTE: 'urgente'
};

// Configuración de métodos de pago
export const PAYMENT_METHODS = {
  EFECTIVO: 'efectivo',
  TARJETA: 'tarjeta',
  TRANSFERENCIA: 'transferencia',
  OTRO: 'otro'
};

// Configuración de monedas
export const CURRENCIES = {
  MXN: 'MXN',
  USD: 'USD',
  EUR: 'EUR'
};

// Configuración de especies de mascotas
export const PET_SPECIES = {
  PERRO: 'perro',
  GATO: 'gato',
  AVE: 'ave',
  REPTIL: 'reptil',
  ROEDOR: 'roedor',
  CONEJO: 'conejo',
  CABALLO: 'caballo',
  OTRO: 'otro'
};

// Configuración de géneros
export const GENDERS = {
  MACHO: 'macho',
  HEMBRA: 'hembra'
};

// Configuración de estados de salud
export const HEALTH_STATUSES = {
  EXCELENTE: 'excelente',
  BUENO: 'bueno',
  REGULAR: 'regular',
  MALO: 'malo',
  CRITICO: 'crítico'
};

// Configuración de colores del tema
export const THEME_COLORS = {
  primary: '#4CAF50',
  secondary: '#2196F3',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  light: '#F5F5F5',
  dark: '#333333'
};

// Configuración de breakpoints
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

// Configuración de animaciones
export const ANIMATIONS = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500
  },
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true
};

// Configuración de archivos
export const FILE_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  uploadUrl: `${API_BASE_URL}/uploads`
};

// Configuración de caché
export const CACHE_CONFIG = {
  ttl: 5 * 60 * 1000, // 5 minutos
  maxSize: 100
};

// Configuración de errores
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  FORBIDDEN: 'Acceso denegado.',
  NOT_FOUND: 'Recurso no encontrado.',
  VALIDATION_ERROR: 'Los datos ingresados no son válidos.',
  SERVER_ERROR: 'Error interno del servidor.',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado.'
};

// Configuración de éxito
export const SUCCESS_MESSAGES = {
  CREATED: 'Registro creado exitosamente.',
  UPDATED: 'Registro actualizado exitosamente.',
  DELETED: 'Registro eliminado exitosamente.',
  SAVED: 'Cambios guardados exitosamente.',
  UPLOADED: 'Archivo subido exitosamente.',
  SENT: 'Mensaje enviado exitosamente.'
};

export default {
  API_BASE_URL,
  APP_CONFIG,
  VALIDATION_CONFIG,
  ROLES,
  PERMISSIONS,
  APPOINTMENT_TYPES,
  APPOINTMENT_STATUSES,
  PRIORITIES,
  PAYMENT_METHODS,
  CURRENCIES,
  PET_SPECIES,
  GENDERS,
  HEALTH_STATUSES,
  THEME_COLORS,
  BREAKPOINTS,
  ANIMATIONS,
  NOTIFICATION_CONFIG,
  FILE_CONFIG,
  CACHE_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
