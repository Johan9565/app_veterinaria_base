import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../components/ProtectedRoute';
import { userService, permissionService } from '../../services/permissionService';
import UserPermissionsModal from '../../components/UserPermissionsModal';
import CreateUserModal from '../../components/CreateUserModal';
import EditUserModal from '../../components/EditUserModal';
import Navbar from '../../components/Navbar';
import Select2 from '../../components/ui/Select2';
import { Users, Search, Filter, Edit, Trash2, Shield, Eye, Plus, RefreshCw, UserPlus, Mail, Phone, Calendar } from 'lucide-react';
// SweetAlert2 is loaded via CDN in index.html
const Swal = window.Swal;

const UsersManagementPage = () => {
  const { user: currentUser } = useAuth();
  const { hasPermission, hasAnyPermission } = usePermissions();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [stats, setStats] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadUsers();
    loadStats();
    loadPermissions();
  }, []); // Solo al montar el componente

  // Recargar usuarios cuando cambie la página
  useEffect(() => {
    if (currentPage > 1) {
      loadUsers();
    }
  }, [currentPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        role: roleFilter,
        status: statusFilter
      };
      
      const response = await userService.getUsers(params);
      setUsers(response.users);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      if (error.response?.status === 429) {
        setError('Demasiadas peticiones. Espera un momento y vuelve a intentar.');
      } else {
        setError('Error cargando usuarios: ' + (error.response?.data?.message || error.message));
      }
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Pequeño delay para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      const response = await userService.getUserStats();
      setStats(response);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const loadPermissions = async () => {
    try {
      // Pequeño delay para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
      const response = await permissionService.getAllPermissions();
      setAvailablePermissions(response.permissions);
    } catch (error) {
      console.error('Error cargando permisos:', error);
    }
  };

  // Aplicar filtros localmente (en producción se haría en el backend)
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = statusFilter === '' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId) => {
    // Verificar permisos ANTES de mostrar cualquier diálogo
    if (!hasPermission('users.delete')) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'No tienes permisos para eliminar usuarios',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    // Verificar que no se esté intentando eliminar al usuario actual
    if (userId === currentUser?._id) {
      Swal.fire({
        icon: 'error',
        title: 'Operación no permitida',
        text: 'No puedes eliminar tu propia cuenta',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    // Solo proceder si el usuario hizo clic en "Sí, eliminar"
    if (result.isConfirmed) {
      try {
        await userService.deleteUser(userId);
        await loadUsers();
        await loadStats(); // Actualizar estadísticas también
        Swal.fire({
          icon: 'success',
          title: 'Usuario eliminado',
          text: 'Usuario eliminado exitosamente',
          confirmButtonText: 'Aceptar'
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar usuario',
          text: 'Error eliminando usuario: ' + (error.response?.data?.message || error.message),
          confirmButtonText: 'Aceptar'
        });
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (!hasPermission('users.update')) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'No tienes permisos para modificar usuarios',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    try {
      await userService.toggleUserStatus(userId, !currentStatus);
      await loadUsers();
      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: 'Estado del usuario actualizado exitosamente',
        confirmButtonText: 'Aceptar'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar estado',
        text: 'Error actualizando estado: ' + (error.response?.data?.message || error.message),
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const handleManagePermissions = (user) => {
    if (!hasPermission('permissions.manage')) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'No tienes permisos para gestionar permisos',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    setSelectedUser(user);
    setShowPermissionsModal(true);
  };

  const handleCreateUser = () => {
    if (!hasPermission('users.create')) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'No tienes permisos para crear usuarios',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    setShowCreateModal(true);
  };

  const handleSaveUser = async (userData) => {
    try {
      await userService.createUser(userData);
      await loadUsers();
      await loadStats();
      Swal.fire({
        icon: 'success',
        title: 'Usuario creado',
        text: 'Usuario creado exitosamente',
        confirmButtonText: 'Aceptar'
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error creando usuario';
      Swal.fire({
        icon: 'error',
        title: 'Error al crear usuario',
        text: errorMessage,
        confirmButtonText: 'Aceptar'
      });
      throw error; // Re-throw para que el modal maneje el error
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      await userService.updateUser(selectedUser._id, userData);
      await loadUsers();
      await loadStats();
      Swal.fire({
        icon: 'success',
        title: 'Usuario actualizado',
        text: 'Usuario actualizado exitosamente',
        confirmButtonText: 'Aceptar'
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error actualizando usuario';
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar usuario',
        text: errorMessage,
        confirmButtonText: 'Aceptar'
      });
      throw error; // Re-throw para que el modal maneje el error
    }
  };

  const handleRefresh = () => {
    loadUsers();
    loadStats();
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'veterinario': return 'bg-blue-100 text-blue-800';
      case 'cliente': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Verificar permisos
  if (!hasPermission('users.view')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Acceso denegado</h3>
          <p className="mt-1 text-sm text-gray-500">
            No tienes permisos para ver esta página.
          </p>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="mt-2 text-gray-600">
              Administra usuarios, roles y permisos del sistema
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </button>
            {hasPermission('users.create') && (
              <button
                onClick={handleCreateUser}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Usuarios
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Usuarios Activos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.activeUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Veterinarios
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.byRole?.find(r => r._id === 'veterinario')?.count || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Clientes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.byRole?.find(r => r._id === 'cliente')?.count || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Usuarios Inactivos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.inactiveUsers || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <Select2
              options={[
                { value: '', label: 'Todos los roles' },
                { value: 'veterinario', label: 'Veterinario' },
                { value: 'cliente', label: 'Cliente' }
              ]}
              value={roleFilter}
              onChange={setRoleFilter}
              placeholder="Filtrar por rol"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <Select2
              options={[
                { value: '', label: 'Todos' },
                { value: 'active', label: 'Activos' },
                { value: 'inactive', label: 'Inactivos' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filtrar por estado"
              className="w-full"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('');
                setStatusFilter('');
                setCurrentPage(1);
              }}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Acceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users size={20} className="text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          {user.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.isActive)}`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Nunca'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {hasPermission('permissions.manage') && (
                        <button
                          onClick={() => handleManagePermissions(user)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Gestionar Permisos"
                        >
                          <Shield size={16} />
                        </button>
                      )}
                      {hasPermission('users.update') && (
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Editar Usuario"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {hasPermission('users.update') && (
                        <button
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          className={`p-1 ${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          title={user.isActive ? 'Desactivar Usuario' : 'Activar Usuario'}
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      {hasPermission('users.delete') && user._id !== currentUser?._id && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Eliminar Usuario"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredUsers.length}</span> de{' '}
                  <span className="font-medium">{filteredUsers.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de permisos */}
      <UserPermissionsModal
        user={selectedUser}
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        onSave={(permissions) => {
        
          // Opcional: actualizar la lista de usuarios
          loadUsers();
        }}
      />

      {/* Modal de crear usuario */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveUser}
      />

      {/* Modal de editar usuario */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdateUser}
        user={selectedUser}
      />
      </div>
    </div>
  );
};

export default UsersManagementPage; 