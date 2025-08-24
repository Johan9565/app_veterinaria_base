import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import Button from './Button';

const ErrorModal = ({ isOpen, onClose, error, title = 'Error' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0] bg-[#F5F5F5]">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#4CAF50] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Error message */}
            <div className="text-gray-700">
              {typeof error === 'string' ? (
                <p>{error}</p>
              ) : error?.message ? (
                <p>{error.message}</p>
              ) : error?.errors ? (
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">Se encontraron los siguientes errores:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {error.errors.map((err, index) => (
                      <li key={index} className="text-red-600">
                        {err.msg}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.</p>
              )}
            </div>

            {/* Additional details for debugging */}
            {process.env.NODE_ENV === 'development' && error?.details && (
              <details className="text-xs text-gray-500 border-t pt-4">
                <summary className="cursor-pointer hover:text-gray-700">
                  Detalles técnicos
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                  {JSON.stringify(error.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-[#E2E8F0] bg-[#F5F5F5]">
          <Button
            type="button"
            variant="primary"
            onClick={onClose}
          >
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal; 