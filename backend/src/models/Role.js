const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del rol es requerido'],
    unique: true,
    trim: true,
    lowercase: true
  },
  displayName: {
    type: String,
    required: [true, 'El nombre de visualización del rol es requerido'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La descripción del rol es requerida'],
    trim: true
  },
  permissions: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Índices para mejorar performance
roleSchema.index({ name: 1 });
roleSchema.index({ isActive: 1 });
roleSchema.index({ priority: -1 });

// Método estático para obtener todos los roles activos
roleSchema.statics.getActiveRoles = function() {
  return this.find({ isActive: true }).sort({ priority: -1, name: 1 });
};

// Método estático para obtener un rol por nombre
roleSchema.statics.getByName = function(name) {
  return this.findOne({ name: name.toLowerCase(), isActive: true });
};

// Método estático para obtener roles del sistema
roleSchema.statics.getSystemRoles = function() {
  return this.find({ isSystem: true, isActive: true }).sort({ priority: -1 });
};

// Método estático para obtener roles personalizados
roleSchema.statics.getCustomRoles = function() {
  return this.find({ isSystem: false, isActive: true }).sort({ priority: -1, name: 1 });
};

// Método estático para obtener roles públicos (excluyendo admin)
roleSchema.statics.getPublicRoles = function() {
  return this.find({ 
    isActive: true, 
    name: { $ne: 'admin' } 
  }).sort({ priority: -1, name: 1 });
};

// Método estático para validar si un rol existe
roleSchema.statics.isValidRole = async function(roleName) {
  const role = await this.findOne({ name: roleName.toLowerCase(), isActive: true });
  return !!role;
};

// Método estático para obtener permisos de un rol
roleSchema.statics.getRolePermissions = async function(roleName) {
  const role = await this.findOne({ name: roleName.toLowerCase(), isActive: true });
  return role ? role.permissions : [];
};

// Método estático para obtener estadísticas
roleSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$isSystem',
        count: { $sum: 1 },
        roles: { $push: { name: '$name', displayName: '$displayName' } }
      }
    }
  ]);
  
  const total = await this.countDocuments({ isActive: true });
  
  return {
    total,
    systemRoles: stats.find(s => s._id === true)?.count || 0,
    customRoles: stats.find(s => s._id === false)?.count || 0
  };
};

module.exports = mongoose.model('Role', roleSchema); 