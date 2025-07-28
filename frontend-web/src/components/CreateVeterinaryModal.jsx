import React, { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import ErrorModal from './ui/ErrorModal';
import cloudinaryService from '../services/cloudinaryService';
import veterinaryService from '../services/veterinaryService';

const CreateVeterinaryModal = ({ onClose, onSubmit }) => {
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
    logo: null,
    hours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '14:00', closed: false },
      sunday: { open: '10:00', close: '14:00', closed: true }
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [backendError, setBackendError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

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

  // Días de la semana
  const weekDays = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  // Validar campo individual
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) {
          return 'El nombre de la veterinaria es requerido';
        } else if (value.trim().length < 2) {
          return 'El nombre debe tener al menos 2 caracteres';
        } else if (value.trim().length > 100) {
          return 'El nombre no puede exceder 100 caracteres';
        }
        break;
      
      case 'address':
        if (!value.trim()) {
          return 'La dirección es requerida';
        } else if (value.trim().length < 10) {
          return 'La dirección debe tener al menos 10 caracteres';
        } else if (value.trim().length > 200) {
          return 'La dirección no puede exceder 200 caracteres';
        }
        break;
      
      case 'phone':
        if (!value.trim()) {
          return 'El teléfono es requerido';
        } else if (!/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(value.trim())) {
          return 'Formato de teléfono inválido';
        }
        break;
      
      case 'email':
        if (!value.trim()) {
          return 'El correo electrónico es requerido';
        } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value.trim())) {
          return 'Email inválido';
        }
        break;
      
      case 'city':
        if (!value.trim()) {
          return 'La ciudad es requerida';
        }
        break;
      
      case 'state':
        if (!value.trim()) {
          return 'El estado/provincia es requerido';
        }
        break;
      
      case 'services':
        if (!value || value.length === 0) {
          return 'Debe seleccionar al menos un servicio';
        }
        break;
      
      case 'description':
        if (value && value.trim().length > 500) {
          return 'La descripción no puede exceder 500 caracteres';
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
      
      case 'facebook':
      case 'instagram':
      case 'twitter':
        if (value && !/^https?:\/\/.+/.test(value.trim())) {
          return 'URL inválida';
        }
        break;
      
      case 'hours_open':
      case 'hours_close':
        // Validación de horarios se maneja en validateForm
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

  // Manejar cambios en redes sociales
  const handleSocialMediaChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));

    // Validar campo en tiempo real
    const fieldError = validateField(platform, value);
    setErrors(prev => ({
      ...prev,
      [platform]: fieldError
    }));
  };

  // Manejar cambios en horarios
  const handleHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          [field]: field === 'closed' ? value : value
        }
      }
    }));
  };

  // Manejar subida de logo
  const handleLogoUpload = async (file) => {
    if (!file) return;

    // Validar archivo usando el servicio
    const validation = cloudinaryService.validateImageFile(file);
    if (!validation.valid) {
      setErrors(prev => ({ ...prev, logo: validation.error }));
      return;
    }

    setUploadingLogo(true);
    setErrors(prev => ({ ...prev, logo: null }));

    try {
      // Crear preview inmediato
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Guardar el archivo para subirlo después de crear la veterinaria
      setFormData(prev => ({
        ...prev,
        logo: {
          file: file, // Guardar el archivo temporalmente
          url: null,
          publicId: null,
          width: null,
          height: null
        }
      }));

    } catch (error) {
      console.error('Error procesando logo:', error);
      setErrors(prev => ({ ...prev, logo: error.message || 'Error al procesar la imagen. Intente nuevamente.' }));
      // Limpiar preview si hay error
      setLogoPreview(null);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Manejar cambio de archivo de logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  // Eliminar logo
  const removeLogo = async () => {
    // No necesitamos eliminar de Cloudinary ya que la imagen no se sube hasta después de crear la veterinaria
    setFormData(prev => ({ ...prev, logo: null }));
    setLogoPreview(null);
    setErrors(prev => ({ ...prev, logo: null }));
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Validación del nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la veterinaria es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres';
    }

    // Validación de la dirección
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'La dirección debe tener al menos 10 caracteres';
    } else if (formData.address.trim().length > 200) {
      newErrors.address = 'La dirección no puede exceder 200 caracteres';
    }

    // Validación del teléfono
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Formato de teléfono inválido';
    }

    // Validación del email
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email.trim())) {
      newErrors.email = 'Email inválido';
    }

    // Validación de la ciudad
    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }

    // Validación del estado
    if (!formData.state.trim()) {
      newErrors.state = 'El estado/provincia es requerido';
    }

    // Validación de servicios
    if (!formData.services || formData.services.length === 0) {
      newErrors.services = 'Debe seleccionar al menos un servicio';
    }

    // Validación de la descripción
    if (formData.description && formData.description.trim().length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres';
    }

    // Validación del sitio web
    if (formData.website && !/^https?:\/\/.+/.test(formData.website.trim())) {
      newErrors.website = 'URL inválida';
    }

    // Validación del teléfono de emergencias
    if (formData.emergencyPhone && !/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(formData.emergencyPhone.trim())) {
      newErrors.emergencyPhone = 'Formato de teléfono de emergencia inválido';
    }

    // Validación del código postal
    if (formData.zipCode && formData.zipCode.trim().length > 10) {
      newErrors.zipCode = 'El código postal no puede exceder 10 caracteres';
    }

    // Validación del país
    if (formData.country && formData.country.trim().length > 50) {
      newErrors.country = 'El país no puede exceder 50 caracteres';
    }

    // Validación de logo - ya no es necesaria porque el logo se sube después de crear la veterinaria
    // if (formData.logo && !formData.logo.url) {
    //   newErrors.logo = 'Error en la imagen del logo';
    // }

    // Validación de redes sociales
    if (formData.socialMedia.facebook && !/^https?:\/\/.+/.test(formData.socialMedia.facebook.trim())) {
      newErrors.facebook = 'URL de Facebook inválida';
    }
    if (formData.socialMedia.instagram && !/^https?:\/\/.+/.test(formData.socialMedia.instagram.trim())) {
      newErrors.instagram = 'URL de Instagram inválida';
    }
    if (formData.socialMedia.twitter && !/^https?:\/\/.+/.test(formData.socialMedia.twitter.trim())) {
      newErrors.twitter = 'URL de Twitter inválida';
    }

    // Validación de horarios
    Object.keys(formData.hours).forEach(day => {
      const dayHours = formData.hours[day];
      if (!dayHours.closed) {
        if (!dayHours.open || !dayHours.close) {
          newErrors[`hours_${day}`] = `Los horarios para ${weekDays.find(w => w.key === day)?.label} son requeridos`;
        } else if (dayHours.open >= dayHours.close) {
          newErrors[`hours_${day}`] = `La hora de apertura debe ser anterior a la de cierre para ${weekDays.find(w => w.key === day)?.label}`;
        }
      }
    });
    
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
      // Guardar el archivo temporalmente si existe
      const logoFile = formData.logo?.file || null;
      
      // Crear veterinaria sin logo primero
      const veterinaryDataWithoutLogo = { ...formData };
      delete veterinaryDataWithoutLogo.logo;
      
      const result = await onSubmit(veterinaryDataWithoutLogo);
      
      console.log('Resultado de crear veterinaria:', result);
      console.log('Logo file:', logoFile);
      
      // Si la veterinaria se creó exitosamente y hay un logo, subirlo
      if (result && result.data?.veterinary && logoFile) {
        console.log('Procediendo a subir logo...');
        console.log('ID de la veterinaria:', result.data.veterinary._id);
        console.log('Datos del logo a actualizar:', {
          url: 'se subirá a Cloudinary',
          publicId: 'se generará en Cloudinary',
          width: 'se obtendrá de Cloudinary',
          height: 'se obtendrá de Cloudinary'
        });
        
        try {
          const uploadedLogo = await cloudinaryService.uploadVeterinaryLogo(logoFile);
          console.log('Logo subido a Cloudinary:', uploadedLogo);
          
          // Actualizar la veterinaria con la información del logo
          const updateData = {
            logo: {
              url: uploadedLogo.url,
              publicId: uploadedLogo.publicId,
              width: uploadedLogo.width,
              height: uploadedLogo.height
            }
          };
          
          console.log('Datos para actualizar veterinaria:', updateData);
          
          const updateResult = await veterinaryService.updateVeterinary(result.data.veterinary._id, updateData);
          console.log('Veterinaria actualizada con logo:', updateResult);
        } catch (logoError) {
          console.error('Error subiendo logo después de crear veterinaria:', logoError);
          console.error('Detalles del error:', {
            message: logoError.message,
            response: logoError.response?.data
          });
          // No mostrar error al usuario ya que la veterinaria se creó exitosamente
        }
      } else {
        console.log('No se subió logo porque:', {
          hasResult: !!result,
          hasData: !!(result && result.data),
          hasVeterinary: !!(result && result.data && result.data.veterinary),
          hasLogoFile: !!logoFile,
          resultStructure: result ? Object.keys(result) : 'No result',
          dataStructure: result?.data ? Object.keys(result.data) : 'No data',
          veterinaryStructure: result?.data?.veterinary ? Object.keys(result.data.veterinary) : 'No veterinary'
        });
      }
      
      // Cerrar modal y recargar datos después de completar todo el proceso
      onClose();
    } catch (error) {
      console.error('Error creando veterinaria:', error);
      
      // Manejar errores del backend
      if (error.response?.data) {
        setBackendError(error.response.data);
        setShowErrorModal(true);
      } else if (error.message) {
        setBackendError({ message: error.message });
        setShowErrorModal(true);
      } else {
        setBackendError({ message: 'Error inesperado al crear la veterinaria' });
        setShowErrorModal(true);
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Crear Nueva Veterinaria</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-8">
            {/* Primera fila: Información básica y contacto */}
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

              {/* Logo de la veterinaria */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Logo de la Veterinaria
                </label>
                
                <div className="flex items-center space-x-4">
                  {/* Preview del logo */}
                  {logoPreview && (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Botón de subida */}
                  <div className="flex-1">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                      disabled={uploadingLogo}
                    />
                    <label
                      htmlFor="logo-upload"
                      className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors ${
                        uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploadingLogo ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          {logoPreview ? 'Cambiar Logo' : 'Subir Logo'}
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Información de ayuda */}
                <p className="text-xs text-gray-500">
                  Formatos: JPG, PNG, GIF, WebP. Máximo 5MB.
                </p>

                {/* Error del logo */}
                {errors.logo && (
                  <p className="text-sm text-red-600">{errors.logo}</p>
                )}
              </div>

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
            </div>

            {/* Segunda fila: Dirección */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Dirección
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Tercera fila: Servicios y Especialidades */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Servicios */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  Servicios Ofrecidos
                </h3>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
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
                  <p className="text-sm text-red-600">{errors.services}</p>
                )}
              </div>

              {/* Especialidades */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  Especialidades
                </h3>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
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

            {/* Cuarta fila: Horarios */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Horarios de Atención
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weekDays.map(day => (
                  <div key={day.key} className="space-y-2">
                    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-16">
                        <span className="text-sm font-medium text-gray-700">{day.label}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`closed-${day.key}`}
                          checked={formData.hours[day.key].closed}
                          onChange={(e) => handleHoursChange(day.key, 'closed', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`closed-${day.key}`} className="text-sm text-gray-600">
                          Cerrado
                        </label>
                      </div>

                      {!formData.hours[day.key].closed && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="time"
                            value={formData.hours[day.key].open}
                            onChange={(e) => handleHoursChange(day.key, 'open', e.target.value)}
                            className={`px-2 py-1 text-xs border rounded focus:ring-blue-500 focus:border-blue-500 ${
                              errors[`hours_${day.key}`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          <span className="text-xs text-gray-500">-</span>
                          <input
                            type="time"
                            value={formData.hours[day.key].close}
                            onChange={(e) => handleHoursChange(day.key, 'close', e.target.value)}
                            className={`px-2 py-1 text-xs border rounded focus:ring-blue-500 focus:border-blue-500 ${
                              errors[`hours_${day.key}`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Mostrar error de horarios */}
                    {errors[`hours_${day.key}`] && (
                      <div className="text-sm text-red-600 px-3">
                        {errors[`hours_${day.key}`]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quinta fila: Redes Sociales */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Redes Sociales
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Facebook"
                  name="facebook"
                  type="url"
                  value={formData.socialMedia.facebook}
                  onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                  error={errors.facebook}
                  placeholder="https://facebook.com/veterinaria"
                />

                <Input
                  label="Instagram"
                  name="instagram"
                  type="url"
                  value={formData.socialMedia.instagram}
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  error={errors.instagram}
                  placeholder="https://instagram.com/veterinaria"
                />

                <Input
                  label="Twitter"
                  name="twitter"
                  type="url"
                  value={formData.socialMedia.twitter}
                  onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                  error={errors.twitter}
                  placeholder="https://twitter.com/veterinaria"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
              {loading ? 'Creando...' : 'Crear Veterinaria'}
            </Button>
          </div>
        </form>
      </div>
      
      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        error={backendError}
        title="Error al crear veterinaria"
      />
    </div>
  );
};

export default CreateVeterinaryModal; 