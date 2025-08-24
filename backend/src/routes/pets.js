const express = require('express');
const { body, validationResult } = require('express-validator');
const petController = require('../controllers/petController');
const { 
  authenticateToken, 
  requirePermission 
} = require('../middleware/auth');
const { 
  uploadPetImage, 
  cleanupTempFile 
} = require('../middleware/upload');

const router = express.Router();

// Validaciones para crear/actualizar mascota
const petValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('species')
    .isIn(['perro', 'gato', 'ave', 'reptil', 'roedor', 'conejo', 'caballo', 'otro'])
    .withMessage('Especie inválida'),
  body('breed')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La raza no puede exceder 100 caracteres'),
  body('gender')
    .isIn(['macho', 'hembra'])
    .withMessage('Género inválido'),
  body('birthDate')
    .isISO8601()
    .withMessage('Fecha de nacimiento inválida'),
  body('weight.value')
    .isFloat({ min: 0 })
    .withMessage('El peso debe ser un número positivo'),
  body('weight.unit')
    .optional()
    .isIn(['kg', 'lb'])
    .withMessage('Unidad de peso inválida'),
  body('color')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El color no puede exceder 50 caracteres'),
  body('microchip.number')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('El número de microchip debe tener entre 10 y 20 caracteres'),
  body('microchip.implantedDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de implantación inválida'),
  body('isNeutered')
    .optional()
    .isBoolean()
    .withMessage('isNeutered debe ser un valor booleano'),
  body('neuteredDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de esterilización inválida'),
  body('healthStatus')
    .optional()
    .isIn(['excelente', 'bueno', 'regular', 'malo', 'crítico'])
    .withMessage('Estado de salud inválido'),
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Las alergias deben ser un array'),
  body('allergies.*')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Cada alergia no puede exceder 100 caracteres'),
  body('owner')
    .optional()
    .isMongoId()
    .withMessage('ID de propietario inválido'),
  body('veterinary')
    .optional()
    .isMongoId()
    .withMessage('ID de veterinaria inválido'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres'),
  body('emergencyContact.name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El nombre del contacto de emergencia no puede exceder 100 caracteres'),
  body('emergencyContact.phone')
    .optional()
    .trim()
    .matches(/^\d{10}$/)
    .withMessage('El teléfono debe tener exactamente 10 números'),
  body('emergencyContact.relationship')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('La relación no puede exceder 50 caracteres'),
  body('insurance.provider')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El proveedor de seguro no puede exceder 100 caracteres'),
  body('insurance.policyNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El número de póliza no puede exceder 50 caracteres'),
  body('insurance.expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de vencimiento del seguro inválida'),
  body('photo.url')
    .optional()
    .isURL()
    .withMessage('URL de foto inválida'),
  body('photo.publicId')
    .optional()
    .isString()
    .withMessage('Public ID de foto inválido')
];

// Validaciones para registro médico
const medicalRecordValidation = [
  body('type')
    .isIn(['consulta', 'vacunación', 'cirugía', 'emergencia', 'chequeo', 'otro'])
    .withMessage('Tipo de registro médico inválido'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('La descripción debe tener entre 10 y 500 caracteres'),
  body('diagnosis')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('El diagnóstico no puede exceder 300 caracteres'),
  body('treatment')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('El tratamiento no puede exceder 300 caracteres'),
  body('veterinarian')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El nombre del veterinario no puede exceder 100 caracteres'),
  body('veterinary')
    .optional()
    .isMongoId()
    .withMessage('ID de veterinaria inválido'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El costo debe ser un número positivo'),
  body('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de seguimiento inválida')
];

// Validaciones para vacuna
const vaccinationValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre de la vacuna debe tener entre 2 y 100 caracteres'),
  body('date')
    .isISO8601()
    .withMessage('Fecha de vacunación inválida'),
  body('nextDueDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de próxima vacunación inválida'),
  body('veterinarian')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El nombre del veterinario no puede exceder 100 caracteres'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Las notas no pueden exceder 300 caracteres')
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

// GET /api/pets - Obtener todas las mascotas (con filtros)
router.get('/', 
  authenticateToken, 
  requirePermission('pets.view'), 
  petController.getAllPets
);

// GET /api/pets/stats - Obtener estadísticas de mascotas
router.get('/stats', 
  authenticateToken, 
  requirePermission('pets.stats'), 
  petController.getPetStats
);

// GET /api/pets/user/:userId? - Obtener mascotas del usuario
router.get('/user/:userId?', 
  authenticateToken, 
  requirePermission('pets.view'), 
  petController.getUserPets
);

// GET /api/pets/veterinary/:veterinaryId - Obtener mascotas de una veterinaria
router.get('/veterinary/:veterinaryId', 
  authenticateToken, 
  requirePermission('pets.view'), 
  petController.getVeterinaryPets
);

// GET /api/pets/:id - Obtener mascota específica
router.get('/:id', 
  authenticateToken, 
  requirePermission('pets.view'), 
  petController.getPetById
);

// POST /api/pets - Crear nueva mascota
router.post('/', 
  authenticateToken, 
  requirePermission('pets.create'),
  petValidation,
  handleValidationErrors,
  petController.createPet
);

// PUT /api/pets/:id - Actualizar mascota
router.put('/:id', 
  authenticateToken, 
  requirePermission('pets.edit'),
  petValidation,
  handleValidationErrors,
  petController.updatePet
);

// DELETE /api/pets/:id - Eliminar mascota (soft delete)
router.delete('/:id', 
  authenticateToken, 
  requirePermission('pets.delete'),
  petController.deletePet
);

// POST /api/pets/:id/medical-record - Agregar registro médico
router.post('/:id/medical-record',
  authenticateToken,
  requirePermission('pets.edit'),
  medicalRecordValidation,
  handleValidationErrors,
  petController.addMedicalRecord
);

// POST /api/pets/:id/vaccination - Agregar vacuna
router.post('/:id/vaccination',
  authenticateToken,
  requirePermission('pets.edit'),
  vaccinationValidation,
  handleValidationErrors,
  petController.addVaccination
);

// POST /api/pets/:id/upload-image - Subir imagen de mascota
router.post('/:id/upload-image',
  authenticateToken,
  uploadPetImage,
  cleanupTempFile,
  petController.uploadPetImage
);

// DELETE /api/pets/:id/image - Eliminar imagen de mascota
router.delete('/:id/image',
  authenticateToken,
  petController.deletePetImage
);

module.exports = router; 