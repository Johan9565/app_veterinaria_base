const express = require('express');
const { body, validationResult } = require('express-validator');
const veterinaryController = require('../controllers/veterinaryController');
const { 
  authenticateToken, 
  requirePermission, 
  requireRole 
} = require('../middleware/auth');

const router = express.Router();

// Validaciones para crear/actualizar veterinaria
const veterinaryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('La dirección debe tener entre 10 y 200 caracteres'),
  body('phone')
    .trim()
    .matches(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .withMessage('Formato de teléfono inválido'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('La ciudad es requerida'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('El estado/provincia es requerido'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  body('website')
    .optional()
    .isURL()
    .withMessage('URL inválida'),
  body('services')
    .optional()
    .isArray()
    .withMessage('Los servicios deben ser un array'),
  body('services.*')
    .optional()
    .isIn([
      'consultas_generales',
      'vacunacion',
      'cirugia',
      'radiografia',
      'laboratorio',
      'grooming',
      'emergencias',
      'especialidades',
      'farmacia',
      'hospitalizacion'
    ])
    .withMessage('Servicio inválido'),
  body('specialties')
    .optional()
    .isArray()
    .withMessage('Las especialidades deben ser un array'),
  body('emergencyPhone')
    .optional()
    .matches(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .withMessage('Formato de teléfono de emergencia inválido'),
  body('emergencyAvailable')
    .optional()
    .isBoolean()
    .withMessage('emergencyAvailable debe ser un valor booleano'),
  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Las coordenadas deben ser un array de 2 números'),
  body('location.coordinates.*')
    .optional()
    .isFloat()
    .withMessage('Las coordenadas deben ser números'),
  body('zipCode')
    .optional()
    .trim()
    .isLength({ min: 4, max: 10 })
    .withMessage('El código postal debe tener entre 4 y 10 caracteres'),
  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El país debe tener entre 2 y 50 caracteres'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano'),
  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified debe ser un valor booleano')
];

// Validaciones para agregar personal
const addStaffValidation = [
  body('userId')
    .isMongoId()
    .withMessage('ID de usuario inválido'),
  body('role')
    .isIn(['veterinario', 'asistente', 'recepcionista', 'administrador'])
    .withMessage('Rol inválido')
];

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de validación incorrectos',
      errors: errors.array()
    });
  }
  next();
};

// GET /api/veterinaries - Obtener todas las veterinarias (público)
router.get('/', veterinaryController.getAllVeterinaries);

// GET /api/veterinaries/stats - Obtener estadísticas (solo admin)
router.get('/stats', authenticateToken, requirePermission('veterinaries.stats'), veterinaryController.getVeterinaryStats);

// GET /api/veterinaries/nearby - Buscar veterinarias cercanas (público)
router.get('/nearby', veterinaryController.findNearbyVeterinaries);

// GET /api/veterinaries/service/:service - Buscar por servicio (público)
router.get('/service/:service', veterinaryController.findVeterinariesByService);

// GET /api/veterinaries/user/:userId? - Obtener veterinarias del usuario
router.get('/user/:userId?', authenticateToken, requirePermission('veterinaries.mine.view'), veterinaryController.getUserVeterinaries);

// GET /api/veterinaries/:id - Obtener veterinaria específica (público)
router.get('/:id', veterinaryController.getVeterinaryById);

// POST /api/veterinaries - Crear nueva veterinaria (autenticado)
router.post('/', 
  authenticateToken, 
  requirePermission('veterinaries.create'),
  veterinaryValidation,
  handleValidationErrors,
  veterinaryController.createVeterinary
);

// PUT /api/veterinaries/:id - Actualizar veterinaria
router.put('/:id', 
  authenticateToken, 
  requirePermission('veterinaries.update'),
  veterinaryValidation,
  handleValidationErrors,
  veterinaryController.updateVeterinary
);

// DELETE /api/veterinaries/:id - Eliminar veterinaria (soft delete)
router.delete('/:id', 
  authenticateToken, 
  requirePermission('veterinaries.delete'),
  veterinaryController.deleteVeterinary
);

// POST /api/veterinaries/:id/staff - Agregar personal
router.post('/:id/staff',
  authenticateToken,
  requirePermission('veterinaries.manage_staff'),
  addStaffValidation,
  handleValidationErrors,
  veterinaryController.addStaffMember
);

// DELETE /api/veterinaries/:id/staff/:staffId - Remover personal
router.delete('/:id/staff/:staffId',
  authenticateToken,
  requirePermission('veterinaries.manage_staff'),
  veterinaryController.removeStaffMember
);

module.exports = router; 