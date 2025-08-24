const express = require('express');
const { body, validationResult } = require('express-validator');
const appointmentController = require('../controllers/appointmentController');
const { 
  authenticateToken, 
  requirePermission 
} = require('../middleware/auth');

const router = express.Router();

// Validaciones para crear/actualizar cita
const appointmentValidation = [
  body('pet')
    .isMongoId()
    .withMessage('ID de mascota inválido'),
  body('owner')
    .isMongoId()
    .withMessage('ID de propietario inválido'),
  body('veterinary')
    .isMongoId()
    .withMessage('ID de veterinaria inválido'),
  body('veterinarian')
    .isMongoId()
    .withMessage('ID de veterinario inválido'),
  body('appointmentDate')
    .isISO8601()
    .withMessage('Fecha de cita inválida'),
  body('appointmentTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Hora de cita inválida (formato HH:MM)'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 240 })
    .withMessage('La duración debe estar entre 15 y 240 minutos'),
  body('type')
    .isIn([
      'consulta_general',
      'vacunacion',
      'cirugia',
      'radiografia',
      'laboratorio',
      'grooming',
      'emergencia',
      'seguimiento',
      'especialidad',
      'otro'
    ])
    .withMessage('Tipo de cita inválido'),
  body('priority')
    .optional()
    .isIn(['baja', 'normal', 'alta', 'urgente'])
    .withMessage('Prioridad inválida'),
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('El motivo debe tener entre 10 y 500 caracteres'),
  body('symptoms')
    .optional()
    .isArray()
    .withMessage('Los síntomas deben ser un array'),
  body('symptoms.*')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Cada síntoma no puede exceder 200 caracteres'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres'),
  body('diagnosis')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('El diagnóstico no puede exceder 1000 caracteres'),
  body('treatment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('El tratamiento no puede exceder 1000 caracteres'),
  body('prescription')
    .optional()
    .isArray()
    .withMessage('La prescripción debe ser un array'),
  body('prescription.*.medication')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El medicamento es requerido'),
  body('prescription.*.dosage')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La dosis es requerida'),
  body('prescription.*.frequency')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La frecuencia es requerida'),
  body('prescription.*.duration')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La duración del tratamiento es requerida'),
  body('cost.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El costo debe ser un número positivo'),
  body('cost.currency')
    .optional()
    .isIn(['MXN', 'USD', 'EUR'])
    .withMessage('Moneda inválida'),
  body('cost.paymentMethod')
    .optional()
    .isIn(['efectivo', 'tarjeta', 'transferencia', 'otro'])
    .withMessage('Método de pago inválido'),
  body('followUp.required')
    .optional()
    .isBoolean()
    .withMessage('followUp.required debe ser un valor booleano'),
  body('followUp.date')
    .optional()
    .isISO8601()
    .withMessage('Fecha de seguimiento inválida'),
  body('followUp.notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Las notas de seguimiento no pueden exceder 500 caracteres')
];

// Validación para actualizar estado
const statusValidation = [
  body('status')
    .isIn([
      'programada',
      'confirmada',
      'en_proceso',
      'completada',
      'cancelada',
      'no_show'
    ])
    .withMessage('Estado inválido')
];

// Validación para marcar como pagada
const paymentValidation = [
  body('paymentMethod')
    .isIn(['efectivo', 'tarjeta', 'transferencia', 'otro'])
    .withMessage('Método de pago inválido')
];

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array()
    });
  }
  next();
};

// Rutas públicas (requieren autenticación)
router.use(authenticateToken);

// GET /api/appointments - Obtener todas las citas (con filtros)
router.get('/', 
  requirePermission('appointments.view'),
  appointmentController.getAllAppointments
);

// GET /api/appointments/stats - Obtener estadísticas
router.get('/stats',
  requirePermission('appointments.view'),
  appointmentController.getAppointmentStats
);

// GET /api/appointments/availability - Verificar disponibilidad
router.get('/availability',
  requirePermission('appointments.view'),
  appointmentController.checkAvailability
);

// GET /api/appointments/owner/:ownerId? - Obtener citas del propietario
router.get('/owner/:ownerId?',
  requirePermission('appointments.view'),
  appointmentController.getOwnerAppointments
);

// GET /api/appointments/veterinary/:veterinaryId - Obtener citas de la veterinaria
router.get('/veterinary/:veterinaryId',
  requirePermission('appointments.view'),
  appointmentController.getVeterinaryAppointments
);

// GET /api/appointments/veterinarian/:veterinarianId? - Obtener citas del veterinario
router.get('/veterinarian/:veterinarianId?',
  requirePermission('appointments.view'),
  appointmentController.getVeterinarianAppointments
);

// GET /api/appointments/date/:date - Obtener citas por fecha
router.get('/date/:date',
  requirePermission('appointments.view'),
  appointmentController.getAppointmentsByDate
);

// GET /api/appointments/:id - Obtener cita por ID
router.get('/:id',
  requirePermission('appointments.view'),
  appointmentController.getAppointmentById
);

// POST /api/appointments - Crear nueva cita
router.post('/',
  requirePermission('appointments.create'),
  appointmentValidation,
  handleValidationErrors,
  appointmentController.createAppointment
);

// PUT /api/appointments/:id - Actualizar cita
router.put('/:id',
  requirePermission('appointments.edit'),
  appointmentValidation,
  handleValidationErrors,
  appointmentController.updateAppointment
);

// PATCH /api/appointments/:id/status - Actualizar estado de la cita
router.patch('/:id/status',
  requirePermission('appointments.edit'),
  statusValidation,
  handleValidationErrors,
  appointmentController.updateAppointmentStatus
);

// PATCH /api/appointments/:id/payment - Marcar cita como pagada
router.patch('/:id/payment',
  requirePermission('appointments.edit'),
  paymentValidation,
  handleValidationErrors,
  appointmentController.markAppointmentAsPaid
);

// DELETE /api/appointments/:id - Eliminar cita
router.delete('/:id',
  requirePermission('appointments.delete'),
  appointmentController.deleteAppointment
);

module.exports = router;
