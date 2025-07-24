import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Users, Check, X, RefreshCw, Save, Eye } from 'lucide-react';
import Button from '../../components/ui/Button';
import Navbar from '../../components/Navbar';

const PermissionsPage = () => {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Permisos organizados por módulo
  const permissionsByModule = {
    'Gestión de Usuarios': [
      'users.view',
      'users.create', 
      'users.edit',
      'users.delete'
    ],
    'Gestión de Mascotas': [
      'pets.view',
      'pets.create',
      'pets.edit', 
      'pets.delete'
    ],
    'Gestión de Citas': [
      'appointments.view',
      'appointments.create',
      'appointments.edit',
      'appointments.delete'
    ],
    'Gestión de Permisos': [
      'permissions.view',
      'permissions.assign'
    ],
    'Reportes': [
      'reports.view',
      'reports.create'
    ],
    'Configuración': [
      'settings.view',
      'settings.edit'
    ]
  };

  // Traducción de permisos
  const permissionLabels = {
    'users.view': 'Ver usuarios',
    'users.create': 'Crear usuarios',
    'users.edit': 'Editar usuarios',
    'users.delete': 'Eliminar usuarios',
    'pets.view': 'Ver mascotas',
    'pets.create': 'Crear mascotas',
    'pets.edit': 'Editar mascotas',
    'pets.delete': 'Eliminar mascotas',
    'appointments.view': 'Ver citas',
    'appointments.create': 'Crear citas',
    'appointments.edit': 'Editar citas',
    'appointments.delete': 'Eliminar citas',
    'permissions.view': 'Ver permisos',
    'permissions.assign': 'Asignar permisos',
    'reports.view': 'Ver reportes',
    'reports.create': 'Crear reportes',
    'settings.view': 'Ver configuración',
    'settings.edit': 'Editar configuración'
  };

  // Simulación de datos
  useEffect(() => {
    const mockUsers = [
      {
        _id: '1',
        name: 'Dr. Juan Pérez',
        email: 'juan@veterinaria.com',
        role: 'veterinario',
        permissions: ['pets.view', 'pets.edit', 'appointments.view', 'appointments.create']
      },
      {
        _id: '2',
        name: 'María García',
        email: 'maria@email.com',
        role: 'cliente',
        permissions: ['pets.view', 'pets.create', 'appointments.view']
      },
      {
        _id: '3',
        name: 'Admin Sistema',
        email: 'admin@veterinaria.com',
        role: 'admin',
        permissions: ['users.view', 'users.create', 'users.edit', 'users.delete', 'permissions.assign']
      }
    ];

    setUsers(mockUsers);
    setPermissions(Object.values(permissionsByModule).flat());
    setLoading(false);
  }, []);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handlePermissionToggle = (permission) => {
    if (!selectedUser) return;

    const updatedUser = { ...selectedUser };
    if (updatedUser.permissions.includes(permission)) {
      updatedUser.permissions = updatedUser.permissions.filter(p => p !== permission);
    } else {
      updatedUser.permissions = [...updatedUser.permissions, permission];
    }
    setSelectedUser(updatedUser);
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      // Aquí harías la llamada al API
      console.log('Guardando permisos para:', selectedUser.name, selectedUser.permissions);
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar la lista de usuarios
      setUsers(users.map(u => u._id === selectedUser._id ? selectedUser : u));
      
      alert('Permisos guardados exitosamente');
    } catch (error) {
      console.error('Error guardando permisos:', error);
      alert('Error al guardar permisos');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPermissions = () => {
    if (!selectedUser) return;

    const defaultPermissions = {
      cliente: ['pets.view', 'pets.create', 'appointments.view'],
      veterinario: ['pets.view', 'pets.edit', 'appointments.view', 'appointments.create', 'appointments.edit'],
      admin: ['users.view', 'users.create', 'users.edit', 'users.delete', 'pets.view', 'pets.create', 'pets.edit', 'pets.delete', 'appointments.view', 'appointments.create', 'appointments.edit', 'appointments.delete', 'permissions.view', 'permissions.assign', 'reports.view', 'reports.create', 'settings.view', 'settings.edit']
    };

    setSelectedUser({
      ...selectedUser,
      permissions: defaultPermissions[selectedUser.role] || []
    });
  };

  const hasPermission = (permission) => {
    return selectedUser?.permissions.includes(permission) || false;
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'veterinario': return 'bg-blue-100 text-blue-800';
      case 'cliente': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Shield size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Permisos</h1>
            <p className="mt-1 text-gray-600">
              Asigna y gestiona permisos de usuarios del sistema
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de usuarios */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Usuarios</h3>
              <p className="text-sm text-gray-500">Selecciona un usuario para gestionar sus permisos</p>
            </div>
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedUser?._id === user._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                        <span className="text-xs text-gray-400">
                          {user.permissions.length} permisos
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gestión de permisos */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Permisos de {selectedUser.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedUser.email} • {selectedUser.role}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetPermissions}
                      className="flex items-center space-x-1"
                    >
                      <RefreshCw size={16} />
                      <span>Resetear</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSavePermissions}
                      loading={saving}
                      disabled={saving}
                      className="flex items-center space-x-1"
                    >
                      <Save size={16} />
                      <span>Guardar</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {Object.entries(permissionsByModule).map(([moduleName, modulePermissions]) => (
                    <div key={moduleName} className="border border-gray-200 rounded-lg">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900">{moduleName}</h4>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {modulePermissions.map((permission) => (
                            <div
                              key={permission}
                              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => handlePermissionToggle(permission)}
                                  className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                                    hasPermission(permission)
                                      ? 'bg-blue-600 border-blue-600 text-white'
                                      : 'border-gray-300 hover:border-blue-400'
                                  }`}
                                >
                                  {hasPermission(permission) && <Check size={12} />}
                                </button>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {permissionLabels[permission]}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {permission}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {hasPermission(permission) && (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                    <Check size={12} className="mr-1" />
                                    Activo
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumen */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Resumen de permisos
                      </p>
                      <p className="text-sm text-blue-700">
                        {selectedUser.permissions.length} de {permissions.length} permisos asignados
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-900">
                        {Math.round((selectedUser.permissions.length / permissions.length) * 100)}%
                      </p>
                      <p className="text-xs text-blue-700">de permisos asignados</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona un usuario
              </h3>
              <p className="text-gray-500">
                Elige un usuario de la lista para comenzar a gestionar sus permisos
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default PermissionsPage; 