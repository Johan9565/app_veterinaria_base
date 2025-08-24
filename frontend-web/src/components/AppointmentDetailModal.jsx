import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import appointmentService from '../services/appointmentService';
import Button from './ui/Button';
import Select2 from './ui/Select2';
import AlertService from '../services/alertService';

const AppointmentDetailModal = ({ isOpen, onClose, appointment, onStatusChange, onPayment, onDelete }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  if (!isOpen || !appointment) return null;

  // Opciones para los selectores
  const statusOptions = appointmentService.getAppointmentStatuses();
  const paymentMethodOptions = appointmentService.getPaymentMethods();

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

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
          <div className="mt-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Detalles de la Cita</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido */}
            <div className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Información de la Cita
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Motivo</label>
                      <p className="text-sm text-gray-900 mt-1">{appointment.reason}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Estado</label>
                        <div className="mt-1">{getStatusBadge(appointment.status)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Tipo</label>
                        <div className="mt-1">{getTypeBadge(appointment.type)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Prioridad</label>
                        <div className="mt-1">{getPriorityBadge(appointment.priority)}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Fecha</label>
                        <p className="text-sm text-gray-900 mt-1">{formatDate(appointment.appointmentDate)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Hora</label>
                        <p className="text-sm text-gray-900 mt-1">{formatTime(appointment.appointmentTime)}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Duración</label>
                      <p className="text-sm text-gray-900 mt-1">{appointment.duration} minutos</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Información de la Mascota
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nombre</label>
                      <p className="text-sm text-gray-900 mt-1">{appointment.pet?.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Especie</label>
                        <p className="text-sm text-gray-900 mt-1">{appointment.pet?.species}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Raza</label>
                        <p className="text-sm text-gray-900 mt-1">{appointment.pet?.breed || 'No especificada'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Género</label>
                        <p className="text-sm text-gray-900 mt-1">{appointment.pet?.gender}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Peso</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {appointment.pet?.weight?.value} {appointment.pet?.weight?.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del propietario y veterinario */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Información del Propietario
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nombre</label>
                      <p className="text-sm text-gray-900 mt-1">{appointment.owner?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900 mt-1">{appointment.owner?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Teléfono</label>
                      <p className="text-sm text-gray-900 mt-1">{appointment.owner?.phone}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Información del Veterinario
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nombre</label>
                      <p className="text-sm text-gray-900 mt-1">{appointment.veterinarian?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900 mt-1">{appointment.veterinarian?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Teléfono</label>
                      <p className="text-sm text-gray-900 mt-1">{appointment.veterinarian?.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de la veterinaria */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Información de la Veterinaria
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nombre</label>
                    <p className="text-sm text-gray-900 mt-1">{appointment.veterinary?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Dirección</label>
                    <p className="text-sm text-gray-900 mt-1">{appointment.veterinary?.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Teléfono</label>
                    <p className="text-sm text-gray-900 mt-1">{appointment.veterinary?.phone}</p>
                  </div>
                </div>
              </div>

              {/* Síntomas */}
              {appointment.symptoms && appointment.symptoms.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Síntomas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {appointment.symptoms.map((symptom, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas */}
              {appointment.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Notas
                  </h4>
                  <p className="text-sm text-gray-900">{appointment.notes}</p>
                </div>
              )}

              {/* Diagnóstico y tratamiento */}
              {(appointment.diagnosis || appointment.treatment) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {appointment.diagnosis && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Diagnóstico
                      </h4>
                      <p className="text-sm text-gray-900">{appointment.diagnosis}</p>
                    </div>
                  )}
                  {appointment.treatment && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Tratamiento
                      </h4>
                      <p className="text-sm text-gray-900">{appointment.treatment}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Prescripción */}
              {appointment.prescription && appointment.prescription.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Prescripción
                  </h4>
                  <div className="space-y-3">
                    {appointment.prescription.map((med, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-500">Medicamento</label>
                            <p className="text-sm text-gray-900">{med.medication}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500">Dosis</label>
                            <p className="text-sm text-gray-900">{med.dosage}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500">Frecuencia</label>
                            <p className="text-sm text-gray-900">{med.frequency}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500">Duración</label>
                            <p className="text-sm text-gray-900">{med.duration}</p>
                          </div>
                        </div>
                        {med.instructions && (
                          <div className="mt-2">
                            <label className="text-xs font-medium text-gray-500">Instrucciones</label>
                            <p className="text-sm text-gray-900">{med.instructions}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Información de costo */}
              {appointment.cost && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Información de Costo
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Monto</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {appointment.cost.amount ? `${appointment.cost.amount} ${appointment.cost.currency}` : 'No especificado'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Estado de Pago</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {appointment.cost.paid ? (
                          <span className="text-green-600 font-medium">Pagado</span>
                        ) : (
                          <span className="text-red-600 font-medium">Pendiente</span>
                        )}
                      </p>
                    </div>
                    {appointment.cost.paymentMethod && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Método de Pago</label>
                        <p className="text-sm text-gray-900 mt-1">{appointment.cost.paymentMethod}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Seguimiento */}
              {appointment.followUp && appointment.followUp.required && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Seguimiento
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Fecha de Seguimiento</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {appointment.followUp.date ? formatDate(appointment.followUp.date) : 'No especificada'}
                      </p>
                    </div>
                    {appointment.followUp.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Notas de Seguimiento</label>
                        <p className="text-sm text-gray-900 mt-1">{appointment.followUp.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                {user?.permissions?.includes('appointments.update') && (
                  <>
                    <Button
                      onClick={() => setShowStatusModal(true)}
                      variant="secondary"
                      size="sm"
                    >
                      Cambiar Estado
                    </Button>
                    {!appointment.cost?.paid && appointment.cost?.amount && (
                      <Button
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
                    onClick={() => setShowDeleteModal(true)}
                    variant="danger"
                    size="sm"
                  >
                    Eliminar
                  </Button>
                )}
                <Button
                  onClick={onClose}
                  variant="secondary"
                  size="sm"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default AppointmentDetailModal;
