import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/permissionService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay un usuario guardado en localStorage al cargar
  useEffect(() => {
    const verifyAuth = async () => {
      const savedUser = localStorage.getItem('veterinaria_user');
      const token = localStorage.getItem('veterinaria_token');
      
      if (savedUser && token) {
        try {
          // Verificar si el token es válido con el backend
          const response = await authService.verifyToken();
          setUser(response.user);
          localStorage.setItem('veterinaria_user', JSON.stringify(response.user));
        } catch (error) {
          console.log('Token inválido o expirado, limpiando datos...');
          localStorage.removeItem('veterinaria_user');
          localStorage.removeItem('veterinaria_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  // Función de login
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authService.login({ email, password });
      
      setUser(response.user);
      localStorage.setItem('veterinaria_user', JSON.stringify(response.user));
      localStorage.setItem('veterinaria_token', response.token);
      
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Error al iniciar sesión');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función de registro
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authService.register(userData);
      
      setUser(response.user);
      localStorage.setItem('veterinaria_user', JSON.stringify(response.user));
      localStorage.setItem('veterinaria_token', response.token);
      
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Error al registrarse');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      // Llamar al backend para registrar el logout
      await authService.logout();
    } catch (error) {
      console.log('Error al registrar logout en el backend:', error);
      // Continuar con el logout local aunque falle el backend
    } finally {
      // Limpiar datos locales
      setUser(null);
      localStorage.removeItem('veterinaria_user');
      localStorage.removeItem('veterinaria_token');
      setError(null);
    }
  };

  // Función para actualizar perfil
  const updateProfile = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('veterinaria_user', JSON.stringify(updatedUser));
  };

  // Función para verificar si el usuario tiene un permiso específico
  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Los admins tienen todos los permisos
    if (user.role === 'admin') return true;
    
    // Verificar si el usuario tiene el permiso específico
    return user.permissions && user.permissions.includes(permission);
  };

  // Función para verificar si el usuario tiene al menos uno de los permisos
  const hasAnyPermission = (permissions) => {
    if (!user) return false;
    
    // Los admins tienen todos los permisos
    if (user.role === 'admin') return true;
    
    return user.permissions && permissions.some(permission => 
      user.permissions.includes(permission)
    );
  };

  // Función para verificar si el usuario tiene todos los permisos
  const hasAllPermissions = (permissions) => {
    if (!user) return false;
    
    // Los admins tienen todos los permisos
    if (user.role === 'admin') return true;
    
    return user.permissions && permissions.every(permission => 
      user.permissions.includes(permission)
    );
  };

  // Función para verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  // Función para verificar si el usuario tiene al menos uno de los roles
  const hasAnyRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 