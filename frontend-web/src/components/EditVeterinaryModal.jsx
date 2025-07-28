import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import ErrorModal from './ui/ErrorModal';
import cloudinaryService from '../services/cloudinaryService';
import locationService from '../services/locationService';

const EditVeterinaryModal = ({ veterinary, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    description: '',
    website: '',
    services: [],
    specialties: [],
    emergencyPhone: '',
    emergencyAvailable: false,
    zipCode: '',
    country: 'México',
    isActive: true,
    isVerified: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [operationStep, setOperationStep] = useState('');
  const [states, setStates] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);

  // Servicios disponibles
  const availableServices = [
    { value: 'consultas_generales', label: 'Consultas Generales' },
    { value: 'vacunacion', label: 'Vacunación' },
    { value: 'cirugia', label: 'Cirugía' },
    { value: 'radiografia', label: 'Radiografía' },
    { value: 'laboratorio', label: 'Laboratorio' },
    { value: 'grooming', label: 'Grooming' },
    { value: 'emergencias', label: 'Emergencias' },
    { value: 'especialidades', label: 'Especialidades' },
    { value: 'farmacia', label: 'Farmacia' },
    { value: 'hospitalizacion', label: 'Hospitalización' }
  ];

  // Especialidades disponibles
  const availableSpecialties = [
    'Cardiología',
    'Dermatología',
    'Ortopedia',
    'Oftalmología',
    'Neurología',
    'Oncología',
    'Odontología',
    'Radiología',
    'Anestesiología',
    'Medicina Interna',
    'Cirugía General',
    'Medicina de Emergencias'
  ];

  // Cargar datos de la veterinaria al montar el componente
  useEffect(() => {
    if (veterinary) {
      setFormData({
        name: veterinary.name || '',
        address: veterinary.address || '',
        phone: veterinary.phone || '',
        email: veterinary.email || '',
        city: veterinary.city || '',
        state: veterinary.state || '',
        description: veterinary.description || '',
        website: veterinary.website || '',
        services: veterinary.services || [],
        specialties: veterinary.specialties || [],
        emergencyPhone: veterinary.emergencyPhone || '',
        emergencyAvailable: veterinary.emergencyAvailable || false,
        zipCode: veterinary.zipCode || '',
        country: veterinary.country || 'México',
        isActive: veterinary.isActive !== undefined ? veterinary.isActive : true,
        isVerified: veterinary.isVerified || false,
        image: veterinary.logo?.url || '',
        imagePublicId: veterinary.logo?.publicId || ''
      });

      // Cargar municipios si ya hay un estado seleccionado
      if (veterinary.state) {
        loadMunicipalities(veterinary.state);
      }
    }
  }, [veterinary]);

  // Cargar estados al montar el componente
  useEffect(() => {
    loadStates();
  }, []);

  // Validar campo individual
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) {
          return 'El nombre es requerido';
        }
        break;
      
      case 'address':
        if (!value.trim()) {
          return 'La dirección es requerida';
        }
        break;
      
      case 'phone':
        if (!value.trim()) {
          return 'El teléfono es requerido';
        }
        break;
      
      case 'email':
        if (!value.trim()) {
          return 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(value.trim())) {
          return 'El email no es válido';
        }
        break;
      
      case 'city':
        if (!value.trim()) {
          return 'La ciudad es requerida';
        }
        break;
      
      case 'state':
        if (!value.trim()) {
          return 'El estado es requerido';
        }
        break;
      
      case 'website':
        if (value && !/^https?:\/\/.+/.test(value.trim())) {
          return 'URL inválida';
        }
        break;
      
      case 'emergencyPhone':
        if (value && !/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(value.trim())) {
          return 'Formato de teléfono de emergencia inválido';
        }
        break;
      
      case 'description':
        if (value && value.trim().length > 500) {
          return 'La descripción no puede exceder 500 caracteres';
        }
        break;
      
      case 'zipCode':
        if (value && value.trim().length > 10) {
          return 'El código postal no puede exceder 10 caracteres';
        }
        break;
      
      case 'country':
        if (value && value.trim().length > 50) {
          return 'El país no puede exceder 50 caracteres';
        }
        break;
      
      case 'services':
        if (!value || value.length === 0) {
          return 'Debe seleccionar al menos un servicio';
        }
        break;
      
      default:
        return null;
    }
    return null;
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Validar campo en tiempo real
    const fieldError = validateField(name, fieldValue);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  // Manejar cambios en servicios
  const handleServiceChange = (serviceValue) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceValue)
        ? prev.services.filter(s => s !== serviceValue)
        : [...prev.services, serviceValue]
    }));
  };

  // Manejar cambios en especialidades
  const handleSpecialtyChange = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  // Manejar selección de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar archivo
    const validation = cloudinaryService.validateImageFile(file);
    if (!validation.valid) {
      setErrors(prev => ({
        ...prev,
        image: validation.error
      }));
      return;
    }

    setImageFile(file);
    setErrors(prev => ({ ...prev, image: null }));

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Eliminar imagen seleccionada
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setErrors(prev => ({ ...prev, image: null }));
  };

  // Cargar estados
  const loadStates = async () => {
    try {
      setLoadingStates(true);
      const response = await locationService.getStates();
      setStates(response.data || []);
    } catch (error) {
      console.error('Error cargando estados:', error);
    } finally {
      setLoadingStates(false);
    }
  };

  // Cargar municipios por estado
  const loadMunicipalities = async (stateName) => {
    if (!stateName) {
      setMunicipalities([]);
      return;
    }

    try {
      setLoadingMunicipalities(true);
      const response = await locationService.getMunicipalitiesByState(stateName);
      setMunicipalities(response.data || []);
    } catch (error) {
      console.error('Error cargando municipios:', error);
      setMunicipalities([]);
    } finally {
      setLoadingMunicipalities(false);
    }
  };

  // Manejar cambio de estado
  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setFormData(prev => ({
      ...prev,
      state: selectedState,
      city: '' // Limpiar ciudad cuando cambia el estado
    }));
    
    // Cargar municipios del estado seleccionado
    loadMunicipalities(selectedState);
  };

  // Limpiar estado al cerrar modal
  const handleClose = () => {
    setImageFile(null);
    setImagePreview(null);
    setOperationStep('');
    setErrors({});
    setMunicipalities([]);
    onClose();
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'El estado es requerido';
    }

    // Validación del sitio web (opcional)
    if (formData.website && !/^https?:\/\/.+/.test(formData.website.trim())) {
      newErrors.website = 'URL inválida';
    }

    // Validación del teléfono de emergencias (opcional)
    if (formData.emergencyPhone && !/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(formData.emergencyPhone.trim())) {
      newErrors.emergencyPhone = 'Formato de teléfono de emergencia inválido';
    }

    // Validación de la descripción (opcional)
    if (formData.description && formData.description.trim().length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres';
    }

    // Validación del código postal (opcional)
    if (formData.zipCode && formData.zipCode.trim().length > 10) {
      newErrors.zipCode = 'El código postal no puede exceder 10 caracteres';
    }

    // Validación del país (opcional)
    if (formData.country && formData.country.trim().length > 50) {
      newErrors.country = 'El país no puede exceder 50 caracteres';
    }

    // Validación de servicios
    if (!formData.services || formData.services.length === 0) {
      newErrors.services = 'Debe seleccionar al menos un servicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setBackendError(null);

    try {
      let updatedData = { ...formData };
      let oldImagePublicId = null;

      // Guardar el publicId de la imagen anterior si existe
      if (formData.imagePublicId) {
        oldImagePublicId = formData.imagePublicId;
      }

      // Si hay una nueva imagen, subirla primero
      if (imageFile) {
        setImageLoading(true);
        setOperationStep('Subiendo nueva imagen...');
        try {
          const uploadResult = await cloudinaryService.uploadVeterinaryImage(imageFile);
          updatedData.logo = {
            url: uploadResult.url,
            publicId: uploadResult.publicId,
            width: uploadResult.width,
            height: uploadResult.height
          };
        } catch (uploadError) {
          console.error('Error subiendo imagen:', uploadError);
          setBackendError({ message: 'Error al subir la imagen: ' + uploadError.message });
          setShowErrorModal(true);
          setImageLoading(false);
          setLoading(false);
          setOperationStep('');
          return;
        } finally {
          setImageLoading(false);
        }
      }

      // Actualizar la veterinaria con los nuevos datos
      setOperationStep('Actualizando datos de la veterinaria...');
      await onSubmit(veterinary._id, updatedData);

      // Si se subió una nueva imagen y había una anterior, eliminar la anterior
      if (imageFile && oldImagePublicId) {
        setOperationStep('Eliminando imagen anterior...');
        try {
          await cloudinaryService.deleteImage(oldImagePublicId);
          console.log('Imagen anterior eliminada exitosamente');
        } catch (deleteError) {
          console.error('Error eliminando imagen anterior:', deleteError);
          // No mostrar error al usuario ya que la actualización fue exitosa
        }
      }
    } catch (error) {
      console.error('Error actualizando veterinaria:', error);
      
      // Manejar errores del backend
      if (error.response?.data) {
        setBackendError(error.response.data);
        setShowErrorModal(true);
      } else if (error.message) {
        setBackendError({ message: error.message });
        setShowErrorModal(true);
      } else {
        setBackendError({ message: 'Error inesperado al actualizar la veterinaria' });
        setShowErrorModal(true);
      }
    } finally {
      setLoading(false);
      setOperationStep('');
    }
  };

  if (!veterinary) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Header mejorado */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Editar Veterinaria</h2>
              <p className="text-sm text-gray-600">{veterinary.name}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Información básica */}
            <div className="space-y-4 md:col-span-1 lg:col-span-1">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
              </div>

              <Input
                label="Nombre de la Veterinaria *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Ej: Veterinaria Central"
              />

              <Input
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descripción de la veterinaria"
                as="textarea"
                rows={3}
              />

              <Input
                label="Sitio Web"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                error={errors.website}
                placeholder="https://www.veterinaria.com"
              />

              
            </div>

            {/* Imagen de la veterinaria */}
            <div className="space-y-4 md:col-span-1 lg:col-span-1">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Imagen de la Veterinaria</h3>
              </div>

              {/* Imagen actual */}
              {(formData.image || imagePreview) && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Imagen Actual
                  </label>
                  <div className="relative inline-block">
                    <img
                      src={imagePreview || formData.image}
                      alt="Imagen de la veterinaria"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        console.error('Error cargando imagen:', e.target.src);
                        e.target.style.display = 'none';
                      }}
                    />
                    {imageLoading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <div className="text-white text-sm">{operationStep || 'Subiendo...'}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Subir nueva imagen */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  {formData.image ? 'Cambiar Imagen' : 'Subir Imagen'}
                </label>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    id="veterinary-image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={imageLoading}
                  />
                  <label
                    htmlFor="veterinary-image"
                    className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer ${
                      imageLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {imageLoading ? 'Subiendo...' : 'Seleccionar Imagen'}
                  </label>
                  
                  {imageFile && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      disabled={imageLoading}
                    >
                      Cancelar
                    </button>
                  )}
                </div>

                {errors.image && (
                  <p className="text-sm text-red-600">{errors.image}</p>
                )}

                <p className="text-xs text-gray-500">
                  Formatos permitidos: JPG, PNG, GIF, WebP. Tamaño máximo: 5MB
                </p>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="space-y-4 md:col-span-1 lg:col-span-1">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Información de Contacto</h3>
              </div>
                
              <Input
                label="Teléfono *"
                name="phone"
                type="number"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="(555) 123-4567"
              />

              <Input
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="contacto@veterinaria.com"
              />

              <Input
                label="Teléfono de Emergencias"
                name="emergencyPhone"
                type="number"
                value={formData.emergencyPhone}
                onChange={handleChange}
                error={errors.emergencyPhone}
                placeholder="(555) 999-8888"
              />

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emergencyAvailable"
                  name="emergencyAvailable"
                  checked={formData.emergencyAvailable}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="emergencyAvailable" className="ml-2 block text-sm text-gray-900">
                  Disponible para emergencias 24/7
                </label>
              </div>
            </div>

            {/* Dirección */}
            <div className="space-y-4 md:col-span-3 lg:col-span-3">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Dirección</h3>
              </div>

              <div className="grid grid-cols-3 gap-6">  
              <Input
                label="Dirección *"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={errors.address}
                placeholder="Calle Principal #123, Colonia"
              />

              {/* Estado */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Estado/Provincia *
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleStateChange}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.state ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  disabled={loadingStates}
                >
                  <option value="">Seleccionar estado</option>
                  {states.map(state => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {loadingStates && (
                  <p className="text-sm text-gray-500">Cargando estados...</p>
                )}
                {errors.state && (
                  <p className="text-sm text-red-600">{errors.state}</p>
                )}
              </div>

              {/* Ciudad/Municipio */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Ciudad/Municipio *
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  disabled={loadingMunicipalities || !formData.state}
                >
                  <option value="">
                    {!formData.state ? 'Primero selecciona un estado' : 'Seleccionar ciudad'}
                  </option>
                  {municipalities.map(municipality => (
                    <option key={municipality} value={municipality}>
                      {municipality}
                    </option>
                  ))}
                </select>
                {loadingMunicipalities && (
                  <p className="text-sm text-gray-500">Cargando municipios...</p>
                )}
                {errors.city && (
                  <p className="text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              <Input
                label="Código Postal"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="12345"
              />

              <Input
                label="País"
                name="country"
                value={formData.country}
                onChange={handleChange}
                  placeholder="México"
                />
              </div>
            </div>

            {/* Servicios y Especialidades */}
            <div className="space-y-4 md:col-span-3 lg:col-span-3">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-lg">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Servicios y Especialidades</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Servicios */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servicios Ofrecidos
                  </label>
                  <div className="grid grid-cols-1 gap-3 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                    {availableServices.map(service => (
                      <label key={service.value} className="flex items-center p-2 rounded-md hover:bg-white transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.services.includes(service.value)}
                          onChange={() => handleServiceChange(service.value)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">{service.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.services && (
                    <p className="text-sm text-red-600 mt-1">{errors.services}</p>
                  )}
                </div>

                {/* Especialidades */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Especialidades
                  </label>
                  <div className="grid grid-cols-1 gap-3 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                    {availableSpecialties.map(specialty => (
                      <label key={specialty} className="flex items-center p-2 rounded-md hover:bg-white transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.specialties.includes(specialty)}
                          onChange={() => handleSpecialtyChange(specialty)}
                          className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

         

          {/* Botones */}
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 bg-gray-50 p-4 rounded-lg">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Cancelar</span>
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{operationStep || 'Guardando...'}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Guardar Cambios</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
      
      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        error={backendError}
        title="Error al actualizar veterinaria"
      />
    </div>
  );
};

export default EditVeterinaryModal; 