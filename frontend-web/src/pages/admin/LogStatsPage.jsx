import { useState, useEffect } from 'react';
import { logService } from '../../services/logService';
import { usePermissions } from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Activity, 
  Calendar,
  Clock,
  Filter,
  RefreshCw,
  Download,
  PieChart,
  LineChart,
  Target,
  Zap,
  Shield,
  Database
} from 'lucide-react';

const LogStatsPage = () => {
  const { hasPermission } = usePermissions();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    level: ''
  });

  useEffect(() => {
    loadStats();
  }, [filters]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await logService.getLogStats(filters);
      setStats(response.data);
    } catch (error) {
      setError('Error cargando estadísticas');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatPercentage = (value, total) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const getLevelColor = (level) => {
    const colors = {
      info: 'text-blue-500',
      warning: 'text-yellow-500',
      error: 'text-red-500',
      debug: 'text-gray-500',
      security: 'text-purple-500'
    };
    return colors[level] || 'text-gray-500';
  };

  const getCategoryColor = (category) => {
    const colors = {
      auth: 'text-blue-600',
      user: 'text-green-600',
      pet: 'text-purple-600',
      appointment: 'text-orange-600',
      veterinary: 'text-indigo-600',
      permission: 'text-red-600',
      system: 'text-gray-600',
      api: 'text-cyan-600'
    };
    return colors[category] || 'text-gray-600';
  };

  if (!hasPermission('logs.view')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Acceso denegado</h3>
          <p className="mt-1 text-sm text-gray-500">
            No tienes permisos para ver las estadísticas de logs.
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
          <h1 className="text-3xl font-bold text-gray-900">Estadísticas de Logs</h1>
          <p className="mt-2 text-gray-600">
            Análisis detallado de la actividad del sistema veterinario
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-medium text-gray-900">Filtros de Análisis</h3>
              <button
                onClick={loadStats}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas las categorías</option>
                  <option value="auth">Autenticación</option>
                  <option value="user">Usuarios</option>
                  <option value="pet">Mascotas</option>
                  <option value="appointment">Citas</option>
                  <option value="veterinary">Veterinarias</option>
                  <option value="permission">Permisos</option>
                  <option value="system">Sistema</option>
                  <option value="api">API</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel
                </label>
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los niveles</option>
                  <option value="info">Información</option>
                  <option value="warning">Advertencia</option>
                  <option value="error">Error</option>
                  <option value="debug">Debug</option>
                  <option value="security">Seguridad</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Cargando estadísticas...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : stats ? (
          <div className="space-y-8">
            {/* Métricas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total de Logs
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {stats.totalLogs?.toLocaleString()}
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
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Errores
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {stats.errorCount} ({stats.errorPercentage}%)
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
                        <dd className="text-2xl font-bold text-gray-900">
                          {stats.topUsers?.length || 0}
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
                      <Activity className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Acciones Únicas
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {stats.topActions?.length || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Logs por Nivel */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Logs por Nivel</h3>
                  <div className="space-y-3">
                    {stats.logsByLevel?.map((level) => (
                      <div key={level._id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getLevelColor(level._id).replace('text-', 'bg-')}`}></div>
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {level._id}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(level.count / stats.totalLogs) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500 w-12 text-right">
                            {level.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logs por Categoría */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Logs por Categoría</h3>
                  <div className="space-y-3">
                    {stats.logsByCategory?.map((category) => (
                      <div key={category._id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getCategoryColor(category._id).replace('text-', 'bg-')}`}></div>
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {category._id}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(category.count / stats.totalLogs) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500 w-12 text-right">
                            {category.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actividad por Hora */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad por Hora del Día</h3>
                <div className="grid grid-cols-12 gap-1 h-32 items-end">
                  {stats.logsByHour?.map((hour) => (
                    <div key={hour._id} className="flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${(hour.count / Math.max(...stats.logsByHour.map(h => h.count))) * 100}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1">{hour._id}h</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Usuarios Más Activos */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Usuarios Más Activos</h3>
                <div className="space-y-3">
                  {stats.topUsers?.map((user, index) => (
                    <div key={user._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.userInfo?.name || 'Usuario'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.userInfo?.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {user.count} acciones
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatPercentage(user.count, stats.totalLogs)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Acciones Más Frecuentes */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Más Frecuentes</h3>
                <div className="space-y-3">
                  {stats.topActions?.map((action, index) => (
                    <div key={action._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-green-600">{index + 1}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {action._id}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {action.count} veces
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatPercentage(action.count, stats.totalLogs)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default LogStatsPage; 