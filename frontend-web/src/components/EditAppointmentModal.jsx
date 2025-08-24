import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import appointmentService from '../services/appointmentService';
import Button from './ui/Button';
import Input from './ui/Input';
import Select2 from './ui/Select2';
import ErrorModal from './ui/ErrorModal';

const EditAppointmentModal = ({ isOpen, onClose, onSubmit, appointment, pets, veterinaries, veterinarians, onStatusChange, onPayment, onDelete }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  // Opciones para los selectores
  const typeOptions = appointmentService.getAppointmentTypes();
  const priorityOptions = appointmentService.getPriorityOptions();
  const paymentMethodOptions = appointmentService.getPaymentMethods();
  const statusOptions = appointmentService.getAppointmentStatuses();

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen && appointment) {
      setFormData({
        pet: appointment.pet?._id || '',
        owner: appointment.owner?._id || '',
        veterinary: appointment.veterinary?._id || '',
        veterinarian: appointment.veterinarian?._id || '',
        appointmentDate: appointment.appointmentDate ? new Date(appointment.appointmentDate).toISOString().split('T')[0] : '',
        appointmentTime: appointment.appointmentTime || '',
        duration: appointment.duration || 30,
        type: appointment.type || '',
        priority: appointment.priority || 'normal',
        reason: appointment.reason || '',
        symptoms: appointment.symptoms || [],
        notes: appointment.notes || '',
        diagnosis: appointment.diagnosis || '',
        treatment: appointment.treatment || '',
        prescription: appointment.prescription || [],
        cost: {
          amount: appointment.cost?.amount || '',
          currency: appointment.cost?.currency || 'MXN',
          paid: appointment.cost?.paid || false,
          paymentMethod: appointment.cost?.paymentMethod || ''
        },
        followUp: {
          required: appointment.followUp?.required || false,
          date: appointment.followUp?.date ? new Date(appointment.followUp.date).toISOString().split('T')[0] : '',
          notes: appointment.followUp?.notes || ''
        }
      });
      setErrors({});
    }
  }, [isOpen, appointment]);

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

    // Validar fecha futura solo si la cita no está completada
    if (appointment?.status !== 'completada' && formData.appointmentDate && formData.appointmentTime) {
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

  // Manejar cambio de prescripción
  const handlePrescriptionChange = (index, field, value) => {
    const newPrescription = [...formData.prescription];
    newPrescription[index] = {
      ...newPrescription[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      prescription: newPrescription
    }));
  };

  // Agregar medicamento
  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      prescription: [...prev.prescription, {
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }]
    }));
  };

  // Remover medicamento
  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      prescription: prev.prescription.filter((_, i) => i !== index)
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
        symptoms: formData.symptoms.filter(symptom => symptom.trim() !== ''),
        prescription: formData.prescription.filter(med => 
          med.medication.trim() !== '' && 
          med.dosage.trim() !== '' && 
          med.frequency.trim() !== '' && 
          med.duration.trim() !== ''
        ),
        appointmentDate: appointmentService.formatDate(formData.appointmentDate),
        appointmentTime: appointmentService.formatTime(formData.appointmentTime)
      };

      await onSubmit(appointment._id, appointmentData);
      onClose();
    } catch (error) {
      console.error('Error actualizando cita:', error);
      setErrorMessage(error.message || 'Error al actualizar la cita');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de estado
  const handleStatusChange = async () => {
    try {
      setLoading(true);
      await onStatusChange(appointment._id, newStatus);
      setShowStatusModal(false);
      setNewStatus('');
    } catch (error) {
      console.error('Error cambiando estado:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar pago
  const handlePayment = async () => {
    try {
      setLoading(true);
      await onPayment(appointment._id, paymentMethod);
      setShowPaymentModal(false);
      setPaymentMethod('');
    } catch (error) {
      console.error('Error registrando pago:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación
  const handleDelete = async () => {
    try {
      setLoading(true);
      await onDelete(appointment._id);
      setShowDeleteModal(false);
      onClose();
    } catch (error) {
      console.error('Error eliminando cita:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !appointment) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
          <div className="mt-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Editar Cita</h3>
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
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mascota */}
                <div>
                  <Select2
                    label="Mascota *"
                    options={pets.map(pet => ({
                      value: pet._id,
                      label: `${pet.name} (${pet.species})`
                    }))}
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
                    options={veterinaries}
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
                    options={veterinarians}
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
                    options={typeOptions}
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
                    min={appointment.status === 'completada' ? undefined : new Date().toISOString().split('T')[0]}
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
                    options={priorityOptions}
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

              {/* Diagnóstico y tratamiento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Diagnóstico"
                    type="textarea"
                    value={formData.diagnosis}
                    onChange={(e) => handleChange('diagnosis', e.target.value)}
                    placeholder="Diagnóstico..."
                    rows={3}
                  />
                </div>
                <div>
                  <Input
                    label="Tratamiento"
                    type="textarea"
                    value={formData.treatment}
                    onChange={(e) => handleChange('treatment', e.target.value)}
                    placeholder="Tratamiento..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Prescripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prescripción
                </label>
                {formData.prescription.map((med, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Medicamento"
                        value={med.medication}
                        onChange={(e) => handlePrescriptionChange(index, 'medication', e.target.value)}
                        placeholder="Nombre del medicamento"
                      />
                      <Input
                        label="Dosis"
                        value={med.dosage}
                        onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                        placeholder="Dosis"
                      />
                      <Input
                        label="Frecuencia"
                        value={med.frequency}
                        onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}
                        placeholder="Frecuencia"
                      />
                      <Input
                        label="Duración"
                        value={med.duration}
                        onChange={(e) => handlePrescriptionChange(index, 'duration', e.target.value)}
                        placeholder="Duración del tratamiento"
                      />
                    </div>
                    <div className="mt-4">
                      <Input
                        label="Instrucciones"
                        type="textarea"
                        value={med.instructions}
                        onChange={(e) => handlePrescriptionChange(index, 'instructions', e.target.value)}
                        placeholder="Instrucciones adicionales..."
                        rows={2}
                      />
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        type="button"
                        onClick={() => removeMedication(index)}
                        variant="danger"
                        size="sm"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addMedication}
                  variant="secondary"
                  size="sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar Medicamento
                </Button>
              </div>

              {/* Información de costo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Input
                    label="Costo"
                    type="number"
                    value={formData.cost?.amount}
                    onChange={(e) => handleChange('cost', { ...formData.cost, amount: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                  />
                </div>
                <div>
                  <Select2
                    label="Moneda"
                    options={[
                      { value: 'MXN', label: 'MXN' },
                      { value: 'USD', label: 'USD' },
                      { value: 'EUR', label: 'EUR' }
                    ]}
                    value={formData.cost?.currency}
                    onChange={(value) => handleChange('cost', { ...formData.cost, currency: value })}
                    placeholder="Seleccionar moneda"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.cost?.paid}
                      onChange={(e) => handleChange('cost', { ...formData.cost, paid: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Pagado</span>
                  </label>
                </div>
              </div>

              {/* Seguimiento */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={formData.followUp?.required}
                    onChange={(e) => handleChange('followUp', { ...formData.followUp, required: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Requiere Seguimiento</span>
                </div>
                {formData.followUp?.required && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Fecha de Seguimiento"
                      type="date"
                      value={formData.followUp?.date}
                      onChange={(e) => handleChange('followUp', { ...formData.followUp, date: e.target.value })}
                    />
                    <Input
                      label="Notas de Seguimiento"
                      type="textarea"
                      value={formData.followUp?.notes}
                      onChange={(e) => handleChange('followUp', { ...formData.followUp, notes: e.target.value })}
                      placeholder="Notas de seguimiento..."
                      rows={2}
                    />
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex justify-between pt-4">
                <div className="flex space-x-3">
                  {user?.permissions?.includes('appointments.update') && (
                    <>
                      <Button
                        type="button"
                        onClick={() => setShowStatusModal(true)}
                        variant="secondary"
                        size="sm"
                      >
                        Cambiar Estado
                      </Button>
                      {!appointment.cost?.paid && appointment.cost?.amount && (
                        <Button
                          type="button"
                          onClick={() => setShowPaymentModal(true)}
                          variant="primary"
                          size="sm"
                        >
                          Registrar Pago
                        </Button>
                      )}
                    </>
                  )}
                  {user?.permissions?.includes('appointments.delete') && 
                   ['programada', 'cancelada'].includes(appointment.status) && (
                    <Button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      variant="danger"
                      size="sm"
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
                <div className="flex space-x-3">
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
                        Actualizando...
                      </>
                    ) : (
                      'Actualizar Cita'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de error */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error al actualizar cita"
        message={errorMessage}
      />

      {/* Modal de cambio de estado */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cambiar Estado</h3>
              <Select2
                label="Nuevo Estado"
                options={statusOptions.filter(option => option.value !== appointment.status)}
                value={newStatus}
                onChange={setNewStatus}
                placeholder="Seleccionar nuevo estado"
              />
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  onClick={() => setShowStatusModal(false)}
                  variant="secondary"
                  size="sm"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleStatusChange}
                  variant="primary"
                  size="sm"
                  disabled={!newStatus || loading}
                >
                  {loading ? 'Cambiando...' : 'Cambiar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de pago */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Registrar Pago</h3>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">Monto</label>
                <p className="text-sm text-gray-900">{appointment.cost.amount} {appointment.cost.currency}</p>
              </div>
              <Select2
                label="Método de Pago"
                options={paymentMethodOptions}
                value={paymentMethod}
                onChange={setPaymentMethod}
                placeholder="Seleccionar método de pago"
              />
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  onClick={() => setShowPaymentModal(false)}
                  variant="secondary"
                  size="sm"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handlePayment}
                  variant="primary"
                  size="sm"
                  disabled={!paymentMethod || loading}
                >
                  {loading ? 'Registrando...' : 'Registrar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar Eliminación</h3>
              <p className="text-sm text-gray-600 mb-6">
                ¿Estás seguro de que quieres eliminar esta cita? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => setShowDeleteModal(false)}
                  variant="secondary"
                  size="sm"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="danger"
                  size="sm"
                  disabled={loading}
                >
                  {loading ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditAppointmentModal;
