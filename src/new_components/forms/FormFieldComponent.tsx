import React from 'react';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'currency' | 'select' | 'textarea' | 'checkbox' | 'date' | 'password';
  required?: boolean;
  options?: { label: string; value: string | number }[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    message?: string;
  };
  disabled?: boolean;
  description?: string;
}

interface FormFieldComponentProps {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (name: string, value: unknown) => void;
  onBlur: (name: string) => void;
}

export const FormFieldComponent = React.memo<FormFieldComponentProps>(({ field, value, error, onChange, onBlur }) => {
  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let newValue: unknown = e.target.value;
    
    // Type conversion based on field type
    if ((field.type === 'number' || field.type === 'currency') && newValue !== '') {
      // Remove any non-numeric characters for currency fields
      if (field.type === 'currency') {
        newValue = String(newValue).replace(/[^\d.,]/g, '').replace(/,/g, '.');
      }
      newValue = Number(newValue);
    } else if (field.type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    }
    
    onChange(field.name, newValue);
  }, [field.name, field.type, onChange]);

  const handleBlur = React.useCallback(() => {
    onBlur(field.name);
  }, [field.name, onBlur]);

  const renderField = () => {
    const commonProps = {
      id: field.name,
      name: field.name,
      placeholder: field.placeholder,
      disabled: field.disabled,
      onChange: handleInputChange,
      onBlur: handleBlur,
      className: error ? 'border-red-500 focus:border-red-500' : '',
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            value={String(value || '')}
            rows={4}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${commonProps.className}`}
          />
        );

      case 'select':
        return (
          <Select 
            value={String(value || '')} 
            onValueChange={(newValue) => onChange(field.name, newValue)}
            disabled={field.disabled}
          >
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder="Seleziona..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              {...commonProps}
              checked={Boolean(value)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor={field.name} className="ml-2 text-sm text-gray-700">
              {field.label}
            </label>
          </div>
        );

      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
            <Input
              {...commonProps}
              type="text"
              value={String(value || '')}
              className={`pl-8 ${commonProps.className}`}
              placeholder={field.placeholder || '0'}
            />
          </div>
        );

      default:
        return (
          <Input
            {...commonProps}
            type={field.type}
            value={String(value || '')}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {field.type !== 'checkbox' && (
        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {renderField()}
      
      {field.description && (
        <p className="text-sm text-gray-500">{field.description}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

FormFieldComponent.displayName = 'FormFieldComponent'; 