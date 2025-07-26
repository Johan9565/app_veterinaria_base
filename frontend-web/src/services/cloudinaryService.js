const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class CloudinaryService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/uploads`;
  }

  // Obtener token del localStorage
  getAuthHeaders() {
    const token = localStorage.getItem('veterinaria_token');
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  // Subir logo de veterinaria al backend
  async uploadVeterinaryLogo(file) {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(`${this.baseURL}/veterinary-logo`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir el logo');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en CloudinaryService.uploadVeterinaryLogo:', error);
      throw error;
    }
  }

  // Subir imagen de veterinaria al backend
  async uploadVeterinaryImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${this.baseURL}/veterinary-image`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir la imagen');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en CloudinaryService.uploadVeterinaryImage:', error);
      throw error;
    }
  }

  // Eliminar imagen de Cloudinary
  async deleteImage(publicId) {
    try {
      const response = await fetch(`${this.baseURL}/image/${publicId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar la imagen');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en CloudinaryService.deleteImage:', error);
      throw error;
    }
  }

  // Validar archivo de imagen
  validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
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

  // Obtener URL optimizada de Cloudinary
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

export default new CloudinaryService(); 