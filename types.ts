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
  SECTION_HEADER = 'section_header' // For visual grouping within segments
}

export interface FieldDefinition {
  id: string;
  label: string;
  type: FieldType;
  options?: FieldOption[]; 
  required?: boolean;
  placeholder?: string;
  unit?: string;
  className?: string; // For layout control
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
}

export type CollectionSchema = Segment[];