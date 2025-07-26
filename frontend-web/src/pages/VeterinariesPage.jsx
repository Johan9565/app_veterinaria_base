import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import veterinaryService from '../services/veterinaryService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import CreateVeterinaryModal from '../components/CreateVeterinaryModal';
import EditVeterinaryModal from '../components/EditVeterinaryModal';
import Navbar from '../components/Navbar';

const VeterinariesPage = () => {
  const { user } = useAuth();
  const [veterinaries, setVeterinaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVeterinary, setSelectedVeterinary] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterService, setFilterService] = useState('');
  const [viewMode, setViewMode] = useState('my'); // Solo 'my' - veterinarias propias

  // Servicios disponibles para filtro
  const availableServices = [
    'consultas_generales',
    'vacunacion',
    'cirugia',
    'radiografia',
    'laboratorio',
    'grooming',
    'emergencias',
    'especialidades',
    'farmacia',
    'hospitalizacion'
  ];

  // Cargar veterinarias
  const loadVeterinaries = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await veterinaryService.getUserVeterinaries();
      setVeterinaries(response.data.veterinaries || []);
    } catch (err) {
      console.error('Error cargando veterinarias:', err);
      setError('Error al cargar las veterinarias');
    } finally {
      setLoading(false);
    }
  };

  // Cargar veterinarias al montar el componente
  useEffect(() => {
    loadVeterinaries();
  }, []);

  // Crear nueva veterinaria
  const handleCreateVeterinary = async (veterinaryData) => {
    try {
      await veterinaryService.createVeterinary(veterinaryData);
      setShowCreateModal(false);
      loadVeterinaries();
    } catch (err) {
      console.error('Error creando veterinaria:', err);
      throw err;
    }
  };

  // Editar veterinaria
  const handleEditVeterinary = async (id, veterinaryData) => {
    try {
      await veterinaryService.updateVeterinary(id, veterinaryData);
      setShowEditModal(false);
      setSelectedVeterinary(null);
      loadVeterinaries();
    } catch (err) {
      console.error('Error actualizando veterinaria:', err);
      throw err;
    }
  };

  // Eliminar veterinaria
  const handleDeleteVeterinary = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta veterinaria?')) {
      return;
    }

    try {
      await veterinaryService.deleteVeterinary(id);
      loadVeterinaries();
    } catch (err) {
      console.error('Error eliminando veterinaria:', err);
      setError('Error al eliminar la veterinaria');
    }
  };

  // Abrir modal de edición
  const openEditModal = (veterinary) => {
    setSelectedVeterinary(veterinary);
    setShowEditModal(true);
  };

  // Formatear servicios
  const formatServices = (services) => {
    if (!services || services.length === 0) return 'Sin servicios';
    
    const serviceLabels = {
      consultas_generales: 'Consultas',
      vacunacion: 'Vacunación',
      cirugia: 'Cirugía',
      radiografia: 'Radiografía',
      laboratorio: 'Laboratorio',
      grooming: 'Grooming',
      emergencias: 'Emergencias',
      especialidades: 'Especialidades',
      farmacia: 'Farmacia',
      hospitalizacion: 'Hospitalización'
    };

    return services.map(service => serviceLabels[service] || service).join(', ');
  };

  // Formatear estado
  const getStatusBadge = (isActive, isVerified) => {
    if (!isActive) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Inactiva</span>;
    }
    if (isVerified) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Verificada</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pendiente</span>;
  };

  // Formatear rol del usuario
  const getUserRoleBadge = (userRole) => {
    const roleColors = {
      owner: 'bg-purple-100 text-purple-800',
      veterinario: 'bg-blue-100 text-blue-800',
      asistente: 'bg-green-100 text-green-800',
      recepcionista: 'bg-orange-100 text-orange-800'
    };

    const roleLabels = {
      owner: 'Propietario',
      veterinario: 'Veterinario',
      asistente: 'Asistente',
      recepcionista: 'Recepcionista'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[userRole] || 'bg-gray-100 text-gray-800'}`}>
        {roleLabels[userRole] || userRole}
      </span>
    );
  };

  if (loading && veterinaries.length === 0) {
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
              <h1 className="text-3xl font-bold text-gray-900">Mis Veterinarias</h1>
              <p className="mt-2 text-gray-600">
                Veterinarias donde eres propietario o trabajas como personal
              </p>
            </div>
            
            {/* Botones de acción */}
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              {/* Crear nueva veterinaria */}
              {user?.permissions?.includes('veterinaries.create') && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  variant="primary"
                  size="md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nueva Veterinaria
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <Input
              label="Buscar"
              placeholder="Nombre, dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Filtro por ciudad */}
            <Input
              label="Ciudad"
              placeholder="Filtrar por ciudad"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
            />

            {/* Botón limpiar filtros */}
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCity('');
                }}
                variant="outline"
                size="md"
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de veterinarias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {veterinaries.map((veterinary) => (
            <div key={veterinary._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Header de la tarjeta */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {veterinary.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {veterinary.address}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      {getStatusBadge(veterinary.isActive, veterinary.isVerified)}
                      {veterinary.userRole && getUserRoleBadge(veterinary.userRole)}
                    </div>
                  </div>
                </div>

                {/* Información de contacto */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {veterinary.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {veterinary.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {veterinary.city}, {veterinary.state}
                  </div>
                </div>

                {/* Servicios */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Servicios:</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {formatServices(veterinary.services)}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                                         <Button
                       onClick={() => openEditModal(veterinary)}
                       variant="outline"
                       size="sm"
                       disabled={!user?.permissions?.includes('veterinaries.update')}
                     >
                       Editar
                     </Button>
                     <Button
                       onClick={() => handleDeleteVeterinary(veterinary._id)}
                       variant="danger"
                       size="sm"
                       disabled={!user?.permissions?.includes('veterinaries.delete')}
                     >
                       Eliminar
                     </Button>
                  </div>
                  
                  <Button
                    variant="primary"
                    size="sm"
                  >
                    Ver Detalles
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

                {/* Estado vacío */}
        {!loading && veterinaries.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes veterinarias registradas</h3>
            <p className="mt-1 text-sm text-gray-500">
              No eres propietario ni trabajas en ninguna veterinaria actualmente.
            </p>
            {user?.permissions?.includes('veterinaries.create') && (
              <div className="mt-6">
                <Button
                  onClick={() => setShowCreateModal(true)}
                  variant="primary"
                >
                  Crear mi primera veterinaria
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de crear veterinaria */}
      {showCreateModal && (
        <CreateVeterinaryModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateVeterinary}
        />
      )}

      {/* Modal de editar veterinaria */}
      {showEditModal && selectedVeterinary && (
        <EditVeterinaryModal
          veterinary={selectedVeterinary}
          onClose={() => {
            setShowEditModal(false);
            setSelectedVeterinary(null);
          }}
          onSubmit={handleEditVeterinary}
        />
      )}
    </div>
  );
};

export default VeterinariesPage; 