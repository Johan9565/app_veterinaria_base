import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';

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
        isVerified: veterinary.isVerified || false
      });
    }
  }, [veterinary]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
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

    try {
      await onSubmit(veterinary._id, formData);
    } catch (error) {
      console.error('Error actualizando veterinaria:', error);
      // Los errores específicos se manejan en el componente padre
    } finally {
      setLoading(false);
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
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVeterinaryModal; 