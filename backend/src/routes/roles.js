const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const roleController = require('../controllers/roleController');

const router = express.Router();

// Validaciones para crear/actualizar rol
const roleValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-z0-9_]+$/)
    .withMessage('El nombre solo puede contener letras minúsculas, números y guiones bajos'),
  body('displayName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre de visualización debe tener entre 2 y 100 caracteres'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('La descripción debe tener entre 10 y 500 caracteres'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Los permisos deben ser un array'),
  body('permissions.*')
    .optional()
    .isString()
    .withMessage('Cada permiso debe ser una cadena de texto'),
  body('priority')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('La prioridad debe ser un número entre 0 y 100'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/roles - Obtener todos los roles
router.get('/', 
  authorize(['roles.view']), 
  roleController.getAllRoles
);

// GET /api/roles/public - Obtener roles públicos (sin permisos especiales)
router.get('/public', 
  roleController.getPublicRoles
);

// GET /api/roles/system - Obtener roles del sistema
router.get('/system', 
  authorize(['roles.view']), 
  roleController.getSystemRoles
);

// GET /api/roles/custom - Obtener roles personalizados
router.get('/custom', 
  authorize(['roles.view']), 
  roleController.getCustomRoles
);

// GET /api/roles/stats - Obtener estadísticas de roles
router.get('/stats', 
  authorize(['roles.view']), 
  roleController.getRoleStats
);

// GET /api/roles/:id - Obtener rol específico
router.get('/:id', 
  authorize(['roles.view']), 
  roleController.getRoleById
);

// POST /api/roles - Crear nuevo rol
router.post('/', 
  authorize(['roles.create']), 
  roleValidation,
  roleController.createRole
);

// PUT /api/roles/:id - Actualizar rol
router.put('/:id', 
  authorize(['roles.edit']), 
  roleValidation,
  roleController.updateRole
);

// DELETE /api/roles/:id - Eliminar rol
router.delete('/:id', 
  authorize(['roles.delete']), 
  roleController.deleteRole
);

// GET /api/roles/:id/permissions - Obtener permisos de un rol
router.get('/:id/permissions', 
  authorize(['roles.view', 'permissions.view']), 
  roleController.getRolePermissions
);

// PUT /api/roles/:id/permissions - Actualizar permisos de un rol
router.put('/:id/permissions', 
  authorize(['roles.edit', 'permissions.assign']), 
  [
    body('permissions')
      .isArray()
      .withMessage('Los permisos deben ser un array'),
    body('permissions.*')
      .isString()
      .withMessage('Cada permiso debe ser una cadena de texto')
  ],
  roleController.updateRolePermissions
);

module.exports = router; 