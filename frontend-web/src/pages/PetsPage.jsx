import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import petService from '../services/petService';
import veterinaryService from '../services/veterinaryService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select2 from '../components/ui/Select2';
import CreatePetModal from '../components/CreatePetModal';
import EditPetModal from '../components/EditPetModal';
import PetDetailModal from '../components/PetDetailModal';
import Navbar from '../components/Navbar';
import AlertService from '../services/alertService';

const PetsPage = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [veterinaries, setVeterinaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('');
  const [filterVeterinary, setFilterVeterinary] = useState('');
  const [filterHealthStatus, setFilterHealthStatus] = useState('');
  const [viewMode, setViewMode] = useState(user?.role === 'cliente' ? 'my' : 'all'); // 'my', 'all', 'veterinary'
  const [uploadingImage, setUploadingImage] = useState(null);

  // Especies disponibles para filtro
  const speciesOptions = [
    { value: 'perro', label: 'Perro' },
    { value: 'gato', label: 'Gato' },
    { value: 'ave', label: 'Ave' },
    { value: 'reptil', label: 'Reptil' },
    { value: 'roedor', label: 'Roedor' },
    { value: 'conejo', label: 'Conejo' },
    { value: 'caballo', label: 'Caballo' },
    { value: 'otro', label: 'Otro' }
  ];

  // Estados de salud para filtro
  const healthStatusOptions = [
    { value: 'excelente', label: 'Excelente' },
    { value: 'bueno', label: 'Bueno' },
    { value: 'regular', label: 'Regular' },
    { value: 'malo', label: 'Malo' },
    { value: 'crítico', label: 'Crítico' }
  ];

  // Cargar mascotas según el modo de vista
  const loadPets = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      const params = {
        search: searchTerm,
        species: filterSpecies,
        veterinary: filterVeterinary,
        healthStatus: filterHealthStatus
      };
      
      switch (viewMode) {
        case 'my':
          response = await petService.getUserPets();
          break;
        case 'all':
          response = await petService.getAllPets(params);
          break;
        default:
          response = await petService.getUserPets();
      }

      setPets(response.data.pets || []);
    } catch (err) {
      console.error('Error cargando mascotas:', err);
      setError('Error al cargar las mascotas');
    } finally {
      setLoading(false);
    }
  };

  // Cargar veterinarias para filtro
  const loadVeterinaries = async () => {
    try {
      const response = await veterinaryService.getUserVeterinaries();
      const vetOptions = response.data.veterinaries.map(vet => ({
        value: vet._id,
        label: vet.name
      }));
      setVeterinaries(vetOptions);
    } catch (err) {
      console.error('Error cargando veterinarias:', err);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadPets();
    loadVeterinaries();
  }, [viewMode, searchTerm, filterSpecies, filterVeterinary, filterHealthStatus]);

  // Crear nueva mascota
  const handleCreatePet = async (petData) => {
    try {
      const result = await petService.createPet(petData);
      return result;
    } catch (err) {
      console.error('Error creando mascota:', err);
      throw err;
    }
  };

  // Manejar cierre del modal de creación
  const handleCreateModalClose = () => {
    setShowCreateModal(false);
    loadPets();
  };

  // Editar mascota
  const handleEditPet = async (id, petData) => {
    try {
      await petService.updatePet(id, petData);
      setShowEditModal(false);
      setSelectedPet(null);
      loadPets();
    } catch (err) {
      console.error('Error actualizando mascota:', err);
      throw err;
    }
  };

  // Eliminar mascota
  const handleDeletePet = async (id) => {
    const confirmed = await AlertService.confirmDelete('esta mascota');
    if (!confirmed) {
      return;
    }

    try {
      await petService.deletePet(id);
      AlertService.success('Mascota eliminada', 'La mascota ha sido eliminada exitosamente');
      loadPets();
    } catch (err) {
      console.error('Error eliminando mascota:', err);
      AlertService.error('Error al eliminar', 'No se pudo eliminar la mascota');
    }
  };

  // Abrir modal de edición
  const openEditModal = (pet) => {
    setSelectedPet(pet);
    setShowEditModal(true);
  };

  // Abrir modal de detalles
  const openDetailModal = (pet) => {
    setSelectedPet(pet);
    setShowDetailModal(true);
  };

  // Manejar subida de imagen
  const handleImageUpload = async (petId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        setUploadingImage(petId);
        
        // Llamada al servicio de subida de imagen
        await petService.uploadPetImage(petId, file);
        
        AlertService.success('Imagen subida', 'La imagen se ha subido exitosamente');
        loadPets(); // Recargar para mostrar la nueva imagen
      } catch (err) {
        console.error('Error subiendo imagen:', err);
        const errorMessage = err.response?.data?.message || 'No se pudo subir la imagen';
        AlertService.error('Error al subir', errorMessage);
      } finally {
        setUploadingImage(null);
      }
    };
    input.click();
  };

  // Manejar eliminación de imagen
  const handleDeleteImage = async (petId) => {
    const confirmed = await AlertService.confirmDelete('la imagen de esta mascota');
    if (!confirmed) {
      return;
    }

    try {
      setUploadingImage(petId);
      
      // Llamada al servicio de eliminación de imagen
      await petService.deletePetImage(petId);
      
      AlertService.success('Imagen eliminada', 'La imagen se ha eliminado exitosamente');
      loadPets(); // Recargar para mostrar el estado actualizado
    } catch (err) {
      console.error('Error eliminando imagen:', err);
      const errorMessage = err.response?.data?.message || 'No se pudo eliminar la imagen';
      AlertService.error('Error al eliminar', errorMessage);
    } finally {
      setUploadingImage(null);
    }
  };

  // Formatear especie
  const formatSpecies = (species) => {
    const speciesMap = {
      'perro': 'Perro',
      'gato': 'Gato',
      'ave': 'Ave',
      'reptil': 'Reptil',
      'roedor': 'Roedor',
      'conejo': 'Conejo',
      'caballo': 'Caballo',
      'otro': 'Otro'
    };
    return speciesMap[species] || species;
  };

  // Formatear estado de salud
  const getHealthStatusBadge = (status) => {
    const statusConfig = {
      'excelente': {
        label: 'Excelente',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        dotColor: 'bg-green-500'
      },
      'bueno': {
        label: 'Bueno',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        dotColor: 'bg-blue-500'
      },
      'regular': {
        label: 'Regular',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200',
        dotColor: 'bg-yellow-500'
      },
      'malo': {
        label: 'Malo',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-200',
        dotColor: 'bg-orange-500'
      },
      'crítico': {
        label: 'Crítico',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        dotColor: 'bg-red-500'
      }
    };

    const config = statusConfig[status] || statusConfig['bueno'];

    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
        <div className={`w-2 h-2 rounded-full mr-2 ${config.dotColor}`}></div>
        {config.label}
      </span>
    );
  };

  // Calcular edad
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    if (age === 0) {
      const months = Math.floor((today - birth) / (1000 * 60 * 60 * 24 * 30));
      return `${months} mes${months !== 1 ? 'es' : ''}`;
    }
    
    return `${age} año${age !== 1 ? 's' : ''}`;
  };

  if (loading && pets.length === 0) {
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
              <h1 className="text-3xl font-bold text-gray-900">Mascotas</h1>
              <p className="mt-2 text-gray-600">
                Gestiona las mascotas registradas en el sistema
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
                  Mis Mascotas
                </button>
                )}
                {user?.role !== 'cliente' && user?.permissions?.includes('pets.view') && (
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
              </div>

              {/* Crear nueva mascota */}
              {user?.permissions?.includes('pets.create') && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  variant="primary"
                  size="md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nueva Mascota
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros */}
        {viewMode === 'all' && (
        <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Búsqueda */}
            <Input
              label="Buscar"
              placeholder="Nombre, raza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Filtro por especie */}
            
            <Select2
              label="Especie"
              options={[{ value: '', label: 'Todas las especies' }, ...speciesOptions]}
              value={filterSpecies}
              onChange={setFilterSpecies}
              placeholder="Seleccionar especie"
            />

            {/* Filtro por veterinaria */}
            <Select2
              label="Veterinaria"
              options={[{ value: '', label: 'Todas las veterinarias' }, ...veterinaries]}
              value={filterVeterinary}
              onChange={setFilterVeterinary}
              placeholder="Seleccionar veterinaria"
            />

            {/* Filtro por estado de salud */}
            <Select2
              label="Estado de Salud"
              options={[{ value: '', label: 'Todos los estados' }, ...healthStatusOptions]}
              value={filterHealthStatus}
              onChange={setFilterHealthStatus}
              placeholder="Seleccionar estado"
            />

            {/* Botón limpiar filtros */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                &nbsp;
              </label>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setFilterSpecies('');
                  setFilterVeterinary('');
                  setFilterHealthStatus('');
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
        )}
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

        {/* Lista de mascotas */}
        {viewMode === 'my' ? (
          // Vista detallada para "Mis Mascotas"
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <div key={pet._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                 {/* Header con área de imagen */}
                 <div className="relative h-48 bg-gradient-to-br from-[#A8E6CF] to-[#81D4FA]">
                   <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                   <div className="absolute top-3 right-3 flex items-center gap-2">
                     {getHealthStatusBadge(pet.healthStatus)}
                     {pet.isNeutered && (
                       <span className="px-2 py-1 text-xs font-semibold bg-white bg-opacity-20 text-white rounded-full backdrop-blur-sm">
                         Esterilizado
                       </span>
                     )}
                   </div>
                   
                   {/* Área de imagen */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {pet.photo?.url ? (
                        <img 
                          src={pet.photo.url} 
                          alt={pet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm mx-auto mb-3 border-2 border-dashed border-white border-opacity-50">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <p className="text-white text-base font-medium">Agregar imagen</p>
                        </div>
                      )}
                    </div>
                   
                   {/* Botones de imagen */}
                   <div className="absolute bottom-3 left-3 flex gap-2">
                     {pet.photo?.url ? (
                       <>
                         <Button
                           onClick={() => handleImageUpload(pet._id)}
                           variant="outline"
                           size="sm"
                           disabled={uploadingImage === pet._id}
                           className="bg-white bg-opacity-90 hover:bg-white text-[#4CAF50] border-white"
                         >
                           {uploadingImage === pet._id ? (
                             <>
                               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4CAF50] mr-1"></div>
                               Subiendo...
                             </>
                           ) : (
                             <>
                               <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                               </svg>
                               Cambiar
                             </>
                           )}
                         </Button>
                         <Button
                           onClick={() => handleDeleteImage(pet._id)}
                           variant="danger"
                           size="sm"
                           disabled={uploadingImage === pet._id}
                           className="bg-red-500 bg-opacity-90 hover:bg-red-600 text-white border-red-500"
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                           </svg>
                         </Button>
                       </>
                     ) : (
                       <Button
                         onClick={() => handleImageUpload(pet._id)}
                         variant="outline"
                         size="sm"
                         disabled={uploadingImage === pet._id}
                         className="bg-white bg-opacity-90 hover:bg-white text-[#4CAF50] border-white"
                       >
                         {uploadingImage === pet._id ? (
                           <>
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4CAF50] mr-1"></div>
                             Subiendo...
                           </>
                         ) : (
                           <>
                             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                             </svg>
                             Subir
                           </>
                         )}
                       </Button>
                     )}
                   </div>
                 </div>

                {/* Contenido principal */}
                <div className="p-4">
                  {/* Nombre y especie */}
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                      {pet.name}
                    </h3>
                    <p className="text-xs text-gray-600 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {formatSpecies(pet.species)} • {pet.gender === 'macho' ? 'Macho' : 'Hembra'}
                    </p>
                  </div>

                  {/* Información básica */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-gray-700">
                      <div className="w-6 h-6 bg-purple-50 rounded flex items-center justify-center mr-2">
                        <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="font-medium">{calculateAge(pet.birthDate)}</span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-700">
                      <div className="w-6 h-6 bg-green-50 rounded flex items-center justify-center mr-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                      </div>
                      <span className="font-medium">{pet.weight.value} {pet.weight.unit}</span>
                    </div>
                    
                    {pet.breed && (
                      <div className="flex items-center text-xs text-gray-700">
                        <div className="w-6 h-6 bg-blue-50 rounded flex items-center justify-center mr-2">
                          <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <span className="font-medium">{pet.breed}</span>
                      </div>
                    )}
                  </div>


                  {/* Acciones */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <Button
                      onClick={() => openDetailModal(pet)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver
                    </Button>
                   
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Vista de tabla para "Todas las mascotas"
          <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E2E8F0]">
                <thead className="bg-[#F5F5F5]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Raza
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Género
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Propietario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E2E8F0]">
                  {pets.map((pet) => (
                    <tr key={pet._id} className="hover:bg-[#F5F5F5] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-[#A8E6CF] rounded-full flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{pet.name}</div>
                            <div className="text-sm text-gray-500">{formatSpecies(pet.species)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pet.breed || 'No especificada'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          pet.gender === 'macho' 
                            ? 'bg-[#A3E0FF] text-[#81D4FA]' 
                            : 'bg-[#C8F0D8] text-[#4CAF50]'
                        }`}>
                          {pet.gender === 'macho' ? 'Macho' : 'Hembra'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{pet.owner?.name || 'Sin propietario'}</div>
                        <div className="text-sm text-gray-500">{pet.owner?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => openDetailModal(pet)}
                            variant="outline"
                            size="sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Button>
                          <Button
                            onClick={() => openEditModal(pet)}
                            variant="outline"
                            size="sm"
                            disabled={!user?.permissions?.includes('pets.edit')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                          <Button
                            onClick={() => handleDeletePet(pet._id)}
                            variant="danger"
                            size="sm"
                            disabled={!user?.permissions?.includes('pets.delete')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {!loading && pets.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {viewMode === 'my' ? 'No hay mascotas registradas' : 'No se encontraron mascotas'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {viewMode === 'my' 
                ? 'No tienes mascotas registradas en el sistema.'
                : 'No se encontraron mascotas con los filtros aplicados.'
              }
            </p>
            {user?.permissions?.includes('pets.create') && viewMode === 'my' && (
              <div className="mt-6">
                <Button
                  onClick={() => setShowCreateModal(true)}
                  variant="primary"
                >
                  Registrar mi primera mascota
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de crear mascota */}
      {showCreateModal && (
        <CreatePetModal
          onClose={handleCreateModalClose}
          onSubmit={handleCreatePet}
        />
      )}

      {/* Modal de editar mascota */}
      {showEditModal && selectedPet && (
        <EditPetModal
          pet={selectedPet}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPet(null);
          }}
          onSubmit={handleEditPet}
        />
      )}

      {/* Modal de detalles de mascota */}
      {showDetailModal && selectedPet && (
        <PetDetailModal
          pet={selectedPet}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedPet(null);
          }}
          onUpdate={() => {
            loadPets();
          }}
        />
      )}
    </div>
  );
};

export default PetsPage; 