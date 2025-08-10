import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Eye, EyeOff, Save } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import Select2 from './ui/Select2';
import { roleService } from '../services/roleService';

const EditUserModal = ({ isOpen, onClose, onSave, user }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'cliente',
    isActive: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // Cargar roles cuando el modal se abre
  useEffect(() => {
    if (isOpen && roles.length === 0) {
      loadRoles();
    }
  }, [isOpen]);

  // Actualizar formulario cuando cambie el usuario
  useEffect(() => {
    if (user && isOpen) {
      const newFormData = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'cliente',
        isActive: user.isActive !== undefined ? user.isActive : true
      };
      
      setFormData(newFormData);
      setErrors({});
      
      // Pequeño delay para asegurar que Select2 se actualice correctamente
      setTimeout(() => {
        setFormData(newFormData);
      }, 200);
    }
  }, [user, isOpen]);

  const loadRoles = async () => {
    setLoadingRoles(true);
    try {
      
      const response = await roleService.getPublicRoles();
      
      if (response.success && response.data && response.data.length > 0) {
        // Filtrar el rol 'admin' para que no aparezca en el select
        const filteredRoles = response.data.filter(role => role.name !== 'admin');
        
        const rolesOptions = filteredRoles.map(role => ({
          value: role.name,
          label: role.displayName
        }));
       
        setRoles(rolesOptions);
      } else {
      
        // Si no hay roles en la base de datos, usar roles por defecto
        setRoles([
          { value: 'cliente', label: 'Cliente' },
          { value: 'veterinario', label: 'Veterinario' }
        ]);
      }
    } catch (error) {
      console.error('❌ Error cargando roles públicos para edición:', error);
      // En caso de error, usar roles por defecto
      setRoles([
        { value: 'cliente', label: 'Cliente' },
        { value: 'veterinario', label: 'Veterinario' }
      ]);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'El teléfono no es válido';
    }

    if (!formData.role) {
      newErrors.role = 'El rol es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        isActive: formData.isActive
      };

      await onSave(userData);
      
      // Limpiar formulario
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'cliente',
        isActive: true
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'cliente',
        isActive: true
      });
      setErrors({});
      setRoles([]); // Limpiar roles para que se vuelvan a cargar la próxima vez
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">
                Editar Usuario
              </h3>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre completo"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Juan Pérez"
              required
              disabled={loading}
            />
            
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="juan@ejemplo.com"
              required
              disabled={loading}
            />
            
            <Input
              label="Teléfono"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="+1 (555) 123-4567"
              required
              disabled={loading}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol
              </label>
              <Select2
                options={roles}
                value={formData.role}
                onChange={(value) => handleSelectChange('role', value)}
                placeholder={loadingRoles ? "Cargando roles..." : "Seleccionar rol"}
                disabled={loading || loadingRoles}
                className="w-full"
              />
              {loadingRoles && (
                <p className="mt-1 text-sm text-gray-500">Cargando roles disponibles...</p>
              )}
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleChange}
                disabled={loading}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Usuario activo
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal; 