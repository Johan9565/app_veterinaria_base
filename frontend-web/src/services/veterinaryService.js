const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class VeterinaryService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/veterinaries`;
  }

  // Obtener token del localStorage
  getAuthHeaders() {
    const token = localStorage.getItem('veterinaria_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // GET /api/veterinaries - Obtener todas las veterinarias
  async getAllVeterinaries(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.city) queryParams.append('city', params.city);
      if (params.service) queryParams.append('service', params.service);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

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
      console.error('Error obteniendo veterinarias:', error);
      throw error;
    }
  }

  // GET /api/veterinaries/user/:userId - Obtener veterinarias del usuario
  async getUserVeterinaries(userId = null) {
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
      console.error('Error obteniendo veterinarias del usuario:', error);
      throw error;
    }
  }

  // GET /api/veterinaries/:id - Obtener veterinaria específica
  async getVeterinaryById(id) {
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
      console.error('Error obteniendo veterinaria:', error);
      throw error;
    }
  }

  // POST /api/veterinaries - Crear nueva veterinaria
  async createVeterinary(veterinaryData) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(veterinaryData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creando veterinaria:', error);
      throw error;
    }
  }

  // PUT /api/veterinaries/:id - Actualizar veterinaria
  async updateVeterinary(id, veterinaryData) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(veterinaryData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error actualizando veterinaria:', error);
      throw error;
    }
  }

  // DELETE /api/veterinaries/:id - Eliminar veterinaria
  async deleteVeterinary(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error eliminando veterinaria:', error);
      throw error;
    }
  }

  // GET /api/veterinaries/nearby - Buscar veterinarias cercanas
  async findNearbyVeterinaries(lat, lng, radius = 10) {
    try {
      const queryParams = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString()
      });

      const response = await fetch(`${this.baseURL}/nearby?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error buscando veterinarias cercanas:', error);
      throw error;
    }
  }

  // GET /api/veterinaries/service/:service - Buscar por servicio
  async findVeterinariesByService(service) {
    try {
      const response = await fetch(`${this.baseURL}/service/${service}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error buscando veterinarias por servicio:', error);
      throw error;
    }
  }

  // POST /api/veterinaries/:id/staff - Agregar personal
  async addStaffMember(veterinaryId, staffData) {
    try {
      const response = await fetch(`${this.baseURL}/${veterinaryId}/staff`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(staffData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error agregando personal:', error);
      throw error;
    }
  }

  // DELETE /api/veterinaries/:id/staff/:staffId - Remover personal
  async removeStaffMember(veterinaryId, staffId) {
    try {
      const response = await fetch(`${this.baseURL}/${veterinaryId}/staff/${staffId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error removiendo personal:', error);
      throw error;
    }
  }

  // GET /api/veterinaries/stats - Obtener estadísticas
  async getVeterinaryStats() {
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
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

export default new VeterinaryService(); 