const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// Validaciones para registro
const registerValidation = [
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
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  body('role')
    .optional()
    .isIn(['cliente', 'veterinario'])
    .withMessage('Rol inválido')
];

// Validaciones para login
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// POST /api/auth/register - Registro de usuarios
router.post('/register', registerValidation, authController.register);

// POST /api/auth/login - Inicio de sesión
router.post('/login', loginValidation, authController.login);

// GET /api/auth/me - Obtener información del usuario actual
router.get('/me', authenticateToken, authController.getMe);

// GET /api/auth/verify - Verificar token y obtener usuario actual
router.get('/verify', authenticateToken, authController.verify);

// POST /api/auth/logout - Cerrar sesión (opcional, ya que JWT es stateless)
router.post('/logout', authenticateToken, authController.logout);

// POST /api/auth/refresh - Renovar token (opcional)
router.post('/refresh', authenticateToken, authController.refresh);

module.exports = router; 