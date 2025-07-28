const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { uploadVeterinaryLogo, uploadVeterinaryImage, cleanupTempFile } = require('../middleware/upload');

// POST /api/uploads/veterinary-logo - Subir logo de veterinaria
router.post('/veterinary-logo', 
  authenticateToken, 
  requirePermission('veterinaries.create'),
  uploadVeterinaryLogo,
  cleanupTempFile,
  uploadController.uploadVeterinaryLogo
);

// POST /api/uploads/veterinary-image - Subir imagen de veterinaria
router.post('/veterinary-image', 
  authenticateToken, 
  requirePermission('veterinaries.create'),
  uploadVeterinaryImage, // Usamos el middleware específico para imágenes
  cleanupTempFile,
  uploadController.uploadVeterinaryImage
);

// DELETE /api/uploads/image/:publicId - Eliminar imagen
router.delete('/image/:publicId', 
  authenticateToken, 
  requirePermission('veterinaries.delete'),
  uploadController.deleteImage
);

module.exports = router; 