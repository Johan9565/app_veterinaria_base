import React, { useEffect, useRef } from 'react';

const Select2 = ({ 
  label,
  options = [], 
  value, 
  onChange, 
  placeholder = 'Seleccionar...',
  disabled = false,
  className = '',
  multiple = false,
  allowClear = true,
  error,
  ...props 
}) => {
  const selectRef = useRef(null);
  const select2Ref = useRef(null);

  useEffect(() => {
    // Pequeño delay para asegurar que jQuery y Select2 estén cargados
    const timer = setTimeout(() => {
      if (selectRef.current && window.jQuery && window.jQuery.fn.select2) {
        // Inicializar Select2
        const $select = window.jQuery(selectRef.current);
        
        // Verificar si ya tiene Select2 inicializado
        if (select2Ref.current) {
          try {
            // Verificar si el elemento tiene Select2 antes de destruirlo
            if (select2Ref.current.hasClass('select2-hidden-accessible')) {
              select2Ref.current.select2('destroy');
            }
          } catch (e) {
            console.warn('Error al destruir Select2:', e);
          }
        }

        // Verificar que el elemento existe y no tiene Select2 ya inicializado
        if ($select.length && !$select.hasClass('select2-hidden-accessible')) {
          // Configurar Select2
          $select.select2({
            placeholder: placeholder,
            allowClear: allowClear,
            multiple: multiple,
            disabled: disabled,
            width: '100%',
            language: {
              noResults: () => 'No se encontraron resultados',
              searching: () => 'Buscando...',
              inputTooShort: () => 'Por favor ingresa más caracteres'
            }
          });

          // Guardar referencia
          select2Ref.current = $select;

          // Establecer el valor inicial después de la inicialización
          if (value !== undefined && value !== null) {
            if (multiple) {
              const newValue = Array.isArray(value) ? value : [];
              $select.val(newValue).trigger('change');
            } else {
              $select.val(value || '').trigger('change');
            }
          }

          // Evento de cambio
          $select.on('select2:select select2:unselect', (e) => {
            const selectedValues = multiple ? $select.val() : $select.val();
            onChange?.(selectedValues);
          });

          // Evento de clear
          $select.on('select2:clear', () => {
            onChange?.(multiple ? [] : '');
          });
        }
      }
    }, 100);

    // Limpiar al desmontar
    return () => {
      clearTimeout(timer);
      if (select2Ref.current) {
        try {
          // Verificar si el elemento existe y tiene Select2 antes de destruirlo
          if (select2Ref.current.length && select2Ref.current.hasClass('select2-hidden-accessible')) {
            select2Ref.current.off('select2:select select2:unselect select2:clear');
            select2Ref.current.select2('destroy');
          }
        } catch (e) {
          console.warn('Error al limpiar Select2:', e);
        }
      }
    };
  }, [placeholder, allowClear, multiple, disabled, options]); // Agregamos options como dependencia

  // Actualizar valor cuando cambie
  useEffect(() => {
    if (select2Ref.current && window.jQuery && select2Ref.current.hasClass('select2-hidden-accessible')) {
      try {
        const $select = select2Ref.current;
        const currentValue = $select.val();
        
        console.log('Select2 - Actualizando valor:', { currentValue, newValue: value, multiple, options: options.length });
        
        // Verificar que el valor existe en las opciones antes de establecerlo
        if (value && value !== '') {
          const valueExists = options.some(opt => opt.value === value);
          if (!valueExists) {
            console.warn('El valor no existe en las opciones:', value, 'Opciones disponibles:', options);
            return;
          }
        }
        
        if (multiple) {
          const newValue = Array.isArray(value) ? value : [];
          if (JSON.stringify(currentValue) !== JSON.stringify(newValue)) {
            $select.val(newValue).trigger('change');
          }
        } else {
          if (currentValue !== value) {
            $select.val(value || '').trigger('change');
          }
        }
      } catch (e) {
        console.warn('Error actualizando valor Select2:', e);
      }
    }
  }, [value, multiple, options]);

  // Forzar actualización cuando las opciones cambien
  useEffect(() => {
    if (select2Ref.current && window.jQuery && select2Ref.current.hasClass('select2-hidden-accessible')) {
      try {
        const $select = select2Ref.current;
        
        // Pequeño delay para asegurar que las opciones se hayan actualizado
        setTimeout(() => {
          if (value && value !== '') {
            console.log('Forzando actualización de valor después de cambio de opciones:', value);
            $select.val(value).trigger('change');
          }
        }, 50);
      } catch (e) {
        console.warn('Error forzando actualización Select2:', e);
      }
    }
  }, [options, value]);

  // Actualizar opciones cuando cambien
  useEffect(() => {
    if (select2Ref.current && window.jQuery && select2Ref.current.hasClass('select2-hidden-accessible')) {
      try {
        const $select = select2Ref.current;
        const currentOptions = $select.find('option').map(function() {
          return { value: this.value, text: this.text };
        }).get();
        
        const newOptions = options.map(opt => ({
          value: opt.value,
          text: opt.label || opt.text
        }));

        if (JSON.stringify(currentOptions) !== JSON.stringify(newOptions)) {
          // Limpiar opciones existentes
          $select.empty();
          
          // Agregar placeholder si no es múltiple
          if (!multiple && placeholder) {
            $select.append(new window.jQuery('<option></option>'));
          }
          
          // Agregar nuevas opciones
          newOptions.forEach(option => {
            $select.append(new window.jQuery('<option></option>')
              .val(option.value)
              .text(option.text));
          });
          
          // Restablecer el valor después de actualizar las opciones
          if (value !== undefined && value !== null) {
            if (multiple) {
              const newValue = Array.isArray(value) ? value : [];
              $select.val(newValue).trigger('change');
            } else {
              $select.val(value || '').trigger('change');
            }
          }
          
          // Actualizar Select2
          $select.trigger('change');
        }
      } catch (e) {
        console.warn('Error actualizando opciones Select2:', e);
      }
    }
  }, [options, multiple, placeholder, value]);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        ref={selectRef}
        className={`select2-custom ${className}`}
        disabled={disabled}
        multiple={multiple}
        value={value || ''}
        onChange={() => {}} // Handler vacío para evitar warning de React
        {...props}
      >
        {!multiple && placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label || option.text}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select2; 