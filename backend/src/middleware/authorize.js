const Permission = require('../models/Permission');

/**
 * Middleware para autorizar acceso basado en permisos
 * @param {string|string[]} requiredPermissions - Permiso(s) requerido(s)
 * @returns {Function} Middleware de Express
 */
const authorize = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      // Convertir a array si es un string
      const permissions = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];

      // Los admins tienen acceso total
      if (req.user && req.user.role === 'admin') {
        return next();
      }

      // Verificar que el usuario existe
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Verificar que todos los permisos requeridos existen en la base de datos
      const validPermissions = [];
      const invalidPermissions = [];

      for (const permission of permissions) {
        const isValid = await Permission.isValidPermission(permission);
        if (isValid) {
          validPermissions.push(permission);
        } else {
          invalidPermissions.push(permission);
        }
      }

      // Si hay permisos inválidos, retornar error
      if (invalidPermissions.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Permisos inválidos detectados',
          invalidPermissions
        });
      }

      // Verificar si el usuario tiene al menos uno de los permisos requeridos
      const hasPermission = validPermissions.some(permission => 
        req.user.permissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Permisos insuficientes.',
          requiredPermissions: validPermissions,
          userPermissions: req.user.permissions,
          userRole: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de autorización:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor durante la autorización'
      });
    }
  };
};

/**
 * Middleware para autorizar acceso basado en roles
 * @param {string|string[]} requiredRoles - Rol(es) requerido(s)
 * @returns {Function} Middleware de Express
 */
const authorizeRole = (requiredRoles) => {
  return (req, res, next) => {
    try {
      // Convertir a array si es un string
      const roles = Array.isArray(requiredRoles) 
        ? requiredRoles 
        : [requiredRoles];

      // Verificar que el usuario existe
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Verificar si el usuario tiene uno de los roles requeridos
      const hasRole = roles.includes(req.user.role);

      if (!hasRole) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Rol insuficiente.',
          requiredRoles: roles,
          userRole: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de autorización por rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor durante la autorización'
      });
    }
  };
};

/**
 * Middleware para autorizar acceso basado en múltiples permisos (todos requeridos)
 * @param {string[]} requiredPermissions - Permisos requeridos (todos deben estar presentes)
 * @returns {Function} Middleware de Express
 */
const authorizeAll = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      // Los admins tienen acceso total
      if (req.user && req.user.role === 'admin') {
        return next();
      }

      // Verificar que el usuario existe
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Verificar que todos los permisos requeridos existen en la base de datos
      const validPermissions = [];
      const invalidPermissions = [];

      for (const permission of requiredPermissions) {
        const isValid = await Permission.isValidPermission(permission);
        if (isValid) {
          validPermissions.push(permission);
        } else {
          invalidPermissions.push(permission);
        }
      }

      // Si hay permisos inválidos, retornar error
      if (invalidPermissions.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Permisos inválidos detectados',
          invalidPermissions
        });
      }

      // Verificar si el usuario tiene TODOS los permisos requeridos
      const hasAllPermissions = validPermissions.every(permission => 
        req.user.permissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Permisos insuficientes.',
          requiredPermissions: validPermissions,
          userPermissions: req.user.permissions,
          userRole: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de autorización (todos los permisos):', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor durante la autorización'
      });
    }
  };
};

/**
 * Middleware para verificar si el usuario es propietario del recurso
 * @param {Function} getResourceUserId - Función para obtener el ID del usuario propietario del recurso
 * @returns {Function} Middleware de Express
 */
const authorizeOwner = (getResourceUserId) => {
  return (req, res, next) => {
    try {
      // Los admins tienen acceso total
      if (req.user && req.user.role === 'admin') {
        return next();
      }

      // Verificar que el usuario existe
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Obtener el ID del usuario propietario del recurso
      const resourceUserId = getResourceUserId(req);

      // Verificar si el usuario es propietario del recurso
      if (req.user._id.toString() !== resourceUserId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. No eres propietario de este recurso.',
          userRole: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de autorización de propietario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor durante la autorización'
      });
    }
  };
};

module.exports = {
  authorize,
  authorizeRole,
  authorizeAll,
  authorizeOwner
}; 