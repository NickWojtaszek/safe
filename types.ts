/**
 * Enhanced Type Definitions - Prevents data corruption with strict typing
 */

export interface FieldOption {
  label: string;
  value: string;
}

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  SELECT = 'select',
  RADIO = 'radio',
  DATE = 'date',
  TEXTAREA = 'textarea',
  SECTION_HEADER = 'section_header'
}

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => { valid: boolean; message?: string };
}

export interface FieldDefinition {
  id: string;
  label: string;
  type: FieldType;
  options?: FieldOption[]; 
  required?: boolean;
  placeholder?: string;
  unit?: string;
  className?: string;
  validation?: ValidationRule;
}

export interface Segment {
  id: string;
  title: string;
  description: string;
  fields: FieldDefinition[];
}

export interface CollectionRecord {
  id: string;
  timestamp: string;
  data: Record<string, any>;
  version: string; // Schema version for compatibility
  checksum?: string; // Data integrity verification
  validationStatus?: 'valid' | 'warnings' | 'errors';
  validationErrors?: Record<string, string>;
}

export type CollectionSchema = Segment[];

export interface ValidationMessage {
  fieldId: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationMessage[];
}

export interface User {
  username: string;
  role: 'admin' | 'user';
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, role: 'admin' | 'user') => void;
  logout: () => void;
}

export interface AppError extends Error {
  code: string;
  timestamp: Date;
  context?: Record<string, any>;
}