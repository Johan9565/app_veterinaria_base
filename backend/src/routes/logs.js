const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const {
  getLogs,
  getLogStats,
  getRecentErrors,
  getUserActivity,
  getLogsByCategory,
  getLogsByLevel,
  exportLogs,
  cleanOldLogs,
  getLogById,
  createLog
} = require('../controllers/logController');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener logs con filtros y paginación
router.get('/', 
  authorize(['logs.view']), 
  getLogs
);

// Obtener estadísticas de logs
router.get('/stats', 
  authorize(['logs.view']), 
  getLogStats
);

// Obtener logs de errores recientes
router.get('/errors', 
  authorize(['logs.view']), 
  getRecentErrors
);

// Obtener actividad de un usuario específico
router.get('/user/:userId', 
  authorize(['logs.view']), 
  getUserActivity
);

// Obtener logs por categoría
router.get('/category/:category', 
  authorize(['logs.view']), 
  getLogsByCategory
);

// Obtener logs por nivel
router.get('/level/:level', 
  authorize(['logs.view']), 
  getLogsByLevel
);

// Exportar logs a CSV
router.get('/export', 
  authorize(['logs.export']), 
  exportLogs
);

// Obtener un log específico
router.get('/:logId', 
  authorize(['logs.view']), 
  getLogById
);

// Crear log manualmente (para testing)
router.post('/', 
  authorize(['logs.create']), 
  createLog
);

// Limpiar logs antiguos
router.delete('/clean', 
  authorize(['logs.manage']), 
  cleanOldLogs
);

module.exports = router; 