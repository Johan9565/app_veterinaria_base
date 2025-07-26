// backend/src/controllers/userController.js

const { validationResult } = require('express-validator');
const User = require('../models/User');
const { logCRUDActivity } = require('../middleware/logging');

// GET /api/users - Obtener lista de usuarios (solo admin)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, isActive } = req.query;
    
    // Construir filtros
    const filters = {};
    if (role) filters.role = role;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const users = await User.find(filters)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filters);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

// POST /api/users - Crear nuevo usuario (solo admin)
const createUser = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { name, email, phone, password, role } = req.body;

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
      permissions: defaultPermissions,
      isActive: true
    });

    await user.save();

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: user.toPublicJSON()
    });

    // Log de creación de usuario
    await logCRUDActivity('create_user', 'user', req.user, req, {
      id: user._id,
      userId: user._id,
      userRole: user.role,
      userPermissionsCount: user.permissions.length,
      hasCustomPermissions: user.permissions.length !== defaultPermissions.length
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    
    // Log de error en creación de usuario
    await logCRUDActivity('create_user_error', 'user', req.user, req, {
      error: error.message,
      errorCode: error.code,
      requestData: req.body
    }).catch(logError => {
      console.error('Error logging create user error:', logError);
    });
    
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'El email ya está registrado'
      });
    }

    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

// GET /api/users/:id - Obtener usuario específico
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    res.json({ user });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

// PUT /api/users/:id - Actualizar usuario
const updateUser = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { name, email, phone, role, isActive, permissions } = req.body;
    const updateData = { name, phone, isActive };

    // Solo permitir actualizar email si no está duplicado
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({
          message: 'El email ya está en uso por otro usuario'
        });
      }
      updateData.email = email;
    }

    // Solo usuarios con permisos específicos pueden cambiar roles y permisos
    if (role && await req.user.hasPermission('users.edit')) {
      updateData.role = role;
    }
    if (permissions && await req.user.hasPermission('permissions.assign')) {
      updateData.permissions = permissions;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    // Log de actualización de usuario
    await logCRUDActivity('update_user', 'user', req.user, req, {
      id: user._id,
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      updatedFields: Object.keys(updateData),
      isActive: user.isActive
    });

    res.json({
      message: 'Usuario actualizado exitosamente',
      user
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    
    // Log de error en actualización de usuario
    await logCRUDActivity('update_user_error', 'user', req.user, req, {
      id: req.params.id,
      error: error.message,
      requestData: req.body
    },'warning');
    
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

// DELETE /api/users/:id - Eliminar usuario (solo admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    // No permitir eliminar el propio usuario
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        message: 'No puedes eliminar tu propia cuenta'
      });
    }

    // Guardar información del usuario antes de eliminarlo para el log
    const userInfo = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive
    };

    await User.findByIdAndDelete(req.params.id);

    // Log de eliminación de usuario
    await logCRUDActivity('delete_user', 'user', req.user, req, {
      id: userInfo.id,
      userId: userInfo.id,
      userEmail: userInfo.email,
      userName: userInfo.name,
      userRole: userInfo.role,
      wasActive: userInfo.isActive
    },'warning');

    res.json({
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    
    // Log de error en eliminación de usuario
    await logCRUDActivity('delete_user_error', 'user', req.user, req, {
      id: req.params.id,
      error: error.message
    }).catch(logError => {
      console.error('Error logging delete user error:', logError);
    });
    
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

// PUT /api/users/:id/permissions - Actualizar permisos (solo admin)
const updateUserPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        message: 'Los permisos deben ser un array'
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    // Guardar permisos anteriores para el log
    const previousPermissions = [...user.permissions];

    user.permissions = permissions;
    await user.save();

    // Log de actualización de permisos
    await logCRUDActivity('update_user_permissions', 'user', req.user, req, {
      id: user._id,
      userId: user._id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      previousPermissions: previousPermissions,
      newPermissions: permissions,
      permissionsAdded: permissions.filter(p => !previousPermissions.includes(p)),
      permissionsRemoved: previousPermissions.filter(p => !permissions.includes(p))
    });

    res.json({
      message: 'Permisos actualizados exitosamente',
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Error actualizando permisos:', error);
    
    // Log de error en actualización de permisos
    await logCRUDActivity('update_user_permissions_error', 'user', req.user, req, {
      id: req.params.id,
      error: error.message,
      requestData: req.body
    }).catch(logError => {
      console.error('Error logging update user permissions error:', logError);
    });
    
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

// PUT /api/users/:id/activate - Activar/desactivar usuario (solo admin)
const activateUser = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        message: 'isActive debe ser un valor booleano'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    // Log de activación/desactivación de usuario
    await logCRUDActivity('toggle_user_status', 'user', req.user, req, {
      id: user._id,
      userId: user._id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      previousStatus: !isActive, // El estado anterior era el opuesto
      newStatus: isActive,
      action: isActive ? 'activated' : 'deactivated'
    },'warning');

    res.json({
      message: `Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`,
      user
    });

  } catch (error) {
    console.error('Error activando/desactivando usuario:', error);
    
    // Log de error en activación/desactivación de usuario
    await logCRUDActivity('toggle_user_status_error', 'user', req.user, req, {
      id: req.params.id,
      error: error.message,
      requestData: req.body
    }).catch(logError => {
      console.error('Error logging toggle user status error:', logError);
    });
    
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

// GET /api/users/stats - Estadísticas de usuarios (solo admin)
const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: ['$isActive', 1, 0] }
          }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    res.json({
      totalUsers,
      activeUsers,
      byRole: stats,
      inactiveUsers: totalUsers - activeUsers
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  updateUserPermissions,
  activateUser,
  getUserStats
}; 