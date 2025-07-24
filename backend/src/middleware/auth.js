const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Permission = require('../models/Permission');

// Middleware para verificar token JWT
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('🔐 Auth Debug:', {
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      path: req.path,
      method: req.method
    });

    if (!token) {
      return res.status(401).json({ 
        message: 'Token de acceso requerido' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Usuario desactivado' 
      });
    }

    console.log('✅ Usuario autenticado:', {
      userId: user._id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    });

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Error de autenticación:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token inválido' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado' 
      });
    }
    return res.status(500).json({ 
      message: 'Error de autenticación' 
    });
  }
};

// Middleware para verificar permisos específicos (legacy - usar authorize en su lugar)
const requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Autenticación requerida' 
      });
    }

    // Los admins tienen todos los permisos
    if (req.user.role === 'admin') {
      return next();
    }

    // Verificar que el permiso existe en la base de datos
    const isValid = await Permission.isValidPermission(permission);
    if (!isValid) {
      return res.status(400).json({ 
        message: 'Permiso inválido' 
      });
    }

    if (req.user.permissions.includes(permission)) {
      next();
    } else {
      return res.status(403).json({ 
        message: 'Permiso insuficiente' 
      });
    }
  };
};

// Middleware para verificar múltiples permisos (cualquiera)
const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Autenticación requerida' 
      });
    }

    if (req.user.hasAnyPermission(permissions)) {
      next();
    } else {
      return res.status(403).json({ 
        message: 'Permiso insuficiente' 
      });
    }
  };
};

// Middleware para verificar todos los permisos
const requireAllPermissions = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Autenticación requerida' 
      });
    }

    if (req.user.hasAllPermissions(permissions)) {
      next();
    } else {
      return res.status(403).json({ 
        message: 'Permiso insuficiente' 
      });
    }
  };
};

// Middleware para verificar rol específico
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Autenticación requerida' 
      });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (userRoles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({ 
        message: 'Rol insuficiente' 
      });
    }
  };
};

// Middleware para verificar si es el propio usuario o admin
const requireOwnershipOrAdmin = (paramName = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Autenticación requerida' 
      });
    }

    const targetUserId = req.params[paramName] || req.body[paramName];
    
    if (req.user.role === 'admin' || req.user._id.toString() === targetUserId) {
      next();
    } else {
      return res.status(403).json({ 
        message: 'Acceso denegado' 
      });
    }
  };
};

module.exports = {
  authenticate,
  authenticateToken: authenticate, // Alias para compatibilidad
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole,
  requireOwnershipOrAdmin
}; 