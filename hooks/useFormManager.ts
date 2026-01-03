/**
 * useFormManager Hook
 * Separates form logic from component rendering
 */

import { useState, useCallback } from 'react';
import { CollectionRecord, ValidationMessage, FieldDefinition } from '../types';
import { FieldValidator } from '../validators/fieldValidator';
import { enhanceRecord, isRecordValid } from '../utils/dataIntegrity';
import { createAppError, logError } from '../utils/errors';

interface UseFormManagerProps {
  fields: FieldDefinition[];
  onSuccess?: (record: CollectionRecord) => void;
  onError?: (error: Error) => void;
}

interface UseFormManagerReturn {
  formData: Record<string, any>;
  validationErrors: ValidationMessage[];
  isValid: boolean;
  isDirty: boolean;
  updateField: (fieldId: string, value: any) => void;
  validateField: (fieldId: string) => boolean;
  validateAll: () => boolean;
  resetForm: () => void;
  saveRecord: (timestampOverride?: string) => CollectionRecord | null;
}

export function useFormManager({
  fields,
  onSuccess,
  onError
}: UseFormManagerProps): UseFormManagerReturn {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationMessage[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [initialData] = useState<Record<string, any>>({});

  const updateField = useCallback((fieldId: string, value: any) => {
    try {
      setFormData(prev => ({ ...prev, [fieldId]: value }));
      setIsDirty(true);

      // Clear validation error for this field when user starts typing
      setValidationErrors(prev =>
        prev.filter(err => err.fieldId !== fieldId)
      );
    } catch (error) {
      logError(error as Error);
      onError?.(error as Error);
    }
  }, [onError]);

  const validateField = useCallback((fieldId: string): boolean => {
    try {
      const field = fields.find(f => f.id === fieldId);
      if (!field) return false;

      const errors = FieldValidator.validateField(field, formData[fieldId]);

      // Update validation errors state
      setValidationErrors(prev => {
        const filtered = prev.filter(e => e.fieldId !== fieldId);
        return [...filtered, ...errors];
      });

      return errors.length === 0;
    } catch (error) {
      logError(error as Error);
      return false;
    }
  }, [fields, formData]);

  const validateAll = useCallback((): boolean => {
    try {
      const result = FieldValidator.validateFields(fields, formData);
      setValidationErrors(result.errors);
      return result.valid;
    } catch (error) {
      logError(error as Error);
      const appError = createAppError(
        'VALIDATION_ERROR',
        'Form validation failed',
        { originalError: error }
      );
      onError?.(appError);
      return false;
    }
  }, [fields, formData, onError]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setValidationErrors([]);
    setIsDirty(false);
  }, [initialData]);

  const saveRecord = useCallback((timestampOverride?: string): CollectionRecord | null => {
    try {
      // Validate before saving
      if (!validateAll()) {
        throw createAppError(
          'VALIDATION_ERROR',
          'Cannot save form with validation errors',
          { errors: validationErrors }
        );
      }

      // Create record
      const record: CollectionRecord = {
        id: crypto.randomUUID(),
        timestamp: timestampOverride || new Date().toISOString(),
        data: { ...formData },
        version: '1.0.0',
        validationStatus: 'valid'
      };

      // Enhance with integrity checks
      const enhancedRecord = enhanceRecord(record);

      // Verify integrity
      const verification = isRecordValid(enhancedRecord);
      if (!verification.valid) {
        throw createAppError(
          'DATA_CORRUPTION',
          `Data integrity check failed: ${verification.reason}`,
          { record: enhancedRecord }
        );
      }

      // Reset form on success
      resetForm();
      onSuccess?.(enhancedRecord);

      return enhancedRecord;
    } catch (error) {
      const appError = error instanceof Error ? error : new Error(String(error));
      logError(appError);
      onError?.(appError);
      return null;
    }
  }, [formData, validateAll, validationErrors, resetForm, onSuccess, onError]);

  return {
    formData,
    validationErrors,
    isValid: validationErrors.length === 0,
    isDirty,
    updateField,
    validateField,
    validateAll,
    resetForm,
    saveRecord
  };
}
