import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Users, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¡Bienvenido, {user?.name}!
              </h2>
              <p className="text-gray-600 mb-6">
                Has iniciado sesión como <span className="font-semibold text-blue-600">{user?.role}</span>
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Perfil</h3>
                  <p className="text-gray-600 text-sm">Gestiona tu información personal</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Citas</h3>
                  <p className="text-gray-600 text-sm">Programa y gestiona tus citas</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Mascotas</h3>
                  <p className="text-gray-600 text-sm">Administra las mascotas registradas</p>
                </div>
              </div>

              {/* Enlaces de administración para admins */}
             
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Panel de Administración</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(user?.role === 'admin' || user?.permissions?.includes('users.view')) && (
                    <Link
                      to="/admin/users"
                      className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Gestión de Usuarios</h4>
                          <p className="text-sm text-gray-500">Administra usuarios del sistema</p>
                        </div>
                      </div>
                    </Link>
              )}
                    {}
                    <Link
                      to="/admin/permissions"
                      className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Shield size={20} className="text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Gestión de Permisos</h4>
                          <p className="text-sm text-gray-500">Asigna y gestiona permisos</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Esta es una versión de desarrollo. Las funcionalidades completas se implementarán próximamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export de