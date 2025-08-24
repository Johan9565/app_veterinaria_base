import { API_BASE_URL } from '../config/config';

class UserService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/users`;
  }

  // Obtener token de autenticación
  getAuthHeaders() {
    const token = localStorage.getItem('veterinaria_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Obtener todos los usuarios
  async getAllUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await fetch(`${this.baseURL}?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  }

  // Obtener usuario por ID
  async getUserById(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw error;
    }
  }

  // Obtener usuarios por rol
  async getUsersByRole(role) {
    try {
      const response = await fetch(`${this.baseURL}/role/${role}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo usuarios por rol:', error);
      throw error;
    }
  }

  // Crear nuevo usuario
  async createUser(userData) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  }

  // Actualizar usuario
  async updateUser(id, userData) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  }

  // Eliminar usuario
  async deleteUser(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  }

  // Obtener opciones de roles
  getRoleOptions() {
    return [
      { value: 'admin', label: 'Administrador' },
      { value: 'veterinario', label: 'Veterinario' },
      { value: 'cliente', label: 'Cliente' }
    ];
  }

  // Obtener opciones de estados
  getStatusOptions() {
    return [
      { value: 'activo', label: 'Activo' },
      { value: 'inactivo', label: 'Inactivo' },
      { value: 'suspendido', label: 'Suspendido' }
    ];
  }

  // Formatear nombre completo
  formatFullName(user) {
    if (!user) return '';
    return `${user.name} ${user.lastName || ''}`.trim();
  }

  // Obtener color para el estado del usuario
  getStatusColor(status) {
    const colors = {
      'activo': 'green',
      'inactivo': 'gray',
      'suspendido': 'red'
    };
    return colors[status] || 'gray';
  }

  // Obtener color para el rol del usuario
  getRoleColor(role) {
    const colors = {
      'admin': 'red',
      'veterinario': 'blue',
      'cliente': 'green'
    };
    return colors[role] || 'gray';
  }
}

export default new UserService();
