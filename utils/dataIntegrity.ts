/**
 * Data Integrity Utilities
 * Prevents data corruption with checksums and version tracking
 */

import { CollectionRecord } from '../types';

const SCHEMA_VERSION = '1.0.0';

/**
 * Generate checksum for record data to detect corruption
 */
export function generateChecksum(data: Record<string, any>): string {
  const json = JSON.stringify(data, Object.keys(data).sort());
  let hash = 0;
  
  for (let i = 0; i < json.length; i++) {
    const char = json.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16);
}

/**
 * Verify data integrity using checksum
 */
export function verifyChecksum(data: Record<string, any>, checksum: string): boolean {
  const calculated = generateChecksum(data);
  return calculated === checksum;
}

/**
 * Enhance record with integrity metadata
 */
export function enhanceRecord(record: CollectionRecord): CollectionRecord {
  return {
    ...record,
    version: SCHEMA_VERSION,
    checksum: generateChecksum(record.data),
    validationStatus: record.validationStatus || 'valid'
  };
}

/**
 * Verify record hasn't been corrupted
 */
export function isRecordValid(record: CollectionRecord): { valid: boolean; reason?: string } {
  // Check required fields
  if (!record.id || !record.timestamp || !record.data) {
    return { valid: false, reason: 'Missing required record fields' };
  }

  // Verify checksum if present
  if (record.checksum && !verifyChecksum(record.data, record.checksum)) {
    return { valid: false, reason: 'Checksum verification failed - data may be corrupted' };
  }

  // Verify schema version compatibility
  if (record.version && record.version !== SCHEMA_VERSION) {
    console.warn(`Record schema version mismatch: ${record.version} vs ${SCHEMA_VERSION}`);
  }

  return { valid: true };
}

/**
 * Safe record serialization/deserialization
 */
export function serializeRecord(record: CollectionRecord): string {
  try {
    return JSON.stringify(enhanceRecord(record));
  } catch (error) {
    throw new Error(`Failed to serialize record: ${error}`);
  }
}

export function deserializeRecord(json: string): CollectionRecord {
  try {
    const record = JSON.parse(json) as CollectionRecord;
    const verification = isRecordValid(record);
    
    if (!verification.valid) {
      throw new Error(`Record validation failed: ${verification.reason}`);
    }
    
    return record;
  } catch (error) {
    throw new Error(`Failed to deserialize record: ${error}`);
  }
}
