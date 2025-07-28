const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class LocationService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/locations`;
  }

  // Obtener token del localStorage
  getAuthHeaders() {
    const token = localStorage.getItem('veterinaria_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Obtener todos los estados
  async getStates() {
    try {
      const response = await fetch(`${this.baseURL}/states`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo estados:', error);
      throw error;
    }
  }

  // Obtener municipios por estado
  async getMunicipalitiesByState(stateName) {
    try {
      const response = await fetch(`${this.baseURL}/municipalities/${encodeURIComponent(stateName)}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo municipios:', error);
      throw error;
    }
  }

  // Obtener todos los estados y municipios
  async getAllStatesAndMunicipalities() {
    try {
      const response = await fetch(`${this.baseURL}/all`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo estados y municipios:', error);
      throw error;
    }
  }
}

export default new LocationService(); 