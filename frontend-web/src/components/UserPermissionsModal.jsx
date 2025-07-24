import { useState, useEffect } from 'react';
import { Shield, X, Save, RefreshCw } from 'lucide-react';
import { permissionService } from '../services/permissionService';

const UserPermissionsModal = ({ user, isOpen, onClose, onSave }) => {
  const [permissions, setPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      loadPermissions();
      loadUserPermissions();
    }
  }, [isOpen, user]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const response = await permissionService.getAllPermissions();
      setPermissions(response.permissions);
    } catch (error) {
      setError('Error cargando permisos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPermissions = async () => {
    try {
      const response = await permissionService.getUserPermissions(user._id);
      setUserPermissions(response.permissions || []);
    } catch (error) {
      setError('Error cargando permisos del usuario: ' + error.message);
    }
  };

  const handlePermissionToggle = (permission) => {
    setUserPermissions(prev => {
      const isSelected = prev.includes(permission);
      if (isSelected) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await permissionService.assignPermissionsToUser(user._id, userPermissions);
      onSave && onSave(userPermissions);
      onClose();
    } catch (error) {
      setError('Error guardando permisos: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('¿Estás seguro de que quieres resetear los permisos del usuario?')) {
      try {
        setSaving(true);
        await permissionService.resetUserPermissions(user._id);
        await loadUserPermissions();
        alert('Permisos reseteados exitosamente');
      } catch (error) {
        setError('Error reseteando permisos: ' + error.message);
      } finally {
        setSaving(false);
      }
    }
  };

  const groupPermissionsByCategory = (perms) => {
    const grouped = {};
    perms.forEach(perm => {
      if (!grouped[perm.category]) {
        grouped[perm.category] = [];
      }
      grouped[perm.category].push(perm);
    });
    return grouped;
  };

  const groupedPermissions = groupPermissionsByCategory(permissions);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Gestionar Permisos - {user?.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
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

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Email: <span className="font-medium">{user?.email}</span>
              </p>
              <p className="text-sm text-gray-600">
                Rol: <span className="font-medium capitalize">{user?.role}</span>
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={loadUserPermissions}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              <button
                onClick={handleReset}
                disabled={saving}
                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                Resetear
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
              <div key={category} className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3 capitalize">
                  {category}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryPermissions.map((permission) => (
                    <label
                      key={permission._id}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={userPermissions.includes(permission.name)}
                        onChange={() => handlePermissionToggle(permission.name)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {permission.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {permission.name}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPermissionsModal; 