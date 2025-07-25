import { useState, useEffect } from 'react';
import { logService } from '../../services/logService';
import { usePermissions } from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
import { 
  FileText, 
  AlertTriangle, 
  Users, 
  Activity, 
  Filter, 
  Download, 
  Trash2, 
  RefreshCw, 
  Search,
  Calendar,
  Clock,
  User,
  Globe,
  Monitor,
  Shield,
  Database,
  Settings,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  Eye,
  EyeOff,
  PieChart
} from 'lucide-react';

const LogsPage = () => {
  const { hasPermission, isAdmin } = usePermissions();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  // Filtros
  const [filters, setFilters] = useState({
    level: '',
    category: '',
    action: '',
    userId: '',
    userRole: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  // Estados de UI
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showLogDetails, setShowLogDetails] = useState(false);

  // Categorías y niveles disponibles
  const categories = [
    { id: 'auth', name: 'Autenticación', icon: Shield, color: 'text-blue-600' },
    { id: 'user', name: 'Usuarios', icon: Users, color: 'text-green-600' },
    { id: 'pet', name: 'Mascotas', icon: Activity, color: 'text-purple-600' },
    { id: 'appointment', name: 'Citas', icon: Calendar, color: 'text-orange-600' },
    { id: 'veterinary', name: 'Veterinarias', icon: Monitor, color: 'text-indigo-600' },
    { id: 'permission', name: 'Permisos', icon: Settings, color: 'text-red-600' },
    { id: 'system', name: 'Sistema', icon: Database, color: 'text-gray-600' },
    { id: 'api', name: 'API', icon: Globe, color: 'text-cyan-600' }
  ];

  const levels = [
    { id: 'info', name: 'Información', icon: Info, color: 'text-blue-500', bgColor: 'bg-blue-100' },
    { id: 'warning', name: 'Advertencia', icon: AlertTriangle, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
    { id: 'error', name: 'Error', icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-100' },
    { id: 'debug', name: 'Debug', icon: Eye, color: 'text-gray-500', bgColor: 'bg-gray-100' },
    { id: 'security', name: 'Seguridad', icon: Shield, color: 'text-purple-500', bgColor: 'bg-purple-100' }
  ];

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [pagination.page, filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const response = await logService.getLogs(params);
      setLogs(response.data.logs);
      setPagination(response.data.pagination);
    } catch (error) {
      setError('Error cargando logs');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await logService.getLogStats(filters);
      setStats(response.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset a primera página
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleExport = async () => {
    try {
      const blob = await logService.exportLogs(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exportando logs:', error);
    }
  };

  const handleCleanLogs = async () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar los logs antiguos? Esta acción no se puede deshacer.')) {
      try {
        await logService.cleanOldLogs(90);
        loadLogs();
        loadStats();
      } catch (error) {
        console.error('Error limpiando logs:', error);
      }
    }
  };

  const getLevelInfo = (level) => {
    return levels.find(l => l.id === level) || levels[0];
  };

  const getCategoryInfo = (category) => {
    return categories.find(c => c.id === category) || categories[0];
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-ES');
  };

  const formatResponseTime = (time) => {
    if (time < 100) return `${time}ms`;
    if (time < 1000) return `${(time / 1000).toFixed(1)}s`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  if (!hasPermission('logs.view')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Acceso denegado</h3>
          <p className="mt-1 text-sm text-gray-500">
            No tienes permisos para ver los logs del sistema.
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
          <h1 className="text-3xl font-bold text-gray-900">Logs del Sistema</h1>
          <p className="mt-2 text-gray-600">
            Monitoreo y análisis de la actividad del sistema veterinario
          </p>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total de Logs
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
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
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Errores
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
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
                      <dd className="text-lg font-medium text-gray-900">
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
                        Tipos de acciones realizadas
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.topActions?.length || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros y Acciones */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </button>
                
                <button
                  onClick={loadLogs}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </button>

                <a
                  href="/admin/logs/stats"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200"
                >
                  <PieChart className="h-4 w-4 mr-2" />
                  Estadísticas
                </a>
              </div>

              <div className="flex items-center gap-2">
                {hasPermission('logs.export') && (
                  <button
                    onClick={handleExport}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </button>
                )}
                
                {hasPermission('logs.manage') && (
                  <button
                    onClick={handleCleanLogs}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpiar Logs
                  </button>
                )}
              </div>
            </div>

            {/* Filtros expandibles */}
            {showFilters && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    {levels.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
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
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Búsqueda
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Buscar en mensajes..."
                      className="w-full pl-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

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
                    Límite por página
                  </label>
                  <select
                    value={pagination.limit}
                    onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabla de Logs */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Cargando logs...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Logs del Sistema ({pagination.total?.toLocaleString()} registros)
                </h3>
              </div>

              <ul className="divide-y divide-gray-200">
                {logs.map((log) => {
                  const levelInfo = getLevelInfo(log.level);
                  const categoryInfo = getCategoryInfo(log.category);
                  const CategoryIcon = categoryInfo.icon;
                  const LevelIcon = levelInfo.icon;

                  return (
                    <li key={log.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedLog(log);
                          setShowLogDetails(true);
                        }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${levelInfo.bgColor}`}>
                            <LevelIcon className={`h-4 w-4 ${levelInfo.color}`} />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <CategoryIcon className={`h-4 w-4 ${categoryInfo.color}`} />
                            <span className="text-sm font-medium text-gray-900">
                              {categoryInfo.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelInfo.bgColor} ${levelInfo.color}`}>
                            {levelInfo.name}
                          </span>
                          <span>{formatTimestamp(log.timestamp)}</span>
                        </div>
                      </div>

                      <div className="mt-2">
                        <p className="text-sm text-gray-900">{log.message}</p>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-400">
                          {log.user && (
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {log.user.name} ({log.user.role})
                            </span>
                          )}
                          {log.ipAddress && (
                            <span className="flex items-center">
                              <Globe className="h-3 w-3 mr-1" />
                              {log.ipAddress}
                            </span>
                          )}
                          {log.responseTime && (
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatResponseTime(log.responseTime)}
                            </span>
                          )}
                          {log.statusCode && (
                            <span className={`px-2 py-1 rounded text-xs ${
                              log.statusCode >= 400 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {log.statusCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Paginación */}
              {pagination.pages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <span className="px-3 py-2 text-sm text-gray-700">
                        Página {pagination.page} de {pagination.pages}
                      </span>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal de Detalles del Log */}
        {showLogDetails && selectedLog && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detalles del Log</h3>
                <button
                  onClick={() => setShowLogDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <EyeOff className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mensaje</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.message}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nivel</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.level}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Categoría</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Acción</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.action}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="mt-1 text-sm text-gray-900">{formatTimestamp(selectedLog.timestamp)}</p>
                  </div>
                </div>

                {selectedLog.user && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Usuario</label>
                    <div className="mt-1 text-sm text-gray-900">
                      <p>Nombre: {selectedLog.user.name}</p>
                      <p>Email: {selectedLog.user.email}</p>
                      <p>Rol: {selectedLog.user.role}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IP Address</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.ipAddress || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Método</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.method || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.url || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status Code</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.statusCode || 'N/A'}</p>
                  </div>
                </div>

                {selectedLog.responseTime && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tiempo de Respuesta</label>
                    <p className="mt-1 text-sm text-gray-900">{formatResponseTime(selectedLog.responseTime)}</p>
                  </div>
                )}

                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Metadata</label>
                    <pre className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsPage; 