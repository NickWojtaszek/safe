/**
 * Field Validation Service
 * Provides centralized validation for all field types
 */

import { FieldDefinition, FieldType, ValidationResult, ValidationMessage, CollectionRecord } from '../types';
import { createAppError, logError } from '../utils/errors';

export class FieldValidator {
  /**
   * Validate a single field value
   */
  static validateField(field: FieldDefinition, value: any): ValidationMessage[] {
    const errors: ValidationMessage[] = [];

    try {
      // Check required fields
      if (field.required && (value === null || value === undefined || value === '')) {
        errors.push({
          fieldId: field.id,
          message: `${field.label} is required`,
          severity: 'error'
        });
        return errors;
      }

      // Skip validation for empty optional fields
      if (!field.required && (value === null || value === undefined || value === '')) {
        return errors;
      }

      // Type-specific validation
      switch (field.type) {
        case FieldType.TEXT:
        case FieldType.TEXTAREA:
          if (typeof value !== 'string') {
            errors.push({
              fieldId: field.id,
              message: `${field.label} must be text`,
              severity: 'error'
            });
          }
          break;

        case FieldType.NUMBER:
          if (typeof value !== 'number' && !Number.isFinite(Number(value))) {
            errors.push({
              fieldId: field.id,
              message: `${field.label} must be a number`,
              severity: 'error'
            });
          } else {
            const numValue = Number(value);
            if (field.validation?.min !== undefined && numValue < field.validation.min) {
              errors.push({
                fieldId: field.id,
                message: `${field.label} must be >= ${field.validation.min}`,
                severity: 'error'
              });
            }
            if (field.validation?.max !== undefined && numValue > field.validation.max) {
              errors.push({
                fieldId: field.id,
                message: `${field.label} must be <= ${field.validation.max}`,
                severity: 'error'
              });
            }
          }
          break;

        case FieldType.DATE:
          if (!this.isValidDate(value)) {
            errors.push({
              fieldId: field.id,
              message: `${field.label} must be a valid date`,
              severity: 'error'
            });
          }
          break;

        case FieldType.SELECT:
        case FieldType.RADIO:
          if (field.options) {
            const validValues = field.options.map(opt => opt.value);
            if (!validValues.includes(value)) {
              errors.push({
                fieldId: field.id,
                message: `${field.label} has invalid selection`,
                severity: 'error'
              });
            }
          }
          break;

        case FieldType.CHECKBOX:
          if (field.options && Array.isArray(value)) {
            const validValues = field.options.map(opt => opt.value);
            const invalidItems = value.filter(v => !validValues.includes(v));
            if (invalidItems.length > 0) {
              errors.push({
                fieldId: field.id,
                message: `${field.label} has invalid selections: ${invalidItems.join(', ')}`,
                severity: 'error'
              });
            }
          }
          break;
      }

      // Custom validation
      if (field.validation?.custom) {
        const customResult = field.validation.custom(value);
        if (!customResult.valid) {
          errors.push({
            fieldId: field.id,
            message: customResult.message || `${field.label} failed validation`,
            severity: 'error'
          });
        }
      }

      // Regex pattern validation
      if (field.validation?.pattern && typeof value === 'string') {
        if (!field.validation.pattern.test(value)) {
          errors.push({
            fieldId: field.id,
            message: `${field.label} format is invalid`,
            severity: 'error'
          });
        }
      }
    } catch (error) {
      logError(error as Error);
      errors.push({
        fieldId: field.id,
        message: `Validation error for ${field.label}`,
        severity: 'error'
      });
    }

    return errors;
  }

  /**
   * Validate multiple fields at once
   */
  static validateFields(
    fields: FieldDefinition[],
    data: Record<string, any>
  ): ValidationResult {
    const errors: ValidationMessage[] = [];

    for (const field of fields) {
      const fieldErrors = this.validateField(field, data[field.id]);
      errors.push(...fieldErrors);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate entire record
   */
  static validateRecord(record: CollectionRecord, fields: FieldDefinition[]): ValidationResult {
    try {
      if (!record.id || !record.timestamp) {
        return {
          valid: false,
          errors: [{
            fieldId: '__record__',
            message: 'Record missing required metadata',
            severity: 'error'
          }]
        };
      }

      return this.validateFields(fields, record.data);
    } catch (error) {
      logError(error as Error);
      return {
        valid: false,
        errors: [{
          fieldId: '__record__',
          message: 'Record validation failed',
          severity: 'error'
        }]
      };
    }
  }

  /**
   * Polish-specific validators
   */
  static isValidPolishDate(dateString: string): boolean {
    // Validates DD/MM/YYYY or YYYY-MM-DD format
    const polishDateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$|^\d{4}-\d{2}-\d{2}$/;
    return polishDateRegex.test(dateString);
  }

  static isValidPesel(pesel: string): boolean {
    // PESEL: 11 digits with checksum validation
    if (!/^\d{11}$/.test(pesel)) return false;
    
    const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
    let sum = 0;
    
    for (let i = 0; i < 10; i++) {
      sum += parseInt(pesel[i]) * weights[i];
    }
    
    const checksum = (10 - (sum % 10)) % 10;
    return checksum === parseInt(pesel[10]);
  }

  private static isValidDate(value: any): boolean {
    if (typeof value === 'string') {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }
    if (value instanceof Date) {
      return !isNaN(value.getTime());
    }
    return false;
  }
}
