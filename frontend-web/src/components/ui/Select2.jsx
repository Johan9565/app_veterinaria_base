import React, { useEffect, useRef } from 'react';

const Select2 = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Seleccionar...',
  disabled = false,
  className = '',
  multiple = false,
  allowClear = true,
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
        
        // Destruir instancia anterior si existe
        if (select2Ref.current) {
          try {
            select2Ref.current.select2('destroy');
          } catch (e) {
            // Ignorar errores al destruir
          }
        }

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
    }, 100);

    // Limpiar al desmontar
    return () => {
      clearTimeout(timer);
      if (select2Ref.current) {
        try {
          select2Ref.current.off('select2:select select2:unselect select2:clear');
          select2Ref.current.select2('destroy');
        } catch (e) {
          // Ignorar errores al limpiar
        }
      }
    };
  }, [placeholder, allowClear, multiple, disabled]);

  // Actualizar valor cuando cambie
  useEffect(() => {
    if (select2Ref.current && window.jQuery) {
      const $select = select2Ref.current;
      const currentValue = $select.val();
      
      console.log('Select2 - Valor actual:', currentValue, 'Nuevo valor:', value);
      
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
    }
  }, [value, multiple, options]);

  // Actualizar opciones cuando cambien
  useEffect(() => {
    if (select2Ref.current && window.jQuery) {
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
    }
  }, [options, multiple, placeholder, value]);

  return (
    <select
      ref={selectRef}
      className={`select2-custom ${className}`}
      disabled={disabled}
      multiple={multiple}
      value={value || ''}
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
  );
};

export default Select2; 