import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Componente para proteger rutas basado en permisos
export const ProtectedRoute = ({ 
  children, 
  requiredPermissions = [], 
  requiredRoles = [], 
  requireAllPermissions = false,
  fallback = null 
}) => {
  const { user, isAuthenticated, hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se requiere roles específicos
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.length === 1 
      ? hasRole(requiredRoles[0])
      : hasAnyRole(requiredRoles);
    
    if (!hasRequiredRole) {
      return fallback || <Navigate to="/unauthorized" replace />;
    }
  }

  // Si se requiere permisos específicos
  if (requiredPermissions.length > 0) {
    let hasRequiredPermissions = false;

    if (requireAllPermissions) {
      hasRequiredPermissions = hasAllPermissions(requiredPermissions);
    } else {
      hasRequiredPermissions = requiredPermissions.length === 1
        ? hasPermission(requiredPermissions[0])
        : hasAnyPermission(requiredPermissions);
    }

    if (!hasRequiredPermissions) {
      return fallback || <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

// Componente para mostrar contenido condicional basado en permisos
export const ConditionalRender = ({ 
  children, 
  requiredPermissions = [], 
  requiredRoles = [], 
  requireAllPermissions = false,
  fallback = null 
}) => {
  const { user, hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole } = useAuth();

  // Si no está autenticado, no mostrar nada
  if (!user) {
    return fallback;
  }

  // Si se requiere roles específicos
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.length === 1 
      ? hasRole(requiredRoles[0])
      : hasAnyRole(requiredRoles);
    
    if (!hasRequiredRole) {
      return fallback;
    }
  }

  // Si se requiere permisos específicos
  if (requiredPermissions.length > 0) {
    let hasRequiredPermissions = false;

    if (requireAllPermissions) {
      hasRequiredPermissions = hasAllPermissions(requiredPermissions);
    } else {
      hasRequiredPermissions = requiredPermissions.length === 1
        ? hasPermission(requiredPermissions[0])
        : hasAnyPermission(requiredPermissions);
    }

    if (!hasRequiredPermissions) {
      return fallback;
    }
  }

  return children;
};

// Hook personalizado para verificar permisos
export const usePermissions = () => {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    hasRole, 
    hasAnyRole,
    user 
  } = useAuth();

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    user,
    isAdmin: user?.role === 'admin'
  };
}; 