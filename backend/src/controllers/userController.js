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

    if(req.user.role === 'admin'){
      const users = await User.find(filters)
      .select('-password')
      .populate('owner_id', 'name email role')
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
  }else{
    const users = await User.find({owner_id: req.user._id})
    .select('-password')
    .populate('owner_id', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip);
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
  }

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

    const { name, email, phone, password, role, owner_id } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'El email ya está registrado'
      });
    }

    // Verificar que el owner_id sea válido si se proporciona
    if (owner_id) {
      const ownerExists = await User.findById(owner_id);
      if (!ownerExists) {
        return res.status(400).json({
          message: 'El usuario propietario especificado no existe'
        });
      }
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
      isActive: true,
      owner_id: owner_id || req.user._id // Usar el owner_id del frontend o el usuario actual
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
      hasCustomPermissions: user.permissions.length !== defaultPermissions.length,
      owner_id: user.owner_id,
      createdBy: req.user._id
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
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('owner_id', 'name email role');
    
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
    let stats;
    let totalUsers;
    let activeUsers;

    if (req.user.role === 'admin') {
      // Si es admin, traer estadísticas de todos los usuarios
      stats = await User.aggregate([
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

      totalUsers = await User.countDocuments();
      activeUsers = await User.countDocuments({ isActive: true });

      res.json({
        totalUsers,
        activeUsers,
        byRole: stats,
        inactiveUsers: totalUsers - activeUsers
      });
    } else {
      // Si no es admin, solo traer estadísticas de usuarios donde owner_id sea igual al user.id
      stats = await User.aggregate([
        {
          $match: {
            owner_id: req.user._id
          }
        },
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

      totalUsers = await User.countDocuments({ owner_id: req.user._id });
      activeUsers = await User.countDocuments({ 
        owner_id: req.user._id, 
        isActive: true 
      });

      res.json({
        totalUsers,
        activeUsers,
        byRole: stats,
        inactiveUsers: totalUsers - activeUsers
      });
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

// GET /api/users/clients - Obtener solo clientes y propietarios
const getClients = async (req, res) => {
  try {
    const { search } = req.query;
    
    // Construir filtros para obtener solo clientes y propietarios
    const filters = {
      role: { $in: ['cliente'] },
      isActive: true
    };

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filters)
      .select('name email role')
      .sort({ name: 1 });

    res.json({
      users,
      total: users.length
    });
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

// GET /api/users/role/:role - Obtener usuarios por rol
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { search } = req.query;
    
    // Validar que el rol sea válido
    const validRoles = ['cliente', 'veterinario', 'asistente', 'recepcionista', 'owner', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: 'Rol inválido'
      });
    }

    // Construir filtros
    const filters = {
      role: role,
      isActive: true
    };

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Si no es admin, solo mostrar usuarios del propietario
    if (req.user.role !== 'admin') {
      if(req.user.role === 'owner'){
        filters.owner_id = req.user._id;
      }else{
        filters._id = req.user._id;
      }
    }

    const users = await User.find(filters)
      .select('name email role')
      .sort({ name: 1 });

    res.json({
      users,
      total: users.length
    });
  } catch (error) {
    console.error('Error obteniendo usuarios por rol:', error);
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
  getUserStats,
  getClients,
  getUsersByRole
}; 