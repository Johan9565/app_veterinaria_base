const Permission = require('../models/Permission');
const User = require('../models/User');

// Obtener todos los permisos activos
const getAllPermissions = async (req, res) => {
  try {
    console.log('🔍 getAllPermissions - Iniciando...');
    const permissions = await Permission.getActivePermissions();
    console.log('🔍 getAllPermissions - Permisos obtenidos:', permissions.length);
    
    const response = {
      permissions,
      total: permissions.length
    };
    
    console.log('🔍 getAllPermissions - Respuesta:', JSON.stringify(response, null, 2));
    
    res.json(response);
  } catch (error) {
    console.error('❌ getAllPermissions - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo permisos',
      error: error.message
    });
  }
};

// Obtener permisos por categoría
const getPermissionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const permissions = await Permission.getByCategory(category);
    
    if (permissions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoría de permisos no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: {
        category,
        permissions,
        total: permissions.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo permisos por categoría',
      error: error.message
    });
  }
};

// Obtener permisos por acción
const getPermissionsByAction = async (req, res) => {
  try {
    const { action } = req.params;
    const permissions = await Permission.getByAction(action);
    
    if (permissions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Acción de permisos no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: {
        action,
        permissions,
        total: permissions.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo permisos por acción',
      error: error.message
    });
  }
};

// Validar si un permiso existe
const validatePermission = async (req, res) => {
  try {
    const { permission } = req.params;
    const isValid = await Permission.isValidPermission(permission);
    
    res.json({
      success: true,
      data: {
        permission,
        isValid
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error validando permiso',
      error: error.message
    });
  }
};

// Obtener estadísticas de permisos
const getPermissionStats = async (req, res) => {
  try {
    const stats = await Permission.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas de permisos',
      error: error.message
    });
  }
};

// Obtener permisos de un usuario específico
const getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('permissions role');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Obtener información detallada de los permisos del usuario
    const userPermissions = await Permission.find({
      name: { $in: user.permissions },
      isActive: true
    }).sort({ category: 1, action: 1 });
    
    // Obtener permisos por defecto del rol
    const defaultPermissions = await User.getDefaultPermissions(user.role);
    
    res.json({
      user: {
        id: user._id,
        role: user.role,
        permissions: user.permissions
      },
      permissions: user.permissions,
      defaultPermissions,
      hasCustomPermissions: user.permissions.length !== defaultPermissions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo permisos del usuario',
      error: error.message
    });
  }
};

// Asignar permisos a un usuario
const assignPermissionsToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;
    
    // Validar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Validar que todos los permisos existen en la base de datos
    const invalidPermissions = [];
    for (const permission of permissions) {
      const isValid = await Permission.isValidPermission(permission);
      if (!isValid) {
        invalidPermissions.push(permission);
      }
    }
    
    if (invalidPermissions.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Permisos inválidos encontrados',
        invalidPermissions
      });
    }
    
    // Actualizar permisos del usuario
    user.permissions = permissions;
    await user.save();
    
    res.json({
      message: 'Permisos asignados exitosamente',
      user: user.toPublicJSON(),
      permissions: user.permissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error asignando permisos',
      error: error.message
    });
  }
};

// Resetear permisos de un usuario a los del rol por defecto
const resetUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Obtener permisos por defecto del rol
    const defaultPermissions = await User.getDefaultPermissions(user.role);
    
    // Actualizar permisos del usuario
    user.permissions = defaultPermissions;
    await user.save();
    
    res.json({
      success: true,
      message: 'Permisos reseteados exitosamente',
      data: {
        user: user.toPublicJSON(),
        permissions: user.permissions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reseteando permisos',
      error: error.message
    });
  }
};

// Obtener todos los nombres de permisos (para validación)
const getAllPermissionNames = async (req, res) => {
  try {
    const permissionNames = await Permission.getAllPermissionNames();
    
    res.json({
      success: true,
      data: {
        permissions: permissionNames,
        total: permissionNames.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo nombres de permisos',
      error: error.message
    });
  }
};

module.exports = {
  getAllPermissions,
  getPermissionsByCategory,
  getPermissionsByAction,
  validatePermission,
  getPermissionStats,
  getUserPermissions,
  assignPermissionsToUser,
  resetUserPermissions,
  getAllPermissionNames
}; 