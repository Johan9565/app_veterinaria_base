import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import appointmentService from '../services/appointmentService';
import petService from '../services/petService';
import veterinaryService from '../services/veterinaryService';
import userService from '../services/userService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select2 from '../components/ui/Select2';
import CreateAppointmentModal from '../components/CreateAppointmentModal';
import EditAppointmentModal from '../components/EditAppointmentModal';
import AppointmentDetailModal from '../components/AppointmentDetailModal';
import Navbar from '../components/Navbar';
import AlertService from '../services/alertService';

const AppointmentsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [veterinaries, setVeterinaries] = useState([]);
  const [veterinarians, setVeterinarians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterVeterinary, setFilterVeterinary] = useState('');
  const [filterVeterinarian, setFilterVeterinarian] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [viewMode, setViewMode] = useState(user?.role === 'cliente' ? 'my' : 'all'); // 'my', 'all', 'veterinary', 'veterinarian'
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAppointments: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Opciones para filtros
  const statusOptions = appointmentService.getAppointmentStatuses();
  const typeOptions = appointmentService.getAppointmentTypes();
  const priorityOptions = appointmentService.getPriorityOptions();

  // Cargar citas según el modo de vista
  const loadAppointments = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      const params = {
        page,
        limit: 10,
        search: searchTerm,
        status: filterStatus,
        type: filterType,
        veterinary: filterVeterinary,
        veterinarian: filterVeterinarian,
        date: filterDate,
        priority: filterPriority
      };
      
      switch (viewMode) {
        case 'my':
          response = await appointmentService.getOwnerAppointments();
          setAppointments(response.data.appointments || []);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalAppointments: response.data.appointments?.length || 0,
            hasNextPage: false,
            hasPrevPage: false
          });
          break;
        case 'veterinary':
          if (filterVeterinary) {
            response = await appointmentService.getVeterinaryAppointments(filterVeterinary);
            setAppointments(response.data.appointments || []);
            setPagination({
              currentPage: 1,
              totalPages: 1,
              totalAppointments: response.data.appointments?.length || 0,
              hasNextPage: false,
              hasPrevPage: false
            });
          } else {
            response = await appointmentService.getAllAppointments(params);
            setAppointments(response.data.appointments || []);
            setPagination(response.data.pagination || {});
          }
          break;
        case 'veterinarian':
          response = await appointmentService.getVeterinarianAppointments();
          setAppointments(response.data.appointments || []);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalAppointments: response.data.appointments?.length || 0,
            hasNextPage: false,
            hasPrevPage: false
          });
          break;
        default:
          response = await appointmentService.getAllAppointments(params);
          setAppointments(response.data.appointments || []);
          setPagination(response.data.pagination || {});
      }
    } catch (err) {
      console.error('Error cargando citas:', err);
      setError('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

      // Resetear todos los filtros
  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterType('');
    setFilterVeterinary('');
    setFilterVeterinarian('');
    setFilterDate('');
    setFilterPriority('');
  };

  // Cargar datos para filtros
  const loadFilterData = async () => {
    try {
      // Cargar mascotas según el rol del usuario
      let petsResponse;
      if (user?.role === 'cliente') {
        petsResponse = await petService.getUserPets();
      } else {
        petsResponse = await petService.getAllPets();
      }
      
      const petsData = petsResponse.data?.pets || petsResponse.pets || [];
      setPets(petsData);

      // Cargar veterinarias
      const vetResponse = await veterinaryService.getUserVeterinaries();
      const vetOptions = (vetResponse.data?.veterinaries || []).map(vet => ({
        value: vet._id,
        label: vet.name
      }));
      setVeterinaries(vetOptions);

      // Cargar veterinarios
      const vetUsersResponse = await userService.getUsersByRole('veterinario');
      const vetUserOptions = (vetUsersResponse.users || []).map(vet => ({
        value: vet._id,
        label: vet.name
      }));
      setVeterinarians(vetUserOptions);
    } catch (err) {
      console.error('Error cargando datos de filtro:', err);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadFilterData();
  }, []);

  // Recargar citas cuando cambien los filtros
  useEffect(() => {
    loadAppointments(1);
  }, [viewMode, searchTerm, filterStatus, filterType, filterVeterinary, filterVeterinarian, filterDate, filterPriority]);

  // Manejar cambio de página
  const handlePageChange = (page) => {
    loadAppointments(page);
  };

  // Manejar creación de cita
  const handleCreateAppointment = async (appointmentData) => {
    try {
      await appointmentService.createAppointment(appointmentData);
      AlertService.success('Cita creada', 'La cita se ha creado exitosamente');
      setShowCreateModal(false);
      loadAppointments(pagination.currentPage);
    } catch (err) {
      console.error('Error creando cita:', err);
      const errorMessage = err.message || 'No se pudo crear la cita';
      AlertService.error('Error al crear', errorMessage);
    }
  };

  // Manejar edición de cita
  const handleEditAppointment = async (id, appointmentData) => {
    try {
      await appointmentService.updateAppointment(id, appointmentData);
      AlertService.success('Cita actualizada', 'La cita se ha actualizado exitosamente');
      setShowEditModal(false);
      setSelectedAppointment(null);
      loadAppointments(pagination.currentPage);
    } catch (err) {
      console.error('Error actualizando cita:', err);
      const errorMessage = err.message || 'No se pudo actualizar la cita';
      AlertService.error('Error al actualizar', errorMessage);
    }
  };

  // Manejar cambio de estado
  const handleStatusChange = async (id, newStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(id, newStatus);
      AlertService.success('Estado actualizado', 'El estado de la cita se ha actualizado exitosamente');
      loadAppointments(pagination.currentPage);
    } catch (err) {
      console.error('Error actualizando estado:', err);
      const errorMessage = err.message || 'No se pudo actualizar el estado';
      AlertService.error('Error al actualizar', errorMessage);
    }
  };

  // Manejar pago
  const handlePayment = async (id, paymentMethod) => {
    try {
      await appointmentService.markAppointmentAsPaid(id, paymentMethod);
      AlertService.success('Pago registrado', 'El pago se ha registrado exitosamente');
      loadAppointments(pagination.currentPage);
    } catch (err) {
      console.error('Error registrando pago:', err);
      const errorMessage = err.message || 'No se pudo registrar el pago';
      AlertService.error('Error al registrar', errorMessage);
    }
  };

  // Manejar eliminación
  const handleDeleteAppointment = async (id) => {
    try {
      await appointmentService.deleteAppointment(id);
      AlertService.success('Cita eliminada', 'La cita se ha eliminado exitosamente');
      loadAppointments(pagination.currentPage);
    } catch (err) {
      console.error('Error eliminando cita:', err);
      const errorMessage = err.message || 'No se pudo eliminar la cita';
      AlertService.error('Error al eliminar', errorMessage);
    }
  };

  // Formatear fecha
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formatear hora
  const formatTime = (time) => {
    return time;
  };

  // Obtener badge de estado
  const getStatusBadge = (status) => {
    const color = appointmentService.getStatusColor(status);
    const statusConfig = {
      'programada': { label: 'Programada', bgColor: 'bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
      'confirmada': { label: 'Confirmada', bgColor: 'bg-green-100', textColor: 'text-green-700', borderColor: 'border-green-200' },
      'en_proceso': { label: 'En Proceso', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' },
      'completada': { label: 'Completada', bgColor: 'bg-green-100', textColor: 'text-green-700', borderColor: 'border-green-200' },
      'cancelada': { label: 'Cancelada', bgColor: 'bg-red-100', textColor: 'text-red-700', borderColor: 'border-red-200' },
      'no_show': { label: 'No Show', bgColor: 'bg-gray-100', textColor: 'text-gray-700', borderColor: 'border-gray-200' }
    };

    const config = statusConfig[status] || statusConfig['programada'];

    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
        {config.label}
      </span>
    );
  };

  // Obtener badge de prioridad
  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'baja': { label: 'Baja', bgColor: 'bg-green-100', textColor: 'text-green-700', borderColor: 'border-green-200' },
      'normal': { label: 'Normal', bgColor: 'bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
      'alta': { label: 'Alta', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' },
      'urgente': { label: 'Urgente', bgColor: 'bg-red-100', textColor: 'text-red-700', borderColor: 'border-red-200' }
    };

    const config = priorityConfig[priority] || priorityConfig['normal'];

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
        {config.label}
      </span>
    );
  };

  // Obtener badge de tipo
  const getTypeBadge = (type) => {
    const typeConfig = {
      'consulta_general': { label: 'Consulta General', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      'vacunacion': { label: 'Vacunación', bgColor: 'bg-green-100', textColor: 'text-green-700' },
      'cirugia': { label: 'Cirugía', bgColor: 'bg-red-100', textColor: 'text-red-700' },
      'radiografia': { label: 'Radiografía', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
      'laboratorio': { label: 'Laboratorio', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
      'grooming': { label: 'Grooming', bgColor: 'bg-pink-100', textColor: 'text-pink-700' },
      'emergencia': { label: 'Emergencia', bgColor: 'bg-red-100', textColor: 'text-red-700' },
      'seguimiento': { label: 'Seguimiento', bgColor: 'bg-indigo-100', textColor: 'text-indigo-700' },
      'especialidad': { label: 'Especialidad', bgColor: 'bg-teal-100', textColor: 'text-teal-700' },
      'otro': { label: 'Otro', bgColor: 'bg-gray-100', textColor: 'text-gray-700' }
    };

    const config = typeConfig[type] || typeConfig['otro'];

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bgColor} ${config.textColor}`}>
        {config.label}
      </span>
    );
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Citas</h1>
              <p className="mt-2 text-gray-600">
                Gestiona las citas veterinarias del sistema
              </p>
            </div>
            
            {/* Botones de acción */}
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              {/* Modo de vista */}
              <div className="flex rounded-lg border border-gray-200 bg-white p-1">
                {user?.role === 'cliente' && (
                  <button
                    onClick={() => setViewMode('my')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'my'
                        ? 'text-[#4CAF50]'
                        : 'text-gray-600 hover:text-[#4CAF50]'
                    }`}
                  >
                    Mis Citas
                  </button>
                )}
                {user?.role === 'veterinario' && (
                  <button
                    onClick={() => setViewMode('veterinarian')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'veterinarian'
                        ? 'text-[#4CAF50]'
                        : 'text-gray-600 hover:text-[#4CAF50]'
                    }`}
                  >
                    Mis Citas
                  </button>
                )}
                {user?.permissions?.includes('appointments.read') && (
                  <button
                    onClick={() => setViewMode('all')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'all'
                        ? 'text-[#4CAF50]'
                        : 'text-gray-600 hover:text-[#4CAF50]'
                    }`}
                  >
                    Todas
                  </button>
                )}
                {user?.role === 'admin' && (
                  <button
                    onClick={() => setViewMode('veterinary')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'veterinary'
                        ? 'text-[#4CAF50]'
                        : 'text-gray-600 hover:text-[#4CAF50]'
                    }`}
                  >
                    Por Veterinaria
                  </button>
                )}
              </div>

              {/* Crear nueva cita */}
              {user?.permissions?.includes('appointments.create') && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  variant="primary"
                  size="md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nueva Cita
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros */}
        {viewMode === 'all' && (
          <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
              <Button
                onClick={resetFilters}
                variant="secondary"
                size="sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Resetear Filtros
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <Input
                label="Buscar"
                placeholder="Motivo, notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Filtro por estado */}
              <Select2
                label="Estado"
                options={[{ value: '', label: 'Todos los estados' }, ...statusOptions]}
                value={filterStatus}
                onChange={setFilterStatus}
                placeholder="Seleccionar estado"
              />

              {/* Filtro por tipo */}
              <Select2
                label="Tipo"
                options={[{ value: '', label: 'Todos los tipos' }, ...typeOptions]}
                value={filterType}
                onChange={setFilterType}
                placeholder="Seleccionar tipo"
              />

              {/* Filtro por veterinaria */}
              <Select2
                label="Veterinaria"
                options={[{ value: '', label: 'Todas las veterinarias' }, ...veterinaries]}
                value={filterVeterinary}
                onChange={setFilterVeterinary}
                placeholder="Seleccionar veterinaria"
              />

              {/* Filtro por veterinario */}
              <Select2
                label="Veterinario"
                options={[{ value: '', label: 'Todos los veterinarios' }, ...veterinarians]}
                value={filterVeterinarian}
                onChange={setFilterVeterinarian}
                placeholder="Seleccionar veterinario"
              />

              {/* Filtro por fecha */}
              <Input
                label="Fecha"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />

              {/* Filtro por prioridad */}
              <Select2
                label="Prioridad"
                options={[{ value: '', label: 'Todas las prioridades' }, ...priorityOptions]}
                value={filterPriority}
                onChange={setFilterPriority}
                placeholder="Seleccionar prioridad"
              />
            </div>
          </div>
        )}

        {/* Lista de citas */}
        <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {appointments.length === 0 && !loading ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
              <p className="mt-1 text-sm text-gray-500">
                {user?.permissions?.includes('appointments.create') 
                  ? 'Comienza creando una nueva cita.'
                  : 'No se encontraron citas con los filtros aplicados.'
                }
              </p>
              {user?.permissions?.includes('appointments.create') && (
                <div className="mt-6">
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    variant="primary"
                    size="md"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nueva Cita
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cita
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mascota
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Veterinario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioridad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.reason.length > 50 
                            ? `${appointment.reason.substring(0, 50)}...` 
                            : appointment.reason
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          Duración: {appointment.duration} min
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.pet?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.pet?.species} • {appointment.pet?.breed}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.veterinarian?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.veterinary?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(appointment.appointmentDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatTime(appointment.appointmentTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(appointment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(appointment.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(appointment.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowDetailModal(true);
                            }}
                            variant="secondary"
                            size="sm"
                          >
                            Ver
                          </Button>
                          {user?.permissions?.includes('appointments.update') && (
                            <Button
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowEditModal(true);
                              }}
                              variant="primary"
                              size="sm"
                            >
                              Editar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  variant="secondary"
                  size="sm"
                >
                  Anterior
                </Button>
                <Button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  variant="secondary"
                  size="sm"
                >
                  Siguiente
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{(pagination.currentPage - 1) * 10 + 1}</span> a{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * 10, pagination.totalAppointments)}
                    </span>{' '}
                    de <span className="font-medium">{pagination.totalAppointments}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <Button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      variant="secondary"
                      size="sm"
                    >
                      Anterior
                    </Button>
                    <Button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      variant="secondary"
                      size="sm"
                    >
                      Siguiente
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {showCreateModal && (
        <CreateAppointmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAppointment}
          pets={pets}
          veterinaries={veterinaries}
          veterinarians={veterinarians}
        />
      )}

      {showEditModal && selectedAppointment && (
        <EditAppointmentModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAppointment(null);
          }}
          onSubmit={handleEditAppointment}
          appointment={selectedAppointment}
          pets={pets}
          veterinaries={veterinaries}
          veterinarians={veterinarians}
          onStatusChange={handleStatusChange}
          onPayment={handlePayment}
          onDelete={handleDeleteAppointment}
        />
      )}

      {showDetailModal && selectedAppointment && (
        <AppointmentDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onStatusChange={handleStatusChange}
          onPayment={handlePayment}
          onDelete={handleDeleteAppointment}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;
