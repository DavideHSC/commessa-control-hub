import React from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useForm } from '../../new_hooks/useForm';
import { FormFieldComponent } from './FormFieldComponent';

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

interface GenericFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  onCancel?: () => void;
  initialValues?: Record<string, unknown>;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
  title?: string;
  description?: string;
  className?: string;
}

// Interfaccia per le props del nuovo componente FormContent
interface FormContentProps {
  fields: FormField[];
  values: Record<string, any>;
  errors: Record<string, any>;
  touched: Record<string, any>;
  handleChange: (name: string, value: any) => void;
  handleBlur: (name: string) => void;
  handleSubmit: (callback: (values: Record<string, any>) => void) => void;
  onFormSubmit: (formValues: Record<string, unknown>) => void;
  onCancel?: () => void;
  handleReset: () => void;
  isValid: boolean;
  loading: boolean;
  submitText: string;
  cancelText: string;
}

// Il contenuto del form è stato estratto in un componente a sé stante e memoizzato.
// Questo previene il re-mount del form e la conseguente perdita di focus
// quando il componente genitore (GenericForm) si ri-renderizza.
const FormContent = React.memo<FormContentProps>(({
  fields,
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  handleSubmit,
  onFormSubmit,
  onCancel,
  handleReset,
  isValid,
  loading,
  submitText,
  cancelText,
}) => {
  const handleFormSubmit = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onFormSubmit);
  }, [handleSubmit, onFormSubmit]);

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => (
          <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
            <FormFieldComponent
              field={field}
              value={values[field.name]}
              error={touched[field.name] ? errors[field.name] : undefined}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-4 pt-6">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={loading}
          >
            {cancelText}
          </Button>
        )}
        <Button
          type="submit"
          disabled={!isValid || loading}
          className="min-w-[100px]"
        >
          {loading ? 'Salvando...' : submitText}
        </Button>
      </div>
    </form>
  );
});
FormContent.displayName = 'FormContent';


export const GenericForm = ({
  fields,
  onSubmit,
  onCancel,
  initialValues = {},
  loading = false,
  submitText = "Salva",
  cancelText = "Annulla",
  title,
  description,
  className = "",
}: GenericFormProps) => {
  // Create validation rules from field definitions - memoized to prevent re-creation
  const validationRules = React.useMemo(() => {
    return fields.reduce((rules, field) => {
      const fieldRules: Record<string, unknown> = {};
      
      if (field.required) {
        fieldRules.required = true;
      }
      
      if (field.validation) {
        Object.assign(fieldRules, field.validation);
      }
      
      if (Object.keys(fieldRules).length > 0) {
        rules[field.name] = fieldRules;
      }
      
      return rules;
    }, {} as Record<string, Record<string, unknown>>);
  }, [fields]);

  // Memoize the options object to prevent re-creation on every render
  const formOptions = React.useMemo(() => ({
    validationRules,
    validateOnBlur: true,
  }), [validationRules]);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isValid,
    reset,
  } = useForm(initialValues, formOptions);

  const onFormSubmit = React.useCallback(async (formValues: Record<string, unknown>) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  }, [onSubmit]);

  const handleReset = React.useCallback(() => {
    reset();
    onCancel?.();
  }, [reset, onCancel]);

  const formContentProps = {
    fields,
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    onFormSubmit,
    onCancel,
    handleReset,
    isValid,
    loading,
    submitText,
    cancelText,
  };

  return (
    <div className={className}>
      {title || description ? (
        <Card>
          {title && (
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              {description && <p className="text-sm text-gray-600">{description}</p>}
            </CardHeader>
          )}
          <CardContent>
            <FormContent {...formContentProps} />
          </CardContent>
        </Card>
      ) : (
        <FormContent {...formContentProps} />
      )}
    </div>
  );
};