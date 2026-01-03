/**
 * Record Management Service
 * Handles safe record operations with integrity checks
 */

import { CollectionRecord, FieldDefinition } from '../types';
import { FieldValidator } from '../validators/fieldValidator';
import { enhanceRecord, isRecordValid, deserializeRecord } from '../utils/dataIntegrity';
import { createAppError, logError } from '../utils/errors';

export class RecordManager {
  /**
   * Create a new record with full validation
   */
  static createRecord(
    data: Record<string, any>,
    fields: FieldDefinition[],
    overrideTimestamp?: string
  ): CollectionRecord | { error: Error } {
    try {
      // Validate data against fields
      const validation = FieldValidator.validateFields(fields, data);
      if (!validation.valid) {
        const error = createAppError(
          'VALIDATION_ERROR',
          'Cannot create record with validation errors',
          { errors: validation.errors }
        );
        return { error };
      }

      // Create record
      const record: CollectionRecord = {
        id: crypto.randomUUID(),
        timestamp: overrideTimestamp || new Date().toISOString(),
        data: { ...data },
        version: '1.0.0',
        validationStatus: 'valid'
      };

      // Enhance with integrity metadata
      const enhanced = enhanceRecord(record);

      // Verify integrity was added properly
      const verification = isRecordValid(enhanced);
      if (!verification.valid) {
        const error = createAppError(
          'DATA_CORRUPTION',
          `Record verification failed: ${verification.reason}`,
          { record: enhanced }
        );
        return { error };
      }

      return enhanced;
    } catch (error) {
      logError(error as Error);
      return { error: error as Error };
    }
  }

  /**
   * Batch create multiple records
   */
  static createRecordsBatch(
    dataArray: Record<string, any>[],
    fields: FieldDefinition[]
  ): {
    successful: CollectionRecord[];
    failed: Array<{ data: Record<string, any>; error: Error }>;
  } {
    const results = {
      successful: [],
      failed: []
    };

    for (const data of dataArray) {
      const result = this.createRecord(data, fields);
      if ('error' in result) {
        results.failed.push({ data, error: result.error });
      } else {
        results.successful.push(result);
      }
    }

    return results;
  }

  /**
   * Clone a record with new ID and timestamp
   */
  static cloneRecord(record: CollectionRecord): CollectionRecord {
    try {
      const cloned: CollectionRecord = {
        ...record,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      };

      return enhanceRecord(cloned);
    } catch (error) {
      logError(error as Error);
      throw createAppError(
        'RECORD_SAVE_ERROR',
        'Failed to clone record',
        { originalId: record.id }
      );
    }
  }

  /**
   * Merge multiple records into one
   */
  static mergeRecords(
    records: CollectionRecord[],
    fields: FieldDefinition[]
  ): CollectionRecord | { error: Error } {
    try {
      if (records.length === 0) {
        return { error: new Error('Cannot merge zero records') };
      }

      // Merge data from all records (later ones override earlier)
      const mergedData: Record<string, any> = {};
      for (const record of records) {
        Object.assign(mergedData, record.data);
      }

      // Validate merged data
      const validation = FieldValidator.validateFields(fields, mergedData);
      if (!validation.valid) {
        return {
          error: createAppError(
            'VALIDATION_ERROR',
            'Merged data fails validation',
            { errors: validation.errors }
          )
        };
      }

      // Create merged record
      const merged: CollectionRecord = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        data: mergedData,
        version: '1.0.0',
        validationStatus: 'valid'
      };

      return enhanceRecord(merged);
    } catch (error) {
      logError(error as Error);
      return { error: error as Error };
    }
  }

  /**
   * Update record with validation
   */
  static updateRecord(
    record: CollectionRecord,
    updates: Partial<Record<string, any>>,
    fields: FieldDefinition[]
  ): CollectionRecord | { error: Error } {
    try {
      // Merge updates
      const updatedData = { ...record.data, ...updates };

      // Validate updated data
      const validation = FieldValidator.validateFields(fields, updatedData);
      if (!validation.valid) {
        return {
          error: createAppError(
            'VALIDATION_ERROR',
            'Updated data fails validation',
            { errors: validation.errors }
          )
        };
      }

      // Create updated record
      const updated: CollectionRecord = {
        ...record,
        data: updatedData,
        timestamp: new Date().toISOString(),
        validationStatus: 'valid'
      };

      return enhanceRecord(updated);
    } catch (error) {
      logError(error as Error);
      return { error: error as Error };
    }
  }

  /**
   * Export records to JSON with integrity
   */
  static exportRecords(records: CollectionRecord[]): string {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        recordCount: records.length,
        records: records.map(r => ({
          ...r,
          checksum: r.checksum // Include checksums for verification
        }))
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      logError(error as Error);
      throw createAppError('RECORD_SAVE_ERROR', 'Failed to export records');
    }
  }

  /**
   * Import records from JSON with integrity checks
   */
  static importRecords(json: string): {
    records: CollectionRecord[];
    errors: Array<{ index: number; error: Error }>;
  } {
    const results = {
      records: [],
      errors: []
    };

    try {
      const data = JSON.parse(json);

      if (!Array.isArray(data.records)) {
        throw new Error('Invalid import format: records must be an array');
      }

      for (let i = 0; i < data.records.length; i++) {
        const recordData = data.records[i];

        // Verify each record
        const verification = isRecordValid(recordData as CollectionRecord);
        if (!verification.valid) {
          results.errors.push({
            index: i,
            error: new Error(`Record ${i}: ${verification.reason}`)
          });
          continue;
        }

        results.records.push(recordData as CollectionRecord);
      }

      return results;
    } catch (error) {
      logError(error as Error);
      return {
        records: [],
        errors: [{
          index: -1,
          error: error as Error
        }]
      };
    }
  }

  /**
   * Get record statistics
   */
  static getStatistics(records: CollectionRecord[]): {
    total: number;
    valid: number;
    hasErrors: number;
    dateRange: { oldest: string; newest: string } | null;
    fieldCoverage: Record<string, number>;
  } {
    const stats = {
      total: records.length,
      valid: records.filter(r => r.validationStatus === 'valid').length,
      hasErrors: records.filter(r => r.validationStatus === 'errors').length,
      dateRange: null as { oldest: string; newest: string } | null,
      fieldCoverage: {} as Record<string, number>
    };

    if (records.length === 0) {
      return stats;
    }

    // Calculate date range
    const timestamps = records.map(r => new Date(r.timestamp).getTime());
    stats.dateRange = {
      oldest: new Date(Math.min(...timestamps)).toISOString(),
      newest: new Date(Math.max(...timestamps)).toISOString()
    };

    // Calculate field coverage
    const allFields = new Set<string>();
    for (const record of records) {
      Object.keys(record.data).forEach(key => allFields.add(key));
    }

    for (const field of allFields) {
      const count = records.filter(r => field in r.data && r.data[field] !== null && r.data[field] !== '').length;
      stats.fieldCoverage[field] = Math.round((count / records.length) * 100);
    }

    return stats;
  }
}
