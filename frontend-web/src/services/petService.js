const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class PetService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/pets`;
  }

  // Obtener token del localStorage
  getAuthHeaders() {
    const token = localStorage.getItem('veterinaria_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // GET /api/pets - Obtener todas las mascotas (con filtros)
  async getAllPets(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.species) queryParams.append('species', params.species);
      if (params.owner) queryParams.append('owner', params.owner);
      if (params.veterinary) queryParams.append('veterinary', params.veterinary);
      if (params.healthStatus) queryParams.append('healthStatus', params.healthStatus);

      const url = `${this.baseURL}?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo mascotas:', error);
      throw error;
    }
  }

  // GET /api/pets/user/:userId - Obtener mascotas del usuario
  async getUserPets(userId = null) {
    try {
      const url = userId ? `${this.baseURL}/user/${userId}` : `${this.baseURL}/user`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo mascotas del usuario:', error);
      throw error;
    }
  }

  // GET /api/pets/veterinary/:veterinaryId - Obtener mascotas de una veterinaria
  async getVeterinaryPets(veterinaryId) {
    try {
      const response = await fetch(`${this.baseURL}/veterinary/${veterinaryId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo mascotas de la veterinaria:', error);
      throw error;
    }
  }

  // GET /api/pets/:id - Obtener mascota específica
  async getPetById(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo mascota:', error);
      throw error;
    }
  }

  // POST /api/pets - Crear nueva mascota
  async createPet(petData) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(petData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.response = { data: errorData };
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('Error creando mascota:', error);
      throw error;
    }
  }

  // PUT /api/pets/:id - Actualizar mascota
  async updatePet(id, petData) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(petData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.response = { data: errorData };
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('Error actualizando mascota:', error);
      throw error;
    }
  }

  // DELETE /api/pets/:id - Eliminar mascota
  async deletePet(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.response = { data: errorData };
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('Error eliminando mascota:', error);
      throw error;
    }
  }

  // POST /api/pets/:id/medical-record - Agregar registro médico
  async addMedicalRecord(petId, recordData) {
    try {
      const response = await fetch(`${this.baseURL}/${petId}/medical-record`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(recordData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.response = { data: errorData };
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('Error agregando registro médico:', error);
      throw error;
    }
  }

  // POST /api/pets/:id/vaccination - Agregar vacuna
  async addVaccination(petId, vaccinationData) {
    try {
      const response = await fetch(`${this.baseURL}/${petId}/vaccination`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(vaccinationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.response = { data: errorData };
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('Error agregando vacuna:', error);
      throw error;
    }
  }

  // GET /api/pets/stats - Obtener estadísticas de mascotas
  async getPetStats() {
    try {
      const response = await fetch(`${this.baseURL}/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo estadísticas de mascotas:', error);
      throw error;
    }
  }

  // Buscar mascotas por veterinaria cercana
  async findNearbyPets(lat, lng, radius = 10) {
    try {
      const response = await fetch(`${this.baseURL}/nearby?lat=${lat}&lng=${lng}&radius=${radius}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error buscando mascotas cercanas:', error);
      throw error;
    }
  }

  // Buscar mascotas por especie
  async findPetsBySpecies(species) {
    try {
      const response = await fetch(`${this.baseURL}/species/${species}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error buscando mascotas por especie:', error);
      throw error;
    }
  }

  // POST /api/pets/:id/upload-image - Subir imagen de mascota
  async uploadPetImage(petId, file) {
    try {
      const token = localStorage.getItem('veterinaria_token');
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${this.baseURL}/${petId}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // No incluir Content-Type, se establece automáticamente para FormData
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.response = { data: errorData };
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('Error subiendo imagen de mascota:', error);
      throw error;
    }
  }

  // DELETE /api/pets/:id/image - Eliminar imagen de mascota
  async deletePetImage(petId) {
    try {
      const response = await fetch(`${this.baseURL}/${petId}/image`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.response = { data: errorData };
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('Error eliminando imagen de mascota:', error);
      throw error;
    }
  }
}

export default new PetService(); 