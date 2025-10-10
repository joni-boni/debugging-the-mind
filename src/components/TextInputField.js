import React from 'react';

export const TextInputField = ({ 
  value, 
  onChange, 
  placeholder, 
  label,
  rows = 3 
}) => {
  // Verwende useRef für direkte DOM-Manipulation ohne State-Konflikte
  const textareaRef = React.useRef(null);
  
  // Setze den initialen Wert nur einmal
  React.useEffect(() => {
    if (textareaRef.current && value) {
      textareaRef.current.value = value;
    }
  }, []);

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  return (
    <div className="mb-8">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <textarea
        ref={textareaRef}
        defaultValue={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
        rows={rows}
      />
    </div>
  );
};