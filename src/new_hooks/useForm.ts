import { useState, useCallback, useRef, useEffect } from 'react';

interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  custom?: (value: unknown, values: Record<string, unknown>) => string | null;
  message?: string;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface UseFormOptions<T> {
  onSubmit?: (values: T) => void | Promise<void>;
  validationRules?: ValidationRules;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export const useForm = <T extends Record<string, unknown>>(
  initialValues: T,
  options: UseFormOptions<T> = {}
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stable refs to avoid recreating callbacks on each render
  const optionsRef = useRef(options);
  const valuesRef = useRef(values);
  const initialValuesRef = useRef(initialValues);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  useEffect(() => {
    initialValuesRef.current = initialValues;
  }, [initialValues]);

  const validateField = useCallback((name: string, value: unknown, allValues: T): string | null => {
    const rules = optionsRef.current.validationRules?.[name];
    if (!rules) return null;

    // Required validation
    if (rules.required && (value === '' || value === null || value === undefined)) {
      return rules.message || `${name} è richiesto`;
    }

    // Skip other validations if field is empty and not required
    if (!rules.required && (value === '' || value === null || value === undefined)) {
      return null;
    }

    // String length validations
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return rules.message || `${name} deve essere di almeno ${rules.minLength} caratteri`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return rules.message || `${name} non può superare ${rules.maxLength} caratteri`;
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        return rules.message || `${name} deve essere maggiore o uguale a ${rules.min}`;
      }
      if (rules.max !== undefined && value > rules.max) {
        return rules.message || `${name} deve essere minore o uguale a ${rules.max}`;
      }
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      return rules.message || `${name} non ha un formato valido`;
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value, allValues);
    }

    return null;
  }, []);

  const validateForm = useCallback((valuesToValidate: T): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    Object.keys(valuesToValidate).forEach(key => {
      const error = validateField(key, valuesToValidate[key], valuesToValidate);
      if (error) {
        newErrors[key] = error;
      }
    });

    return newErrors;
  }, [validateField]);

  const handleChange = useCallback((name: string, value: unknown) => {
    setValues(prev => {
      const newValues = { ...prev, [name]: value } as T;

      if (optionsRef.current.validateOnChange) {
        const error = validateField(name, value, newValues);
        setErrors(prevErrors => ({
          ...prevErrors,
          [name]: error || ''
        }));
      }

      return newValues;
    });
  }, [validateField]);

  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));

    if (optionsRef.current.validateOnBlur) {
      const currentValues = valuesRef.current;
      const error = validateField(name, currentValues[name], currentValues);
      setErrors(prev => ({
        ...prev,
        [name]: error || ''
      }));
    }
  }, [validateField]);

  const handleSubmit = useCallback(async (onSubmit?: (values: T) => void | Promise<void>) => {
    const submitFn = onSubmit || optionsRef.current.onSubmit;
    if (!submitFn) return;

    setIsSubmitting(true);

    // Mark all fields as touched
    const currentValues = valuesRef.current;
    const allTouched = Object.keys(currentValues).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    // Validate all fields
    const newErrors = validateForm(currentValues);
    setErrors(newErrors);

    // Check if form is valid
    const isValidForm = Object.keys(newErrors).every(key => !newErrors[key]);

    if (isValidForm) {
      try {
        await submitFn(currentValues);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }

    setIsSubmitting(false);
  }, [validateForm]);

  const reset = useCallback(() => {
    setValues(initialValuesRef.current);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, []);

  const setFieldValue = useCallback((name: string, value: unknown) => {
    handleChange(name, value);
  }, [handleChange]);

  const setFieldError = useCallback((name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const isValid = Object.keys(errors).every(key => !errors[key]);
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValuesRef.current);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    setValues,
    setErrors,
    validateForm,
  };
};