const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del permiso es requerido'],
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'La descripción del permiso es requerida'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'La categoría del permiso es requerida'],
    enum: ['users', 'pets', 'appointments', 'permissions', 'reports', 'settings', 'veterinaries'],
    trim: true
  },
  action: {
    type: String,
    required: [true, 'La acción del permiso es requerida'],
    enum: ['view', 'create', 'edit', 'delete', 'assign', 'update', 'manage_staff', 'stats', 'verify'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para mejorar performance
permissionSchema.index({ name: 1 });
permissionSchema.index({ category: 1 });
permissionSchema.index({ isActive: 1 });
permissionSchema.index({ category: 1, action: 1 });

// Método para obtener el nombre completo del permiso
permissionSchema.methods.getFullName = function() {
  return `${this.category}.${this.action}`;
};

// Método estático para obtener todos los permisos activos
permissionSchema.statics.getActivePermissions = function() {
  if (this.role === 'admin') {
    return this.find().sort({ category: 1, action: 1 });
  } else {
    return this.find({ isActive: true, role: this.role }).sort({ category: 1, action: 1 });
  }
};

// Método estático para obtener permisos por categoría
permissionSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ action: 1 });
};

// Método estático para obtener permisos por acción
permissionSchema.statics.getByAction = function(action) {
  return this.find({ action, isActive: true }).sort({ category: 1 });
};

// Método estático para obtener todos los nombres de permisos activos
permissionSchema.statics.getAllPermissionNames = async function() {
  if (this.role === 'admin') {
    const permissions = await this.find().select('name');
  } else {
    const permissions = await this.find({ isActive: true, role: this.role }).select('name');
  }
  return permissions.map(p => p.name);
};

// Método estático para validar si un permiso existe
permissionSchema.statics.isValidPermission = async function(permissionName) {
  const permission = await this.findOne({ name: permissionName, isActive: true});
  return !!permission;
};

// Método estático para validar si un permiso existe (incluyendo inactivos para admins)
permissionSchema.statics.isValidPermissionForUser = async function(permissionName, userRole) {
  if (userRole === 'admin') {
    // Los admins pueden tener cualquier permiso, incluso los inactivos
    const permission = await this.findOne({ name: permissionName });
    return !!permission;
  } else {
    // Los usuarios normales solo pueden tener permisos activos
    const permission = await this.findOne({ name: permissionName, isActive: true });
    return !!permission;
  }
};

// Método estático para obtener estadísticas
permissionSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        permissions: { $push: '$name' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  const total = await this.countDocuments({ isActive: true });
  
  return {
    total,
    byCategory: stats
  };
};

module.exports = mongoose.model('Permission', permissionSchema); 