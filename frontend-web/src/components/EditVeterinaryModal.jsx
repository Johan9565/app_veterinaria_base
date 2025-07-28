import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import ErrorModal from './ui/ErrorModal';
import cloudinaryService from '../services/cloudinaryService';

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
    }
  }, [veterinary]);

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

  // Limpiar estado al cerrar modal
  const handleClose = () => {
    setImageFile(null);
    setImagePreview(null);
    setOperationStep('');
    setErrors({});
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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Editar Veterinaria</h2>
            <p className="text-sm text-gray-600 mt-1">{veterinary.name}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Información Básica
              </h3>

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

              {/* Estado de la veterinaria */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Estado de la Veterinaria</h4>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Veterinaria activa
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isVerified"
                    name="isVerified"
                    checked={formData.isVerified}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isVerified" className="ml-2 block text-sm text-gray-900">
                    Veterinaria verificada
                  </label>
                </div>
              </div>
            </div>

            {/* Imagen de la veterinaria */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Imagen de la Veterinaria
              </h3>

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
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Información de Contacto
              </h3>

              <Input
                label="Teléfono *"
                name="phone"
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
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Dirección
              </h3>

              <Input
                label="Dirección *"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={errors.address}
                placeholder="Calle Principal #123, Colonia"
              />

              <Input
                label="Ciudad *"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
                placeholder="Ciudad de México"
              />

              <Input
                label="Estado/Provincia *"
                name="state"
                value={formData.state}
                onChange={handleChange}
                error={errors.state}
                placeholder="CDMX"
              />

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

            {/* Servicios y Especialidades */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Servicios y Especialidades
              </h3>

              {/* Servicios */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servicios Ofrecidos
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {availableServices.map(service => (
                    <label key={service.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service.value)}
                        onChange={() => handleServiceChange(service.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{service.label}</span>
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
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {availableSpecialties.map(specialty => (
                    <label key={specialty} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(specialty)}
                        onChange={() => handleSpecialtyChange(specialty)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Información del Sistema</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">ID:</span> {veterinary._id}
              </div>
              <div>
                <span className="font-medium">Creada:</span> {new Date(veterinary.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Última actualización:</span> {new Date(veterinary.updatedAt).toLocaleDateString()}
              </div>
              {veterinary.userRole && (
                <div>
                  <span className="font-medium">Tu rol:</span> {veterinary.userRole}
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              {loading ? (operationStep || 'Guardando...') : 'Guardar Cambios'}
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