const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generar token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

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
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { name, email, phone, password, role = 'cliente' } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'El email ya está registrado'
      });
    }

    // Obtener permisos por defecto del rol
    const defaultPermissions = await User.getDefaultPermissions(role);

    // Crear nuevo usuario
    const user = new User({
      name,
      email,
      phone,
      password,
      role,
      permissions: defaultPermissions
    });

    await user.save();

    // Generar token
    const token = generateToken(user._id);

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Error en registro:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'El email ya está registrado'
      });
    }

    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/auth/login - Inicio de sesión
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(401).json({
        message: 'Usuario desactivado'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken(user._id);

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/auth/me - Obtener información del usuario actual
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user.toPublicJSON()
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/auth/logout - Cerrar sesión (opcional, ya que JWT es stateless)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // En una implementación más avanzada, podrías agregar el token a una blacklist
    res.json({
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/auth/refresh - Renovar token (opcional)
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    
    res.json({
      message: 'Token renovado exitosamente',
      token,
      user: req.user.toPublicJSON()
    });
  } catch (error) {
    console.error('Error renovando token:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router; 