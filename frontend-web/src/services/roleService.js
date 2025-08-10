import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

// Servicios de roles
export const roleService = {
  // Obtener todos los roles activos
  getAllRoles: async () => {
    console.log('🔗 Llamando a /api/roles...');
    const response = await api.get('/roles');
    console.log('📡 Respuesta completa del API:', response);
    return response.data;
  },

  // Obtener roles públicos (sin permisos especiales)
  getPublicRoles: async () => {
    console.log('🔗 Llamando a /api/roles/public...');
    const response = await api.get('/roles/public');
    console.log('📡 Respuesta completa del API público:', response);
    return response.data;
  },

  // Obtener roles del sistema
  getSystemRoles: async () => {
    const response = await api.get('/roles/system');
    return response.data;
  },

  // Obtener roles personalizados
  getCustomRoles: async () => {
    const response = await api.get('/roles/custom');
    return response.data;
  },

  // Obtener rol específico por ID
  getRoleById: async (roleId) => {
    const response = await api.get(`/roles/${roleId}`);
    return response.data;
  },

  // Crear nuevo rol
  createRole: async (roleData) => {
    const response = await api.post('/roles', roleData);
    return response.data;
  },

  // Actualizar rol
  updateRole: async (roleId, roleData) => {
    const response = await api.put(`/roles/${roleId}`, roleData);
    return response.data;
  },

  // Eliminar rol
  deleteRole: async (roleId) => {
    const response = await api.delete(`/roles/${roleId}`);
    return response.data;
  },

  // Obtener permisos de un rol
  getRolePermissions: async (roleId) => {
    const response = await api.get(`/roles/${roleId}/permissions`);
    return response.data;
  },

  // Actualizar permisos de un rol
  updateRolePermissions: async (roleId, permissions) => {
    const response = await api.put(`/roles/${roleId}/permissions`, { permissions });
    return response.data;
  },

  // Obtener estadísticas de roles
  getRoleStats: async () => {
    const response = await api.get('/roles/stats');
    return response.data;
  }
};

export default roleService; 