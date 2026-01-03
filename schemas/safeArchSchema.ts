/**
 * Safe-ARCH Schema Module
 * Extracted from constants.ts for modularity and maintainability
 * Version: 1.0.0
 */

import { CollectionSchema, FieldType } from '../types';

// Shared option sets to prevent duplication
export const OPTIONS = {
  YES_NO_UNKNOWN: [
    { label: 'Tak', value: 'tak' },
    { label: 'Nie', value: 'nie' },
    { label: 'Nieznane', value: 'nieznane' }
  ],
  YES_NO: [
    { label: 'Tak', value: 'tak' },
    { label: 'Nie', value: 'nie' }
  ],
  GRADE_NONE_SEVERE: [
    { label: 'Brak', value: 'none' },
    { label: 'Mała', value: 'mild' },
    { label: 'Umiarkowana', value: 'moderate' },
    { label: 'Duża', value: 'severe' }
  ]
};

/**
 * Administrative Section - Required data for study enrollment
 * Includes all patient enrollment and study tracking information
 */
export const SECTION_ADMINISTRATIVE = {
  id: 'sec_a_admin',
  title: 'Sekcja A: Dane Administracyjne',
  description: 'Dokumentacja identyfikacyjna v1.0',
  fields: [
    {
      id: 'study_number',
      label: 'Numer badania',
      type: FieldType.TEXT,
      required: true,
      placeholder: 'np. SAFE-ARCH-00001',
      validation: {
        pattern: /^[A-Z0-9\-]{5,20}$/,
        custom: (value: string) => ({
          valid: /^[A-Z0-9\-]{5,20}$/.test(value),
          message: 'Study number must be 5-20 alphanumeric characters or hyphens'
        })
      }
    },
    {
      id: 'center_code',
      label: 'Kod ośrodka',
      type: FieldType.TEXT,
      required: true,
      placeholder: 'np. PL-001',
      validation: {
        pattern: /^[A-Z]{2}-\d{3}$/,
        custom: (value: string) => ({
          valid: /^[A-Z]{2}-\d{3}$/.test(value),
          message: 'Center code must be in format: XX-NNN (e.g., PL-001)'
        })
      }
    },
    {
      id: 'inclusion_date',
      label: 'Data włączenia',
      type: FieldType.DATE,
      required: true
    },
    {
      id: 'collector_initials',
      label: 'Inicjały osoby zbierającej dane',
      type: FieldType.TEXT,
      required: true,
      placeholder: 'np. JDN',
      validation: {
        pattern: /^[A-Z]{2,4}$/,
        custom: (value: string) => ({
          valid: /^[A-Z]{2,4}$/.test(value),
          message: 'Initials must be 2-4 uppercase letters'
        })
      }
    }
  ]
};

/**
 * Complete SAFE-ARCH schema
 * Organized into logical sections for data collection workflow
 */
export const DATA_SCHEMA: CollectionSchema = [
  SECTION_ADMINISTRATIVE,
  // Additional sections would be imported here as separate modules
  // for better organization
];

/**
 * Get schema section by ID
 */
export function getSchemaSection(sectionId: string) {
  return DATA_SCHEMA.find(section => section.id === sectionId);
}

/**
 * Get field definition by ID across all sections
 */
export function getFieldDefinition(fieldId: string) {
  for (const section of DATA_SCHEMA) {
    const field = section.fields.find(f => f.id === fieldId);
    if (field) return field;
  }
  return undefined;
}

/**
 * Validate schema structure
 */
export function validateSchemaStructure(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const fieldIds = new Set<string>();

  for (const section of DATA_SCHEMA) {
    if (!section.id || !section.title || !section.fields) {
      errors.push(`Section missing required fields: ${section.id}`);
      continue;
    }

    for (const field of section.fields) {
      if (!field.id || !field.label || !field.type) {
        errors.push(`Field in section ${section.id} missing required fields`);
        continue;
      }

      if (fieldIds.has(field.id)) {
        errors.push(`Duplicate field ID: ${field.id}`);
      }
      fieldIds.add(field.id);

      // Validate field options
      if ((field.type === FieldType.SELECT || field.type === FieldType.RADIO) && !field.options?.length) {
        errors.push(`Field ${field.id} requires options for type ${field.type}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
