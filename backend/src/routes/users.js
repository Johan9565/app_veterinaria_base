const express = require('express');
const { body } = require('express-validator');
const { 
  authenticateToken, 
  requirePermission, 
  requireRole,
  requireOwnershipOrPermission 
} = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// Validaciones para actualizar usuario
const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('El teléfono debe tener al menos 10 caracteres'),
  body('role')
    .optional()
    .isIn(['cliente', 'veterinario'])
    .withMessage('Rol inválido'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

// Validaciones para crear usuario
const createUserValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('phone')
    .trim()
    .isLength({ min: 10 })
    .withMessage('El teléfono debe tener al menos 10 caracteres'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role')
    .isIn(['cliente', 'veterinario'])
    .withMessage('Rol inválido')
];

// GET /api/users - Obtener lista de usuarios (solo admin)
router.get('/', authenticateToken, requirePermission('users.view'), userController.getAllUsers);

// POST /api/users - Crear nuevo usuario (solo admin)
router.post('/', authenticateToken, requirePermission('users.create'), createUserValidation, userController.createUser);

// GET /api/users/:id - Obtener usuario específico
router.get('/:id', authenticateToken, requireOwnershipOrPermission('id', 'users.view'), userController.getUserById);

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', authenticateToken, requireOwnershipOrPermission('id', 'users.edit'), updateUserValidation, userController.updateUser);

// DELETE /api/users/:id - Eliminar usuario (solo admin)
router.delete('/:id', authenticateToken, requirePermission('users.delete'), userController.deleteUser);

// PUT /api/users/:id/permissions - Actualizar permisos (solo admin)
router.put('/:id/permissions', authenticateToken, requirePermission('permissions.assign'), userController.updateUserPermissions);

// PUT /api/users/:id/activate - Activar/desactivar usuario (solo admin)
router.put('/:id/activate', authenticateToken, requirePermission('users.edit'), userController.activateUser);

// GET /api/users/stats - Estadísticas de usuarios (solo admin)
router.get('/stats/overview', authenticateToken, requirePermission('users.view'), userController.getUserStats);

module.exports = router; 