import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from './ProtectedRoute';
import { LogOut, User, Settings, Bell, Users, Shield, Home, FileText } from 'lucide-react';
import Button from './ui/Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getActiveClass = (path) => {
    return isActive(path) 
      ? 'bg-blue-100 text-blue-700 border-blue-500' 
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent';
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y navegación principal */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">Veterinaria App</h1>
            </div>

            {/* Navegación */}
            <nav className="hidden md:flex space-x-1">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium border-b-2 transition-colors ${getActiveClass('/dashboard')}`}
              >
                <div className="flex items-center space-x-2">
                  <Home size={16} />
                  <span>Dashboard</span>
                </div>
              </Link>

              {/* Enlaces de administración */}
              {(user?.role === 'admin' || hasPermission('users.view')) && (
                <Link
                  to="/admin/users"
                  className={`px-3 py-2 rounded-md text-sm font-medium border-b-2 transition-colors ${getActiveClass('/admin/users')}`}
                >
                  <div className="flex items-center space-x-2">
                    <Users size={16} />
                    <span>Usuarios</span>
                  </div>
                </Link>
              )}

              {(user?.role === 'admin' || hasPermission('permissions.view')) && (
                <Link
                  to="/admin/permissions"
                  className={`px-3 py-2 rounded-md text-sm font-medium border-b-2 transition-colors ${getActiveClass('/admin/permissions')}`}
                >
                  <div className="flex items-center space-x-2">
                    <Shield size={16} />
                    <span>Permisos</span>
                  </div>
                </Link>
              )}

              {(user?.role === 'admin' || hasPermission('logs.view')) && (
                <Link
                  to="/admin/logs"
                  className={`px-3 py-2 rounded-md text-sm font-medium border-b-2 transition-colors ${getActiveClass('/admin/logs')}`}
                >
                  <div className="flex items-center space-x-2">
                    <FileText size={16} />
                    <span>Logs</span>
                  </div>
                </Link>
              )}
            </nav>
          </div>
          
          {/* Acciones del usuario */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Bell size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Settings size={20} />
            </button>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-1"
              >
                <LogOut size={16} />
                <span>Cerrar sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 