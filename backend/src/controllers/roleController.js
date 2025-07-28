const Role = require('../models/Role');
const Permission = require('../models/Permission');
const { logCRUDActivity } = require('../middleware/logging');

// GET /api/roles - Obtener todos los roles
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.getActiveRoles();
    
    res.json({
      success: true,
      data: roles,
      message: 'Roles obtenidos exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// GET /api/roles/system - Obtener roles del sistema
const getSystemRoles = async (req, res) => {
  try {
    const roles = await Role.getSystemRoles();
    
    res.json({
      success: true,
      data: roles,
      message: 'Roles del sistema obtenidos exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo roles del sistema:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// GET /api/roles/custom - Obtener roles personalizados
const getCustomRoles = async (req, res) => {
  try {
    const roles = await Role.getCustomRoles();
    
    res.json({
      success: true,
      data: roles,
      message: 'Roles personalizados obtenidos exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo roles personalizados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// GET /api/roles/:id - Obtener rol específico
const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: role,
      message: 'Rol obtenido exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// POST /api/roles - Crear nuevo rol
const createRole = async (req, res) => {
  try {
    const { name, displayName, description, permissions, priority } = req.body;
    
    // Verificar que el nombre no exista
    const existingRole = await Role.getByName(name);
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un rol con ese nombre'
      });
    }
    
    // Verificar que todos los permisos existan
    if (permissions && permissions.length > 0) {
      for (const permission of permissions) {
        const isValid = await Permission.isValidPermission(permission);
        if (!isValid) {
          return res.status(400).json({
            success: false,
            message: `Permiso '${permission}' no existe`
          });
        }
      }
    }
    
    const role = new Role({
      name,
      displayName,
      description,
      permissions: permissions || [],
      priority: priority || 0,
      isSystem: false
    });
    
    await role.save();
    
    // Log de la actividad
    logCRUDActivity('create', 'role', req.user, req, { id: role._id, name: role.displayName });
    
    res.status(201).json({
      success: true,
      data: role,
      message: 'Rol creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// PUT /api/roles/:id - Actualizar rol
const updateRole = async (req, res) => {
  try {
    const { displayName, description, permissions, priority, isActive } = req.body;
    
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }
    
    // No permitir modificar roles del sistema
    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        message: 'No se pueden modificar roles del sistema'
      });
    }
    
    // Verificar que todos los permisos existan
    if (permissions && permissions.length > 0) {
      for (const permission of permissions) {
        const isValid = await Permission.isValidPermission(permission);
        if (!isValid) {
          return res.status(400).json({
            success: false,
            message: `Permiso '${permission}' no existe`
          });
        }
      }
    }
    
    const oldData = { ...role.toObject() };
    
    // Actualizar campos
    if (displayName !== undefined) role.displayName = displayName;
    if (description !== undefined) role.description = description;
    if (permissions !== undefined) role.permissions = permissions;
    if (priority !== undefined) role.priority = priority;
    if (isActive !== undefined) role.isActive = isActive;
    
    await role.save();
    
    // Log de la actividad
    logCRUDActivity('update', 'role', req.user, req, { id: role._id, name: role.displayName, oldData });
    
    res.json({
      success: true,
      data: role,
      message: 'Rol actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// DELETE /api/roles/:id - Eliminar rol
const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }
    
    // No permitir eliminar roles del sistema
    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        message: 'No se pueden eliminar roles del sistema'
      });
    }
    
    // Verificar si hay usuarios usando este rol
    const User = require('../models/User');
    const usersWithRole = await User.countDocuments({ role: role.name });
    
    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar el rol porque ${usersWithRole} usuario(s) lo están usando`
      });
    }
    
    await Role.findByIdAndDelete(req.params.id);
    
    // Log de la actividad
    logCRUDActivity('delete', 'role', req.user, req, { id: role._id, name: role.displayName });
    
    res.json({
      success: true,
      message: 'Rol eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// GET /api/roles/:id/permissions - Obtener permisos de un rol
const getRolePermissions = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }
    
    // Obtener detalles de los permisos
    const permissions = await Permission.find({ 
      name: { $in: role.permissions },
      isActive: true 
    }).sort({ category: 1, action: 1 });
    
    res.json({
      success: true,
      data: {
        role: {
          _id: role._id,
          name: role.name,
          displayName: role.displayName
        },
        permissions
      },
      message: 'Permisos del rol obtenidos exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo permisos del rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// PUT /api/roles/:id/permissions - Actualizar permisos de un rol
const updateRolePermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }
    
    // No permitir modificar roles del sistema
    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        message: 'No se pueden modificar roles del sistema'
      });
    }
    
    // Verificar que todos los permisos existan
    if (permissions && permissions.length > 0) {
      for (const permission of permissions) {
        const isValid = await Permission.isValidPermission(permission);
        if (!isValid) {
          return res.status(400).json({
            success: false,
            message: `Permiso '${permission}' no existe`
          });
        }
      }
    }
    
    const oldPermissions = [...role.permissions];
    role.permissions = permissions || [];
    await role.save();
    
    // Log de la actividad
    logCRUDActivity('update', 'role', req.user, req, { id: role._id, name: role.displayName, oldPermissions });
    
    res.json({
      success: true,
      data: role,
      message: 'Permisos del rol actualizados exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando permisos del rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// GET /api/roles/stats - Obtener estadísticas de roles
const getRoleStats = async (req, res) => {
  try {
    const stats = await Role.getStats();
    
    res.json({
      success: true,
      data: stats,
      message: 'Estadísticas de roles obtenidas exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getAllRoles,
  getSystemRoles,
  getCustomRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  updateRolePermissions,
  getRoleStats
}; 