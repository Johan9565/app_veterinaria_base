const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { 
  authenticateToken, 
  requirePermission, 
  requireRole,
  requireOwnershipOrAdmin 
} = require('../middleware/auth');

const router = express.Router();

// Validaciones para actualizar usuario
const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('El teléfono debe tener al menos 10 caracteres'),
  body('role')
    .optional()
    .isIn(['cliente', 'veterinario'])
    .withMessage('Rol inválido'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

// Validaciones para crear usuario
const createUserValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('phone')
    .trim()
    .isLength({ min: 10 })
    .withMessage('El teléfono debe tener al menos 10 caracteres'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role')
    .isIn(['cliente', 'veterinario'])
    .withMessage('Rol inválido')
];

// GET /api/users - Obtener lista de usuarios (solo admin)
router.get('/', authenticateToken, requirePermission('users.view'), async (req, res) => {
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
});

// POST /api/users - Crear nuevo usuario (solo admin)
router.post('/', authenticateToken, requirePermission('users.create'), createUserValidation, async (req, res) => {
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

  } catch (error) {
    console.error('Error creando usuario:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'El email ya está registrado'
      });
    }

    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/users/:id - Obtener usuario específico
router.get('/:id', authenticateToken, requireOwnershipOrAdmin('id'), async (req, res) => {
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
});

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', authenticateToken, requireOwnershipOrAdmin('id'), updateUserValidation, async (req, res) => {
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

    // Solo admins pueden cambiar roles y permisos
    if (req.user.role === 'admin') {
      if (role) updateData.role = role;
      if (permissions) updateData.permissions = permissions;
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

    res.json({
      message: 'Usuario actualizado exitosamente',
      user
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/users/:id - Eliminar usuario (solo admin)
router.delete('/:id', authenticateToken, requirePermission('users.delete'), async (req, res) => {
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

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/users/:id/permissions - Actualizar permisos (solo admin)
router.put('/:id/permissions', authenticateToken, requirePermission('permissions.assign'), async (req, res) => {
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

    user.permissions = permissions;
    await user.save();

    res.json({
      message: 'Permisos actualizados exitosamente',
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Error actualizando permisos:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/users/:id/activate - Activar/desactivar usuario (solo admin)
router.put('/:id/activate', authenticateToken, requirePermission('users.edit'), async (req, res) => {
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

    res.json({
      message: `Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`,
      user
    });

  } catch (error) {
    console.error('Error activando/desactivando usuario:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/users/stats - Estadísticas de usuarios (solo admin)
router.get('/stats/overview', authenticateToken, requirePermission('users.view'), async (req, res) => {
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
});

module.exports = router; 