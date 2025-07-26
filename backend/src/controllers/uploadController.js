const cloudinaryService = require('../services/cloudinaryService');

class UploadController {
  // Subir logo de veterinaria
  async uploadVeterinaryLogo(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ningún archivo'
        });
      }

      // Validar archivo
      const validation = cloudinaryService.validateImageFile(req.file);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error
        });
      }

      // Subir a Cloudinary
      const result = await cloudinaryService.uploadVeterinaryLogo(req.file);

      res.json({
        success: true,
        message: 'Logo subido exitosamente',
        data: result
      });

    } catch (error) {
      console.error('Error en uploadVeterinaryLogo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al subir el logo',
        error: error.message
      });
    }
  }

  // Subir imagen general de veterinaria
  async uploadVeterinaryImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ningún archivo'
        });
      }

      // Validar archivo
      const validation = cloudinaryService.validateImageFile(req.file);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error
        });
      }

      // Subir a Cloudinary
      const result = await cloudinaryService.uploadVeterinaryImages(req.file);

      res.json({
        success: true,
        message: 'Imagen subida exitosamente',
        data: result
      });

    } catch (error) {
      console.error('Error en uploadVeterinaryImage:', error);
      res.status(500).json({
        success: false,
        message: 'Error al subir la imagen',
        error: error.message
      });
    }
  }

  // Eliminar imagen de Cloudinary
  async deleteImage(req, res) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere el ID público de la imagen'
        });
      }

      const result = await cloudinaryService.deleteImage(publicId);

      res.json({
        success: true,
        message: 'Imagen eliminada exitosamente',
        data: result
      });

    } catch (error) {
      console.error('Error en deleteImage:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la imagen',
        error: error.message
      });
    }
  }
}

module.exports = new UploadController(); 