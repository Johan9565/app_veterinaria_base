const cloudinary = require('cloudinary').v2;

// Verificar si las credenciales están configuradas
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('⚠️  Advertencia: Credenciales de Cloudinary no configuradas. Usando valores demo.');
  console.warn('   Configura las variables de entorno: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
} else {
  console.log('✅ Credenciales de Cloudinary configuradas correctamente');
  console.log('   Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
  console.log('   API Key:', process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'No configurada');
  console.log('   API Secret:', process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'No configurada');
}

// Configurar Cloudinary con las credenciales
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
});

class CloudinaryService {
  // Subir imagen a Cloudinary
  async uploadImage(file, folder = 'veterinarias') {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: folder,
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      };
    } catch (error) {
      console.error('Error subiendo imagen a Cloudinary:', error);
      throw new Error('Error al subir la imagen');
    }
  }

  // Subir logo de veterinaria
  async uploadVeterinaryLogo(file) {
    return this.uploadImage(file, 'veterinarias/logos');
  }

  // Subir imágenes de veterinaria
  async uploadVeterinaryImages(file) {
    return this.uploadImage(file, 'veterinarias/images');
  }

  // Eliminar imagen de Cloudinary
  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Error eliminando imagen de Cloudinary:', error);
      throw new Error('Error al eliminar la imagen');
    }
  }

  // Validar archivo de imagen
  validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: 'Formato de imagen no válido. Use JPG, PNG, GIF o WebP'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'La imagen no puede exceder 5MB'
      };
    }

    return { valid: true };
  }

  // Obtener URL optimizada
  getOptimizedUrl(url, options = {}) {
    if (!url || !url.includes('cloudinary.com')) {
      return url;
    }

    const { width, height, quality = 'auto', format = 'auto' } = options;
    let optimizedUrl = url;

    if (width || height || quality !== 'auto' || format !== 'auto') {
      const transformations = [];
      if (width) transformations.push(`w_${width}`);
      if (height) transformations.push(`h_${height}`);
      if (quality !== 'auto') transformations.push(`q_${quality}`);
      if (format !== 'auto') transformations.push(`f_${format}`);

      if (transformations.length > 0) {
        optimizedUrl = url.replace('/upload/', `/upload/${transformations.join(',')}/`);
      }
    }

    return optimizedUrl;
  }
}

module.exports = new CloudinaryService(); 