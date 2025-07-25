import { useState, useEffect } from 'react';
import { permissionService } from '../../services/permissionService';
import { usePermissions } from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
import { Shield, Users, Settings, Eye, Edit, Trash, Plus, RefreshCw } from 'lucide-react';

const PermissionsPage = () => {
  const { hasPermission, isAdmin } = usePermissions();
  const [permissions, setPermissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadPermissions();
    loadStats();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const response = await permissionService.getAllPermissions();
      // El backend devuelve { permissions, total } directamente
      setPermissions(response.permissions || []);
    } catch (error) {
      setError('Error cargando permisos');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await permissionService.getPermissionStats();
      // El backend devuelve { success: true, data: stats }
      setStats(response.data || response);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const filteredPermissions = selectedCategory === 'all' 
    ? permissions 
    : permissions.filter(p => p.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'Todos', icon: Shield },
    { id: 'users', name: 'Usuarios', icon: Users },
    { id: 'pets', name: 'Mascotas', icon: Shield },
    { id: 'appointments', name: 'Citas', icon: Shield },
    { id: 'permissions', name: 'Permisos', icon: Shield },
    { id: 'reports', name: 'Reportes', icon: Shield },
    { id: 'settings', name: 'Configuración', icon: Settings }
  ];

  if (!hasPermission('permissions.view')) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Permisos</h1>
          <p className="mt-2 text-gray-600">
            Administra los permisos del sistema veterinario
          </p>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Permisos
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.total}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {stats.byCategory?.map((category) => (
              <div key={category._id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate capitalize">
                          {category._id}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {category.count}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Filtrar por Categoría
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lista de Permisos */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Permisos del Sistema
              </h3>
              <button
                onClick={loadPermissions}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Cargando permisos...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredPermissions.map((permission) => (
                <li key={permission._id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Shield className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {permission.description}
                          </p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            permission.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {permission.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {permission.description}
                        </p>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-400">
                          <span className="capitalize">Categoría: {permission.category}</span>
                          <span className="capitalize">Acción: {permission.action}</span>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!loading && !error && filteredPermissions.length === 0 && (
            <div className="p-8 text-center">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay permisos</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron permisos para la categoría seleccionada.
              </p>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Información sobre Permisos
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Los permisos se obtienen dinámicamente desde la base de datos. 
                  Para agregar nuevos permisos, contacta al administrador del sistema.
                </p>
                <p className="mt-2">
                  <strong>Formato:</strong> categoria.accion (ej: users.view, pets.create)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsPage; 