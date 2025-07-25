import api from './permissionService';

// Servicios de logs del sistema
export const logService = {
  // Obtener logs con filtros y paginación
  getLogs: async (params = {}) => {
    const response = await api.get('/logs', { params });
    return response.data;
  },

  // Obtener estadísticas de logs
  getLogStats: async (params = {}) => {
    const response = await api.get('/logs/stats', { params });
    return response.data;
  },

  // Obtener logs de errores recientes
  getRecentErrors: async (params = {}) => {
    const response = await api.get('/logs/errors', { params });
    return response.data;
  },

  // Obtener actividad de un usuario específico
  getUserActivity: async (userId, params = {}) => {
    const response = await api.get(`/logs/user/${userId}`, { params });
    return response.data;
  },

  // Obtener logs por categoría
  getLogsByCategory: async (category, params = {}) => {
    const response = await api.get(`/logs/category/${category}`, { params });
    return response.data;
  },

  // Obtener logs por nivel
  getLogsByLevel: async (level, params = {}) => {
    const response = await api.get(`/logs/level/${level}`, { params });
    return response.data;
  },

  // Obtener un log específico
  getLogById: async (logId) => {
    const response = await api.get(`/logs/${logId}`);
    return response.data;
  },

  // Crear log manualmente
  createLog: async (logData) => {
    const response = await api.post('/logs', logData);
    return response.data;
  },

  // Limpiar logs antiguos
  cleanOldLogs: async (daysToKeep = 90) => {
    const response = await api.delete('/logs/clean', { data: { daysToKeep } });
    return response.data;
  },

  // Exportar logs a CSV
  exportLogs: async (params = {}) => {
    const response = await api.get('/logs/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }
}; 