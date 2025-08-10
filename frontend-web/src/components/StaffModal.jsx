import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, Trash2, Search } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import Select2 from './ui/Select2';
import veterinaryService from '../services/veterinaryService';
import { userService } from '../services/permissionService';
import AlertService from '../services/alertService';

const StaffModal = ({ veterinary, onClose, onUpdate }) => {
  const [staff, setStaff] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Cargar staff actual
  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await veterinaryService.getVeterinaryById(veterinary._id);
      if (response.success && response.data.veterinary.staff) {
        setStaff(response.data.veterinary.staff);
      }
    } catch (error) {
      console.error('Error cargando staff:', error);
      AlertService.error('Error', 'No se pudo cargar el personal');
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios disponibles
  const loadAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      
      const response = await userService.getUsers({ limit: 100 });
     
      
      if (response.users) {
        // Filtrar usuarios que no están en el staff actual
        const currentStaffIds = staff.map(member => {
          const userId = member.user?._id || member.user;
          return userId?.toString();
        });
        const available = response.users.filter(user => 
          !currentStaffIds.includes(user._id.toString()) && user.isActive
        );
      
        
        setAvailableUsers(available);
        setFilteredUsers(available);
      } else {
        console.warn('No se encontraron usuarios en la respuesta');
        setAvailableUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      AlertService.error('Error', 'No se pudo cargar la lista de usuarios');
      setAvailableUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (veterinary) {
      loadStaff();
      loadAvailableUsers();
    }
  }, [veterinary]);

  // Filtrar usuarios por búsqueda
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = availableUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(availableUsers);
    }
  }, [searchTerm, availableUsers]);

  // Agregar miembro al staff
  const handleAddStaff = async () => {
    if (!selectedUser) {
      AlertService.error('Error', 'Por favor selecciona un usuario');
      return;
    }

    try {
      setLoading(true);
     
      await veterinaryService.addStaffMember(veterinary._id, {
        userId: selectedUser
      });

     
      AlertService.success('Éxito', 'Personal agregado correctamente');
      setSelectedUser('');
      
      // Recargar solo el staff, no los usuarios disponibles
      
      try {
        await loadStaff();
      } catch (loadError) {
        console.error('Error recargando staff:', loadError);
        // Continuar con la operación aunque falle la recarga
      }
      
      // Llamar onUpdate de forma segura
    
      try {
        onUpdate();
      } catch (updateError) {
        console.error('Error en onUpdate:', updateError);
        // No mostrar error al usuario ya que la operación principal fue exitosa
      }
      
    } catch (error) {
      console.error('Error agregando personal:', error);
      const message = error.response?.data?.message || 'Error al agregar personal';
      AlertService.error('Error', message);
    } finally {
      setLoading(false);
    }
  };

  // Remover miembro del staff
  const handleRemoveStaff = async (staffId) => {
    const confirmed = await AlertService.confirmDelete('este miembro del personal');
    if (!confirmed) return;

    try {
      setLoading(true);
      await veterinaryService.removeStaffMember(veterinary._id, staffId);
      AlertService.success('Éxito', 'Personal removido correctamente');
      await loadStaff();
      onUpdate();
    } catch (error) {
      console.error('Error removiendo personal:', error);
      const message = error.response?.data?.message || 'Error al remover personal';
      AlertService.error('Error', message);
    } finally {
      setLoading(false);
    }
  };

  // Formatear rol para mostrar
  const formatRole = (role) => {
    const roleMap = {
      'veterinario': 'Veterinario',
      'asistente': 'Asistente',
      'recepcionista': 'Recepcionista',
      'administrador': 'Administrador',
      'cliente': 'Cliente'
    };
    return roleMap[role] || role;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!veterinary) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Gestionar Personal
                </h3>
                <p className="text-sm text-gray-500">
                  {veterinary.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sección: Agregar Personal */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
                Agregar Personal
              </h4>

              <div className="space-y-4">
                {/* Búsqueda de usuarios */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar Usuario
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por nombre o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Select de usuario */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Usuario
                  </label>
                  <Select2
                    options={filteredUsers.map(user => ({
                      value: user._id,
                      label: `${user.name} (${user.email}) - ${formatRole(user.role)}`
                    }))}
                    value={selectedUser}
                    onChange={setSelectedUser}
                    placeholder={loadingUsers ? "Cargando usuarios..." : "Seleccionar usuario"}
                    disabled={loadingUsers || loading}
                    className="w-full"
                  />
                </div>

                {/* Botón agregar */}
                <Button
                  onClick={handleAddStaff}
                  disabled={!selectedUser || loading}
                  loading={loading}
                  className="w-full"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Agregar al Personal
                </Button>
              </div>
            </div>

            {/* Sección: Personal Actual */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Personal Actual ({staff.length})
              </h4>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : staff.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay personal</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Agrega miembros al personal de esta veterinaria.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {staff.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {member.user?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {member.user?.name || 'Usuario'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {member.user?.email || 'Sin email'}
                            </p>
                          </div>
                        </div>
                                                 <div className="mt-2 flex items-center gap-2">
                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                             {formatRole(member.user?.role)}
                           </span>
                           <span className="text-xs text-gray-500">
                             Desde: {formatDate(member.addedAt)}
                           </span>
                         </div>
                      </div>
                      <Button
                        onClick={() => handleRemoveStaff(member._id)}
                        variant="danger"
                        size="sm"
                        disabled={loading}
                        className="ml-3"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffModal; 