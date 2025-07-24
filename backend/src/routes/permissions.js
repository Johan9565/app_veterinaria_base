const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const {
  getAllPermissions,
  getPermissionsByCategory,
  getPermissionsByAction,
  validatePermission,
  getPermissionStats,
  getUserPermissions,
  assignPermissionsToUser,
  resetUserPermissions,
  getAllPermissionNames
} = require('../controllers/permissionController');

// Obtener todos los permisos activos
router.get('/', 
  authenticate, 
  authorize(['permissions.view']), 
  getAllPermissions
);

// Obtener todos los nombres de permisos (para validación)
router.get('/names', 
  authenticate, 
  authorize(['permissions.view']), 
  getAllPermissionNames
);

// Obtener permisos por categoría
router.get('/category/:category', 
  authenticate, 
  authorize(['permissions.view']), 
  getPermissionsByCategory
);

// Obtener permisos por acción
router.get('/action/:action', 
  authenticate, 
  authorize(['permissions.view']), 
  getPermissionsByAction
);

// Validar si un permiso existe
router.get('/validate/:permission', 
  authenticate, 
  authorize(['permissions.view']), 
  validatePermission
);

// Obtener estadísticas de permisos
router.get('/stats', 
  authenticate, 
  authorize(['permissions.view']), 
  getPermissionStats
);

// Obtener permisos de un usuario específico
router.get('/user/:userId', 
  authenticate, 
  authorize(['permissions.view']), 
  getUserPermissions
);

// Asignar permisos a un usuario
router.put('/user/:userId', 
  authenticate, 
  authorize(['permissions.assign']), 
  assignPermissionsToUser
);

// Resetear permisos de un usuario
router.post('/user/:userId/reset', 
  authenticate, 
  authorize(['permissions.assign']), 
  resetUserPermissions
);

module.exports = router; 