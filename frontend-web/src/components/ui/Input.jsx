import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  type = 'text', 
  className = '', 
  ...props 
}, ref) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300';
  const classes = `${baseClasses} ${errorClasses} ${className}`;
  
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={classes}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 