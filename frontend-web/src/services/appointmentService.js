import { API_BASE_URL } from '../config/config';

class AppointmentService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/appointments`;
  }

  // Obtener token de autenticación
  getAuthHeaders() {
    const token = localStorage.getItem('veterinaria_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Obtener todas las citas con filtros
  async getAllAppointments(params = {}) {
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
      console.error('Error obteniendo citas:', error);
      throw error;
    }
  }

  // Obtener cita por ID
  async getAppointmentById(id) {
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
      console.error('Error obteniendo cita:', error);
      throw error;
    }
  }

  // Obtener citas del propietario
  async getOwnerAppointments(ownerId = null) {
    try {
      const url = ownerId ? `${this.baseURL}/owner/${ownerId}` : `${this.baseURL}/owner`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo citas del propietario:', error);
      throw error;
    }
  }

  // Obtener citas de la veterinaria
  async getVeterinaryAppointments(veterinaryId) {
    try {
      const response = await fetch(`${this.baseURL}/veterinary/${veterinaryId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo citas de la veterinaria:', error);
      throw error;
    }
  }

  // Obtener citas del veterinario
  async getVeterinarianAppointments(veterinarianId = null) {
    try {
      const url = veterinarianId ? `${this.baseURL}/veterinarian/${veterinarianId}` : `${this.baseURL}/veterinarian`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo citas del veterinario:', error);
      throw error;
    }
  }

  // Obtener citas por fecha
  async getAppointmentsByDate(date) {
    try {
      const response = await fetch(`${this.baseURL}/date/${date}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo citas por fecha:', error);
      throw error;
    }
  }

  // Crear nueva cita
  async createAppointment(appointmentData) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creando cita:', error);
      throw error;
    }
  }

  // Actualizar cita
  async updateAppointment(id, appointmentData) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error actualizando cita:', error);
      throw error;
    }
  }

  // Actualizar estado de la cita
  async updateAppointmentStatus(id, status) {
    try {
      const response = await fetch(`${this.baseURL}/${id}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error actualizando estado de la cita:', error);
      throw error;
    }
  }

  // Marcar cita como pagada
  async markAppointmentAsPaid(id, paymentMethod) {
    try {
      const response = await fetch(`${this.baseURL}/${id}/payment`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ paymentMethod })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error marcando cita como pagada:', error);
      throw error;
    }
  }

  // Eliminar cita
  async deleteAppointment(id) {
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
      console.error('Error eliminando cita:', error);
      throw error;
    }
  }

  // Verificar disponibilidad
  async checkAvailability(params) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await fetch(`${this.baseURL}/availability?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      throw error;
    }
  }

  // Obtener estadísticas de citas
  async getAppointmentStats(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await fetch(`${this.baseURL}/stats?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  // Formatear fecha para la API
  formatDate(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  // Formatear hora para la API
  formatTime(time) {
    if (!time) return null;
    // Asegurar formato HH:MM
    if (typeof time === 'string') {
      return time.substring(0, 5);
    }
    return time;
  }

  // Obtener opciones de tipo de cita
  getAppointmentTypes() {
    return [
      { value: 'consulta_general', label: 'Consulta General' },
      { value: 'vacunacion', label: 'Vacunación' },
      { value: 'cirugia', label: 'Cirugía' },
      { value: 'radiografia', label: 'Radiografía' },
      { value: 'laboratorio', label: 'Laboratorio' },
      { value: 'grooming', label: 'Grooming' },
      { value: 'emergencia', label: 'Emergencia' },
      { value: 'seguimiento', label: 'Seguimiento' },
      { value: 'especialidad', label: 'Especialidad' },
      { value: 'otro', label: 'Otro' }
    ];
  }

  // Obtener opciones de estado de cita
  getAppointmentStatuses() {
    return [
      { value: 'programada', label: 'Programada' },
      { value: 'confirmada', label: 'Confirmada' },
      { value: 'en_proceso', label: 'En Proceso' },
      { value: 'completada', label: 'Completada' },
      { value: 'cancelada', label: 'Cancelada' },
      { value: 'no_show', label: 'No Show' }
    ];
  }

  // Obtener opciones de prioridad
  getPriorityOptions() {
    return [
      { value: 'baja', label: 'Baja' },
      { value: 'normal', label: 'Normal' },
      { value: 'alta', label: 'Alta' },
      { value: 'urgente', label: 'Urgente' }
    ];
  }

  // Obtener opciones de método de pago
  getPaymentMethods() {
    return [
      { value: 'efectivo', label: 'Efectivo' },
      { value: 'tarjeta', label: 'Tarjeta' },
      { value: 'transferencia', label: 'Transferencia' },
      { value: 'otro', label: 'Otro' }
    ];
  }

  // Obtener color para el estado de la cita
  getStatusColor(status) {
    const colors = {
      'programada': 'blue',
      'confirmada': 'green',
      'en_proceso': 'yellow',
      'completada': 'green',
      'cancelada': 'red',
      'no_show': 'gray'
    };
    return colors[status] || 'gray';
  }

  // Obtener color para la prioridad
  getPriorityColor(priority) {
    const colors = {
      'baja': 'green',
      'normal': 'blue',
      'alta': 'yellow',
      'urgente': 'red'
    };
    return colors[priority] || 'gray';
  }
}

export default new AppointmentService();
