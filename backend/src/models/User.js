const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Permission = require('./Permission');
const Role = require('./Role');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  phone: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  role: {
    type: String,
    required: [true, 'El rol es requerido'],
    trim: true,
    lowercase: true
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
  lastLogin: {
    type: Date
  },
  avatar: {
    type: String,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índices para mejorar performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Middleware para hashear contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para verificar permisos
userSchema.methods.hasPermission = async function(permission) {
  // Verificar si el permiso existe en la base de datos
  const permissionExists = await Permission.isValidPermission(permission);
  if (!permissionExists) return false;
  
  // Verificar si el usuario tiene el permiso específico
  return this.permissions.includes(permission);
};

// Método para verificar múltiples permisos
userSchema.methods.hasAnyPermission = async function(permissions) {
  // Verificar que todos los permisos existen en la base de datos
  for (const permission of permissions) {
    const isValid = await Permission.isValidPermission(permission);
    if (!isValid) return false;
  }
  
  return permissions.some(permission => this.permissions.includes(permission));
};

// Método para verificar todos los permisos
userSchema.methods.hasAllPermissions = async function(permissions) {
  // Verificar que todos los permisos existen en la base de datos
  for (const permission of permissions) {
    const isValid = await Permission.isValidPermission(permission);
    if (!isValid) return false;
  }
  
  return permissions.every(permission => this.permissions.includes(permission));
};

// Método para obtener datos públicos del usuario
userSchema.methods.toPublicJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

// Método estático para obtener permisos por rol
userSchema.statics.getDefaultPermissions = async function(role) {
  // Obtener el rol de la base de datos
  const roleDoc = await Role.getByName(role);
  if (!roleDoc) {
    throw new Error(`Rol '${role}' no encontrado`);
  }
  
  return roleDoc.permissions;
};

module.exports = mongoose.model('User', userSchema); 