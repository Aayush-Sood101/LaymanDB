"use client";

import React from 'react';

const Input = ({ 
  label, 
  id, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
          ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
