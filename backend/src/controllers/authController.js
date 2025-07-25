// backend/src/controllers/authController.js

const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logAuthActivity } = require('../middleware/logging');

// Generar token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register - Registro de usuarios
const register = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Log de error de validación en registro
      await logAuthActivity('register_validation_error', null, req, false, {
        errors: errors.array(),
        email: req.body.email
      });

      return res.status(400).json({
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { name, email, phone, password, role = 'cliente' } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Log de intento de registro con email existente
      await logAuthActivity('register_failed', null, req, false, {
        reason: 'email_already_exists',
        email: email
      });

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

    // Log de registro exitoso
    await logAuthActivity('register_success', user, req, true, {
      email: email,
      role: role,
      name: name
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Error en registro:', error);
    
    if (error.code === 11000) {
      // Log de error de duplicado
      await logAuthActivity('register_failed', null, req, false, {
        reason: 'duplicate_email',
        email: req.body.email
      });

      return res.status(400).json({
        message: 'El email ya está registrado'
      });
    }

    // Log de error interno en registro
    await logAuthActivity('register_error', null, req, false, {
      error: error.message,
      email: req.body.email
    });

    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

// POST /api/auth/login - Inicio de sesión
const login = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Log de error de validación
      await logAuthActivity('login_validation_error', null, req, false, {
        errors: errors.array(),
        email: req.body.email
      });

      return res.status(400).json({
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      // Log de intento de login con email inexistente
      await logAuthActivity('login_failed', null, req, false, {
        reason: 'user_not_found',
        email: email
      });

      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      // Log de intento de login con usuario desactivado
      await logAuthActivity('login_failed', user, req, false, {
        reason: 'user_inactive',
        email: email
      });

      return res.status(401).json({
        message: 'Usuario desactivado'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Log de intento de login con contraseña incorrecta
      await logAuthActivity('login_failed', user, req, false, {
        reason: 'invalid_password',
        email: email
      });

      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken(user._id);

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Log de login exitoso
    await logAuthActivity('login_success', user, req, true, {
      email: email,
      role: user.role
    });

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Error en login:', error);
    
    // Log de error interno
    await logAuthActivity('login_error', null, req, false, {
      error: error.message,
      email: req.body.email
    });

    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

// GET /api/auth/me - Obtener información del usuario actual
const getMe = async (req, res) => {
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
};

// GET /api/auth/verify - Verificar token y obtener usuario actual
const verify = async (req, res) => {
  try {
    // Log de verificación exitosa de token
   
    res.json({
      user: req.user.toPublicJSON()
    });
  } catch (error) {
    console.error('Error verificando token:', error);
    
    // Log de error en verificación de token
    await logAuthActivity('token_verify_error', req.user, req, false, {
      error: error.message
    });

    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

// POST /api/auth/logout - Cerrar sesión (opcional, ya que JWT es stateless)
const logout = async (req, res) => {
  try {
    // Log de logout exitoso
    await logAuthActivity('logout_success', req.user, req, true, {
      email: req.user.email,
      role: req.user.role
    });

    // En una implementación más avanzada, podrías agregar el token a una blacklist
    res.json({
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    
    // Log de error en logout
    await logAuthActivity('logout_error', req.user, req, false, {
      error: error.message
    });

    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

// POST /api/auth/refresh - Renovar token (opcional)
const refresh = async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    
    // Log de renovación exitosa de token
    await logAuthActivity('token_refresh_success', req.user, req, true, {
      email: req.user.email,
      role: req.user.role
    });
    
    res.json({
      message: 'Token renovado exitosamente',
      token,
      user: req.user.toPublicJSON()
    });
  } catch (error) {
    console.error('Error renovando token:', error);
    
    // Log de error en renovación de token
    await logAuthActivity('token_refresh_error', req.user, req, false, {
      error: error.message
    });

    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  verify,
  logout,
  refresh
}; 