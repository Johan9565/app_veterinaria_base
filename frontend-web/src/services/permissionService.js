import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configurar axios para incluir el token en todas las peticiones
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autorización
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('veterinaria_token');
  console.log('🔑 Request Interceptor:', {
    url: config.url,
    method: config.method,
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
  });
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('veterinaria_token');
      localStorage.removeItem('veterinaria_user');
      window.location.href = '/login';
    } else if (error.response?.status === 429) {
      // Rate limiting - mostrar mensaje específico
      console.warn('Rate limit alcanzado, esperando antes de reintentar...');
    }
    return Promise.reject(error);
  }
);

// Servicios de permisos
export const permissionService = {
  // Obtener todos los permisos
  getAllPermissions: async () => {
    const response = await api.get('/permissions');
    return response.data; // El backend devuelve { permissions } directamente
  },

  // Obtener permisos por categoría
  getPermissionsByCategory: async (category) => {
    const response = await api.get(`/permissions/category/${category}`);
    return response.data;
  },

  // Obtener permisos por acción
  getPermissionsByAction: async (action) => {
    const response = await api.get(`/permissions/action/${action}`);
    return response.data;
  },

  // Validar si un permiso existe
  validatePermission: async (permission) => {
    const response = await api.get(`/permissions/validate/${permission}`);
    return response.data;
  },

  // Obtener estadísticas de permisos
  getPermissionStats: async () => {
    const response = await api.get('/permissions/stats');
    return response.data;
  },

  // Obtener permisos de un usuario específico
  getUserPermissions: async (userId) => {
    const response = await api.get(`/permissions/user/${userId}`);
    return response.data; // El backend devuelve { permissions } directamente
  },

  // Asignar permisos a un usuario
  assignPermissionsToUser: async (userId, permissions) => {
    const response = await api.put(`/permissions/user/${userId}`, { permissions });
    return response.data;
  },

  // Resetear permisos de un usuario
  resetUserPermissions: async (userId) => {
    const response = await api.post(`/permissions/user/${userId}/reset`);
    return response.data;
  },

  // Obtener todos los nombres de permisos
  getAllPermissionNames: async () => {
    const response = await api.get('/permissions/names');
    return response.data;
  }
};

// Servicios de usuarios
export const userService = {
  // Obtener lista de usuarios
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data; // El backend devuelve { users, pagination } directamente
  },

  // Obtener usuario específico
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Actualizar usuario
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Eliminar usuario
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  // Activar/desactivar usuario
  toggleUserStatus: async (userId, isActive) => {
    const response = await api.put(`/users/${userId}/activate`, { isActive });
    return response.data;
  },

  // Obtener estadísticas de usuarios
  getUserStats: async () => {
    const response = await api.get('/users/stats/overview');
    return response.data; // El backend devuelve { totalUsers, activeUsers, byRole, inactiveUsers }
  },

  // Crear nuevo usuario
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  }
};

// Servicios de autenticación
export const authService = {
  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Registro
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Verificar token
  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  }
};

export default api; 