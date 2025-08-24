import React, { useState } from 'react';
import Button from './ui/Button';

const PetDetailModal = ({ pet, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('general');

  if (!pet) {
    return null;
  }

  // Formatear especie
  const formatSpecies = (species) => {
    const speciesMap = {
      'perro': 'Perro',
      'gato': 'Gato',
      'ave': 'Ave',
      'reptil': 'Reptil',
      'roedor': 'Roedor',
      'conejo': 'Conejo',
      'caballo': 'Caballo',
      'otro': 'Otro'
    };
    return speciesMap[species] || species;
  };

  // Formatear estado de salud
  const getHealthStatusBadge = (status) => {
    const statusConfig = {
      'excelente': {
        label: 'Excelente',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        dotColor: 'bg-green-500'
      },
      'bueno': {
        label: 'Bueno',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        dotColor: 'bg-blue-500'
      },
      'regular': {
        label: 'Regular',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200',
        dotColor: 'bg-yellow-500'
      },
      'malo': {
        label: 'Malo',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-200',
        dotColor: 'bg-orange-500'
      },
      'crítico': {
        label: 'Crítico',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        dotColor: 'bg-red-500'
      }
    };

    const config = statusConfig[status] || statusConfig['bueno'];

    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
        <div className={`w-2 h-2 rounded-full mr-2 ${config.dotColor}`}></div>
        {config.label}
      </span>
    );
  };

  // Calcular edad
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    if (age === 0) {
      const months = Math.floor((today - birth) / (1000 * 60 * 60 * 24 * 30));
      return `${months} mes${months !== 1 ? 'es' : ''}`;
    }
    
    return `${age} año${age !== 1 ? 's' : ''}`;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Tabs disponibles
  const tabs = [
    { id: 'general', label: 'Información General', icon: '📋' },
    { id: 'medical', label: 'Historial Médico', icon: '🏥' },
    { id: 'vaccinations', label: 'Vacunas', icon: '💉' },
    { id: 'medications', label: 'Medicamentos', icon: '💊' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-bounceIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{pet.name}</h2>
              <p className="text-sm text-gray-600">
                {formatSpecies(pet.species)} • {pet.gender === 'macho' ? 'Macho' : 'Hembra'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all duration-200 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 animate-fadeIn">
                     {/* Información General */}
           {activeTab === 'general' && (
            
             <div className="space-y-8 animate-slideIn">
               {/* Información Principal */}
               <div className="bg-gradient-to-r from-[#A8E6CF] to-[#81D4FA] rounded-lg p-6 text-white grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Columna de la imagen */}
                 <div className="md:col-span-1">
                   <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                     
                     {pet.photo?.url ? (
                       <div className="relative">
                         <img 
                           src={pet.photo.url} 
                           alt={`Foto de ${pet.name}`}
                           className="w-full h-64 object-cover rounded-lg shadow-md"
                         />
                         <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                           {pet.name}
                         </div>
                       </div>
                     ) : (
                       <div className="w-full h-64 bg-gradient-to-br from-[#A8E6CF] to-[#81D4FA] rounded-lg flex flex-col items-center justify-center text-white">
                         <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                           <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                           </svg>
                         </div>
                         <p className="text-lg font-semibold">{pet.name}</p>
                         <p className="text-sm text-white text-opacity-80">
                           {formatSpecies(pet.species)} • {pet.gender === 'macho' ? 'Macho' : 'Hembra'}
                         </p>
                         <p className="text-sm text-white text-opacity-80 mt-1">
                           {calculateAge(pet.birthDate)}
                         </p>
                       </div>
                     )}
                   </div>
                 </div>
                 {/* Columna de información resumida */}
                 <div className="md:col-span-2 flex flex-col justify-center">
                   {/* Encabezado con nombre y datos principales */}
                   <div className="flex items-center space-x-4 mb-6">
                     <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                       <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                       </svg>
                     </div>
                     <div>
                       <h2 className="text-2xl font-bold">{pet.name}</h2>
                       <div className="flex flex-wrap items-center gap-2 text-white text-opacity-90 text-sm mt-1">
                         <span>{formatSpecies(pet.species)}</span>
                         <span>•</span>
                         <span>{pet.gender === 'macho' ? 'Macho' : 'Hembra'}</span>
                         <span>•</span>
                         <span>{calculateAge(pet.birthDate)}</span>
                         {pet.breed && (
                           <>
                             <span>•</span>
                             <span>{pet.breed}</span>
                           </>
                         )}
                       </div>
                     </div>
                   </div>
                   {/* Información resumida organizada */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div className="text-center">
                       <div className="text-2xl font-bold">{pet.weight?.value ?? '-'}</div>
                       <div className="text-sm text-white text-opacity-80">{pet.weight?.unit ?? 'Peso'}</div>
                     </div>
                     <div className="text-center">
                       <div className="text-2xl font-bold">{pet.isNeutered ? 'Sí' : 'No'}</div>
                       <div className="text-sm text-white text-opacity-80">Esterilizado</div>
                     </div>
                     <div className="text-center">
                       <div className="text-2xl font-bold">{pet.breed ? pet.breed : 'No'}</div>
                       <div className="text-sm text-white text-opacity-80">Raza</div>
                     </div>
                     <div className="text-center">
                       <div className="text-2xl font-bold">{pet.color ? pet.color : '-'}</div>
                       <div className="text-sm text-white text-opacity-80">Color</div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Información Detallada */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Información Básica */}
                 <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                   <div className="flex items-center space-x-2 mb-4">
                     <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                       <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                       </svg>
                     </div>
                     <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
                   </div>
                   
                   <div className="space-y-3">
                     <div className="flex justify-between items-center py-2 border-b border-gray-100">
                       <span className="text-sm font-medium text-gray-600">Nombre completo</span>
                       <span className="text-sm text-gray-900 font-medium">{pet.name}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-gray-100">
                       <span className="text-sm font-medium text-gray-600">Especie</span>
                       <span className="text-sm text-gray-900">{formatSpecies(pet.species)}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-gray-100">
                       <span className="text-sm font-medium text-gray-600">Raza</span>
                       <span className="text-sm text-gray-900">{pet.breed || 'No especificada'}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-gray-100">
                       <span className="text-sm font-medium text-gray-600">Género</span>
                       <span className="text-sm text-gray-900">{pet.gender === 'macho' ? 'Macho' : 'Hembra'}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-gray-100">
                       <span className="text-sm font-medium text-gray-600">Color</span>
                       <span className="text-sm text-gray-900">{pet.color || 'No especificado'}</span>
                     </div>
                     <div className="flex justify-between items-center py-2">
                       <span className="text-sm font-medium text-gray-600">Fecha de nacimiento</span>
                       <span className="text-sm text-gray-900">{formatDate(pet.birthDate)}</span>
                     </div>
                   </div>
                 </div>

                 {/* Información Médica */}
                 <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                   <div className="flex items-center space-x-2 mb-4">
                     <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                       <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                       </svg>
                     </div>
                     <h3 className="text-lg font-semibold text-gray-900">Estado de Salud</h3>
                   </div>
                   
                   <div className="space-y-4">
                     <div className="flex justify-between items-center">
                       <span className="text-sm font-medium text-gray-600">Estado actual</span>
                       {getHealthStatusBadge(pet.healthStatus)}
                     </div>
                     
                     <div className="space-y-3">
                       <div className="flex justify-between items-center py-2 border-b border-gray-100">
                         <span className="text-sm font-medium text-gray-600">Esterilizado</span>
                         <span className={`text-sm font-medium ${pet.isNeutered ? 'text-green-600' : 'text-gray-500'}`}>
                           {pet.isNeutered ? 'Sí' : 'No'}
                         </span>
                       </div>
                       {pet.isNeutered && pet.neuteredDate && (
                         <div className="flex justify-between items-center py-2 border-b border-gray-100">
                           <span className="text-sm font-medium text-gray-600">Fecha esterilización</span>
                           <span className="text-sm text-gray-900">{formatDate(pet.neuteredDate)}</span>
                         </div>
                       )}
                       {pet.microchip?.number && (
                         <div className="flex justify-between items-center py-2 border-b border-gray-100">
                           <span className="text-sm font-medium text-gray-600">Microchip</span>
                           <span className="text-sm text-gray-900 font-mono">{pet.microchip.number}</span>
                         </div>
                       )}
                       {pet.microchip?.implantedDate && (
                         <div className="flex justify-between items-center py-2">
                           <span className="text-sm font-medium text-gray-600">Fecha implantación</span>
                           <span className="text-sm text-gray-900">{formatDate(pet.microchip.implantedDate)}</span>
                         </div>
                       )}
                     </div>

                     {/* Alergias */}
                     {pet.allergies && pet.allergies.length > 0 && (
                       <div className="mt-4 pt-4 border-t border-gray-200">
                         <h4 className="text-sm font-semibold text-gray-900 mb-2">Alergias conocidas</h4>
                         <div className="flex flex-wrap gap-2">
                           {pet.allergies.map((allergy, index) => (
                             <span key={index} className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                               {allergy}
                             </span>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>
                 </div>

                 {/* Información del Propietario */}
                 <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                   <div className="flex items-center space-x-2 mb-4">
                     <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                       <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                       </svg>
                     </div>
                     <h3 className="text-lg font-semibold text-gray-900">Propietario</h3>
                   </div>
                   
                   <div className="space-y-3">
                     <div className="flex justify-between items-center py-2 border-b border-gray-100">
                       <span className="text-sm font-medium text-gray-600">Nombre</span>
                       <span className="text-sm text-gray-900 font-medium">{pet.owner?.name || 'No especificado'}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-gray-100">
                       <span className="text-sm font-medium text-gray-600">Email</span>
                       <span className="text-sm text-gray-900">{pet.owner?.email || 'No especificado'}</span>
                     </div>
                     <div className="flex justify-between items-center py-2">
                       <span className="text-sm font-medium text-gray-600">Teléfono</span>
                       <span className="text-sm text-gray-900">{pet.owner?.phone || 'No especificado'}</span>
                     </div>
                   </div>
                 </div>
               </div>

                             {/* Información Adicional */}
               {(pet.emergencyContact?.name || pet.veterinary?.name || pet.notes) && (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   {/* Contacto de Emergencia */}
                   {pet.emergencyContact?.name && (
                     <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                       <div className="flex items-center space-x-2 mb-4">
                         <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                           <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                           </svg>
                         </div>
                         <h3 className="text-lg font-semibold text-gray-900">Contacto de Emergencia</h3>
                       </div>
                       
                       <div className="space-y-3">
                         <div className="flex justify-between items-center py-2 border-b border-gray-100">
                           <span className="text-sm font-medium text-gray-600">Nombre</span>
                           <span className="text-sm text-gray-900 font-medium">{pet.emergencyContact.name}</span>
                         </div>
                         <div className="flex justify-between items-center py-2 border-b border-gray-100">
                           <span className="text-sm font-medium text-gray-600">Teléfono</span>
                           <span className="text-sm text-gray-900">{pet.emergencyContact.phone}</span>
                         </div>
                         <div className="flex justify-between items-center py-2">
                           <span className="text-sm font-medium text-gray-600">Relación</span>
                           <span className="text-sm text-gray-900">{pet.emergencyContact.relationship}</span>
                         </div>
                       </div>
                     </div>
                   )}

                   {/* Veterinaria */}
                   {pet.veterinary?.name && (
                     <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                       <div className="flex items-center space-x-2 mb-4">
                         <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                           <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                           </svg>
                         </div>
                         <h3 className="text-lg font-semibold text-gray-900">Veterinaria</h3>
                       </div>
                       
                       <div className="space-y-3">
                         <div className="flex justify-between items-center py-2 border-b border-gray-100">
                           <span className="text-sm font-medium text-gray-600">Nombre</span>
                           <span className="text-sm text-gray-900 font-medium">{pet.veterinary.name}</span>
                         </div>
                         <div className="flex justify-between items-center py-2 border-b border-gray-100">
                           <span className="text-sm font-medium text-gray-600">Dirección</span>
                           <span className="text-sm text-gray-900">{pet.veterinary.address || 'No especificada'}</span>
                         </div>
                         <div className="flex justify-between items-center py-2">
                           <span className="text-sm font-medium text-gray-600">Teléfono</span>
                           <span className="text-sm text-gray-900">{pet.veterinary.phone || 'No especificado'}</span>
                         </div>
                       </div>
                     </div>
                   )}

                   {/* Notas */}
                   {pet.notes && (
                     <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                       <div className="flex items-center space-x-2 mb-4">
                         <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                           <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                           </svg>
                         </div>
                         <h3 className="text-lg font-semibold text-gray-900">Notas</h3>
                       </div>
                       
                       <div className="bg-yellow-50 rounded-lg p-4">
                         <p className="text-sm text-gray-900 leading-relaxed">{pet.notes}</p>
                       </div>
                     </div>
                   )}
                 </div>
               )}
            </div>
          )}

          {/* Historial Médico */}
          {activeTab === 'medical' && (
            <div className="space-y-4 animate-slideIn">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Historial Médico
              </h3>
              
              {pet.medicalHistory && pet.medicalHistory.length > 0 ? (
                <div className="space-y-4">
                  {pet.medicalHistory.map((record, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 hover:scale-[1.02]">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">{record.type}</h4>
                          <p className="text-sm text-gray-500">{formatDate(record.date)}</p>
                        </div>
                        {record.cost && (
                          <span className="text-sm font-medium text-green-600">
                            ${record.cost}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-gray-700"><strong>Descripción:</strong> {record.description}</p>
                        {record.diagnosis && (
                          <p className="text-sm text-gray-700"><strong>Diagnóstico:</strong> {record.diagnosis}</p>
                        )}
                        {record.treatment && (
                          <p className="text-sm text-gray-700"><strong>Tratamiento:</strong> {record.treatment}</p>
                        )}
                        {record.veterinarian && (
                          <p className="text-sm text-gray-700"><strong>Veterinario:</strong> {record.veterinarian}</p>
                        )}
                        {record.followUpDate && (
                          <p className="text-sm text-gray-700"><strong>Próxima cita:</strong> {formatDate(record.followUpDate)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay historial médico</h3>
                  <p className="mt-1 text-sm text-gray-500">No se han registrado visitas médicas para esta mascota.</p>
                </div>
              )}
            </div>
          )}

          {/* Vacunas */}
          {activeTab === 'vaccinations' && (
            <div className="space-y-4 animate-slideIn">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Vacunas
              </h3>
              
              {pet.vaccinations && pet.vaccinations.length > 0 ? (
                <div className="space-y-4">
                  {pet.vaccinations.map((vaccination, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 hover:scale-[1.02]">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{vaccination.name}</h4>
                          <p className="text-sm text-gray-500">Aplicada: {formatDate(vaccination.date)}</p>
                        </div>
                        {vaccination.nextDueDate && (
                          <div className="text-right">
                            <span className="text-sm font-medium text-blue-600">Próxima dosis:</span>
                            <p className="text-sm text-gray-500">{formatDate(vaccination.nextDueDate)}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {vaccination.veterinarian && (
                          <p className="text-sm text-gray-700"><strong>Veterinario:</strong> {vaccination.veterinarian}</p>
                        )}
                        {vaccination.notes && (
                          <p className="text-sm text-gray-700"><strong>Notas:</strong> {vaccination.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay vacunas registradas</h3>
                  <p className="mt-1 text-sm text-gray-500">No se han registrado vacunas para esta mascota.</p>
                </div>
              )}
            </div>
          )}

          {/* Medicamentos */}
          {activeTab === 'medications' && (
            <div className="space-y-4 animate-slideIn">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Medicamentos
              </h3>
              
              {pet.medications && pet.medications.length > 0 ? (
                <div className="space-y-4">
                  {pet.medications.map((medication, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 hover:scale-[1.02]">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{medication.name}</h4>
                          <p className="text-sm text-gray-500">Iniciado: {formatDate(medication.startDate)}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          medication.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {medication.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {medication.dosage && (
                          <p className="text-sm text-gray-700"><strong>Dosis:</strong> {medication.dosage}</p>
                        )}
                        {medication.frequency && (
                          <p className="text-sm text-gray-700"><strong>Frecuencia:</strong> {medication.frequency}</p>
                        )}
                        {medication.endDate && (
                          <p className="text-sm text-gray-700"><strong>Fecha de finalización:</strong> {formatDate(medication.endDate)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay medicamentos registrados</h3>
                  <p className="mt-1 text-sm text-gray-500">No se han registrado medicamentos para esta mascota.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PetDetailModal; 