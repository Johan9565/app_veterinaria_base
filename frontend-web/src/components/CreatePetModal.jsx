import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import Select2 from './ui/Select2';
import { userService } from '../services/permissionService';
import AlertService from '../services/alertService';

const CreatePetModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    gender: '',
    birthDate: '',
    weight: {
      value: '',
      unit: 'kg'
    },
    color: '',
    isNeutered: false,
    neuteredDate: '',
    healthStatus: 'bueno',
    allergies: [],
    notes: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  const [clients, setClients] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Especies disponibles
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

  // Estados de salud
  const healthStatusOptions = [
    { value: 'excelente', label: 'Excelente' },
    { value: 'bueno', label: 'Bueno' },
    { value: 'regular', label: 'Regular' },
    { value: 'malo', label: 'Malo' },
    { value: 'crítico', label: 'Crítico' }
  ];

  // Cargar clientes (usuarios con rol cliente)
  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await userService.getClients();
        const clientOptions = response.users.map(client => ({
          value: client._id,
          label: client.name
        }));
        setClients(clientOptions);
        
        if (clientOptions.length > 0) {
          setSelectedOwner(clientOptions[0].value);
        }
      } catch (err) {
        console.error('Error cargando clientes:', err);
        // No mostrar error si no hay clientes, solo log
        console.log('No se pudieron cargar los clientes, continuando sin ellos');
      }
    };

    loadClients();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (field, value) => {
    // Convertir a mayúsculas para campos de texto (excepto email, teléfono y campos especiales)
    const textFields = ['name', 'breed', 'color', 'notes', 'emergencyContact.name', 'emergencyContact.relationship'];
    const shouldUpperCase = textFields.includes(field);
    const processedValue = shouldUpperCase ? value.toUpperCase() : value;

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: processedValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: processedValue
      }));
    }
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Manejar alergias
  const handleAllergyChange = (index, value) => {
    const newAllergies = [...formData.allergies];
    newAllergies[index] = value;
    setFormData(prev => ({
      ...prev,
      allergies: newAllergies
    }));
  };

  const addAllergy = () => {
    setFormData(prev => ({
      ...prev,
      allergies: [...prev.allergies, '']
    }));
  };

  const removeAllergy = (index) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.species) {
      newErrors.species = 'La especie es requerida';
    }

    if (!formData.gender) {
      newErrors.gender = 'El género es requerido';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es requerida';
    }

    if (!formData.weight.value || formData.weight.value <= 0) {
      newErrors.weight = 'El peso es requerido y debe ser mayor a 0';
    }

    if (!selectedOwner) {
      newErrors.owner = 'Debe seleccionar un propietario';
    }

    // Validar teléfono de emergencia (debe tener exactamente 10 números)
    if (formData.emergencyContact.phone && !/^\d{10}$/.test(formData.emergencyContact.phone)) {
      newErrors.emergencyContactPhone = 'El teléfono debe tener exactamente 10 números';
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
      const petData = {
        ...formData,
        owner: selectedOwner,
        allergies: formData.allergies.filter(allergy => allergy.trim() !== '')
      };

      // Solo incluir neuteredDate si la mascota está esterilizada
      if (!petData.isNeutered) {
        delete petData.neuteredDate;
      }

      const result = await onSubmit(petData);
      
      if (result.success) {
        AlertService.success('Mascota creada', 'La mascota ha sido registrada exitosamente');
        onClose();
      }
    } catch (err) {
      console.error('Error creando mascota:', err);
      AlertService.error('Error', err.message || 'No se pudo crear la mascota');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Registrar Nueva Mascota</h2>
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
                label="Nombre *"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
                placeholder="Nombre de la mascota"
              />

              <Select2
                label="Especie *"
                options={[{ value: '', label: 'Seleccionar especie' }, ...speciesOptions]}
                value={formData.species}
                onChange={(value) => handleChange('species', value)}
                error={errors.species}
              />

              <Input
                label="Raza"
                value={formData.breed}
                onChange={(e) => handleChange('breed', e.target.value)}
                placeholder="Raza de la mascota"
              />

              <Select2
                label="Género *"
                options={[
                  { value: '', label: 'Seleccionar género' },
                  { value: 'macho', label: 'Macho' },
                  { value: 'hembra', label: 'Hembra' }
                ]}
                value={formData.gender}
                onChange={(value) => handleChange('gender', value)}
                error={errors.gender}
              />

              <Input
                label="Fecha de Nacimiento *"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleChange('birthDate', e.target.value)}
                error={errors.birthDate}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Peso *"
                  type="number"
                  step="0.1"
                  value={formData.weight.value}
                  onChange={(e) => handleChange('weight.value', parseFloat(e.target.value))}
                  error={errors.weight}
                  placeholder="0.0"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidad de Peso
                  </label>
                  <Select2
                    options={[
                      { value: 'kg', label: 'Kilogramos' },
                      { value: 'lb', label: 'Libras' }
                    ]}
                    value={formData.weight.unit}
                    onChange={(value) => handleChange('weight.unit', value)}
                  />
                </div>
              </div>

              <Input
                label="Color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                placeholder="Color de la mascota"
              />
            </div>

            {/* Información médica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Información Médica
              </h3>
              <label className="block text-sm font-medium text-gray-700">
                  Estado de Salud
                </label>
              <Select2
                options={healthStatusOptions}
                value={formData.healthStatus}
                onChange={(value) => handleChange('healthStatus', value)}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Esterilizado
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isNeutered"
                      checked={formData.isNeutered === true}
                      onChange={() => handleChange('isNeutered', true)}
                      className="mr-2"
                    />
                    Sí
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isNeutered"
                      checked={formData.isNeutered === false}
                      onChange={() => handleChange('isNeutered', false)}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              {formData.isNeutered && (
                <Input
                  label="Fecha de Esterilización"
                  type="date"
                  value={formData.neuteredDate}
                  onChange={(e) => handleChange('neuteredDate', e.target.value)}
                />
              )}



              {/* Alergias */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Alergias
                </label>
                {formData.allergies.map((allergy, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      placeholder="Alergia"
                      value={allergy}
                      onChange={(e) => handleAllergyChange(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeAllergy(index)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAllergy}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar Alergia
                </Button>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Información Adicional
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
               
                <Select2
                label="Propietario *"
                options={[{ value: '', label: 'Seleccionar propietario' }, ...clients]}
                value={selectedOwner}
                onChange={setSelectedOwner}
                error={errors.owner}
              />
              </div>
              

              <Input
                label="Notas"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Notas adicionales"
                multiline
                rows={3}
              />
            </div>

            {/* Contacto de emergencia */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Contacto de Emergencia</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Nombre"
                  value={formData.emergencyContact.name}
                  onChange={(e) => handleChange('emergencyContact.name', e.target.value)}
                  placeholder="Nombre del contacto"
                />
                <Input
                  label="Teléfono"
                  type="number"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => handleChange('emergencyContact.phone', e.target.value)}
                  placeholder="Número de teléfono (10 dígitos)"
                  error={errors.emergencyContactPhone}
                />
                <Input
                  label="Relación"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => handleChange('emergencyContact.relationship', e.target.value)}
                  placeholder="Relación con la mascota"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
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
            >
              Registrar Mascota
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePetModal; 