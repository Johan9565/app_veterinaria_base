import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import appointmentService from '../services/appointmentService';
import Button from './ui/Button';
import Input from './ui/Input';
import Select2 from './ui/Select2';
import ErrorModal from './ui/ErrorModal';

const CreateAppointmentModal = ({ isOpen, onClose, onSubmit, pets, veterinaries, veterinarians }) => {
  const { user } = useAuth();
  

  const [formData, setFormData] = useState({
    pet: '',
    owner: user?.id || '',
    veterinary: '',
    veterinarian: '',
    appointmentDate: '',
    appointmentTime: '',
    duration: 30,
    type: '',
    priority: 'normal',
    reason: '',
    symptoms: [],
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Opciones para los selectores - Mover fuera del render para evitar re-renders
  const typeOptions = React.useMemo(() => appointmentService.getAppointmentTypes(), []);
  const priorityOptions = React.useMemo(() => appointmentService.getPriorityOptions(), []);
  const paymentMethodOptions = React.useMemo(() => appointmentService.getPaymentMethods(), []);

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        pet: '',
        owner: user?._id || user?.id || '', // Usar _id que es el formato de MongoDB
        veterinary: '',
        veterinarian: '',
        appointmentDate: '',
        appointmentTime: '',
        duration: 30,
        type: '',
        priority: 'normal',
        reason: '',
        symptoms: [],
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen]); // Removemos user de las dependencias para evitar resets innecesarios

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.pet) newErrors.pet = 'La mascota es requerida';
    if (!formData.veterinary) newErrors.veterinary = 'La veterinaria es requerida';
    if (!formData.veterinarian) newErrors.veterinarian = 'El veterinario es requerido';
    if (!formData.appointmentDate) newErrors.appointmentDate = 'La fecha es requerida';
    if (!formData.appointmentTime) newErrors.appointmentTime = 'La hora es requerida';
    if (!formData.type) newErrors.type = 'El tipo de cita es requerido';
    if (!formData.reason || formData.reason.length < 10) {
      newErrors.reason = 'El motivo debe tener al menos 10 caracteres';
    }
    
    // Validar que el propietario esté presente (se establece automáticamente al seleccionar mascota)
    if (!formData.owner) {
      newErrors.pet = 'Debe seleccionar una mascota para establecer el propietario';
    }

    // Validar fecha futura
    if (formData.appointmentDate && formData.appointmentTime) {
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
      if (appointmentDateTime <= new Date()) {
        newErrors.appointmentDate = 'La cita debe ser programada para una fecha y hora futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambio de campo
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Si se selecciona una mascota, establecer automáticamente el propietario
    if (field === 'pet' && value) {
      const selectedPet = pets.find(pet => pet._id === value);
      if (selectedPet && selectedPet.owner) {
        const ownerId = selectedPet.owner._id || selectedPet.owner;
        setFormData(prev => ({
          ...prev,
          [field]: value,
          owner: ownerId
        }));
      }
    }

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Manejar cambio de síntomas
  const handleSymptomsChange = (index, value) => {
    const newSymptoms = [...formData.symptoms];
    newSymptoms[index] = value;
    setFormData(prev => ({
      ...prev,
      symptoms: newSymptoms
    }));
  };

  // Agregar síntoma
  const addSymptom = () => {
    setFormData(prev => ({
      ...prev,
      symptoms: [...prev.symptoms, '']
    }));
  };

  // Remover síntoma
  const removeSymptom = (index) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index)
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Preparar datos para envío
      const appointmentData = {
        ...formData,
        owner: formData.owner || user?._id || user?.id, // Asegurar que el owner esté presente
        symptoms: formData.symptoms.filter(symptom => symptom.trim() !== ''),
        appointmentDate: appointmentService.formatDate(formData.appointmentDate),
        appointmentTime: appointmentService.formatTime(formData.appointmentTime)
      };

      await onSubmit(appointmentData);
      onClose();
    } catch (error) {
      console.error('Error creando cita:', error);
      setErrorMessage(error.message || 'Error al crear la cita');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Verificar disponibilidad
  const checkAvailability = async () => {
    if (!formData.veterinary || !formData.veterinarian || !formData.appointmentDate || !formData.appointmentTime) {
      return;
    }

    try {
      const response = await appointmentService.checkAvailability({
        veterinary: formData.veterinary,
        veterinarian: formData.veterinarian,
        date: formData.appointmentDate,
        time: formData.appointmentTime,
        duration: formData.duration
      });

      if (!response.data.available) {
        setErrors(prev => ({
          ...prev,
          appointmentTime: 'El veterinario no está disponible en ese horario'
        }));
      }
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
    }
  };

  // Verificar disponibilidad cuando cambien fecha/hora
  useEffect(() => {
    if (formData.veterinary && formData.veterinarian && formData.appointmentDate && formData.appointmentTime) {
      const timeoutId = setTimeout(checkAvailability, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.veterinary, formData.veterinarian, formData.appointmentDate, formData.appointmentTime, formData.duration]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Crear Nueva Cita</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {/* Mascota */}
                 <div>
                   <Select2
                     label="Mascota *"
                     options={React.useMemo(() => pets.map(pet => ({
                       value: pet._id,
                       label: `${pet.name} (${pet.species})`
                     })), [pets])}
                     value={formData.pet}
                     onChange={(value) => handleChange('pet', value)}
                     placeholder="Seleccionar mascota"
                     error={errors.pet}
                   />
                 </div>

                                 {/* Veterinaria */}
                 <div>
                   <Select2
                     label="Veterinaria *"
                     options={React.useMemo(() => veterinaries, [veterinaries])}
                     value={formData.veterinary}
                     onChange={(value) => handleChange('veterinary', value)}
                     placeholder="Seleccionar veterinaria"
                     error={errors.veterinary}
                   />
                 </div>

                 {/* Veterinario */}
                 <div>
                   <Select2
                     label="Veterinario *"
                     options={React.useMemo(() => veterinarians, [veterinarians])}
                     value={formData.veterinarian}
                     onChange={(value) => handleChange('veterinarian', value)}
                     placeholder="Seleccionar veterinario"
                     error={errors.veterinarian}
                   />
                 </div>

                                 {/* Tipo de cita */}
                 <div>
                   <Select2
                     label="Tipo de Cita *"
                     options={React.useMemo(() => typeOptions, [typeOptions])}
                     value={formData.type}
                     onChange={(value) => handleChange('type', value)}
                     placeholder="Seleccionar tipo"
                     error={errors.type}
                   />
                 </div>

                {/* Fecha */}
                <div>
                  <Input
                    label="Fecha *"
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => handleChange('appointmentDate', e.target.value)}
                    error={errors.appointmentDate}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Hora */}
                <div>
                  <Input
                    label="Hora *"
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => handleChange('appointmentTime', e.target.value)}
                    error={errors.appointmentTime}
                  />
                </div>

                {/* Duración */}
                <div>
                  <Input
                    label="Duración (minutos)"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                    min={15}
                    max={240}
                  />
                </div>

                                 {/* Prioridad */}
                 <div>
                   <Select2
                     label="Prioridad"
                     options={React.useMemo(() => priorityOptions, [priorityOptions])}
                     value={formData.priority}
                     onChange={(value) => handleChange('priority', value)}
                     placeholder="Seleccionar prioridad"
                   />
                 </div>
              </div>

              {/* Motivo */}
              <div>
                <Input
                  label="Motivo de la Cita *"
                  type="textarea"
                  value={formData.reason}
                  onChange={(e) => handleChange('reason', e.target.value)}
                  placeholder="Describe el motivo de la cita..."
                  error={errors.reason}
                  rows={3}
                />
              </div>

              {/* Síntomas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Síntomas
                </label>
                {formData.symptoms.map((symptom, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={symptom}
                      onChange={(e) => handleSymptomsChange(index, e.target.value)}
                      placeholder="Síntoma..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => removeSymptom(index)}
                      variant="danger"
                      size="sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addSymptom}
                  variant="secondary"
                  size="sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar Síntoma
                </Button>
              </div>

              {/* Notas */}
              <div>
                <Input
                  label="Notas Adicionales"
                  type="textarea"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={3}
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="secondary"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando...
                    </>
                  ) : (
                    'Crear Cita'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de error */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error al crear cita"
        message={errorMessage}
      />
    </>
  );
};

export default CreateAppointmentModal;
