import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Acceso Denegado
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            No tienes permisos para acceder a esta página.
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Permisos Insuficientes
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    Tu cuenta no tiene los permisos necesarios para ver este contenido. 
                    Contacta al administrador del sistema si crees que esto es un error.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <Link
              to="/dashboard"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Página Anterior
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 