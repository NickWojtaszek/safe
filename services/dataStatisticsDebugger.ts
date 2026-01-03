/**
 * Data-Statistics Link Debugger
 * 
 * Analyzes field-to-statistics mappings and identifies broken relationships
 * that prevent proper aggregation and analysis.
 */

import { CollectionRecord } from '../types';
import { DATA_SCHEMA } from '../constants';

export interface FieldMapping {
  fieldId: string;
  fieldLabel: string;
  sectionId: string;
  sectionTitle: string;
  usedInStatistics: string[];
  dataType: 'text' | 'number' | 'date' | 'radio' | 'select';
  isRequired: boolean;
  validValues?: string[];
  statistics: StatisticUsage[];
}

export interface StatisticUsage {
  statisticId: string;
  statisticName: string;
  usageType: 'grouping' | 'metric' | 'filter' | 'outcome' | 'predictor';
  mappingStatus: 'valid' | 'broken' | 'deprecated';
  breakReason?: string;
}

export interface DataQualityIssue {
  recordId: string;
  fieldId: string;
  fieldLabel: string;
  currentValue: any;
  expectedType: string;
  issueType: 'missing' | 'invalid_format' | 'invalid_value' | 'type_mismatch' | 'orphaned_data';
  severity: 'critical' | 'warning' | 'info';
  linkedStatistics: string[];
  affectedAnalysis: string[];
  suggestion: string;
}

export interface LinkDebugReport {
  timestamp: string;
  totalRecords: number;
  totalFields: number;
  fieldMappings: FieldMapping[];
  dataQualityIssues: DataQualityIssue[];
  summary: {
    criticalIssues: number;
    warnings: number;
    totalIssuesPerRecord: number;
    orphanedFields: string[];
    missingRequiredFields: Array<{ fieldId: string; count: number; percentage: number }>;
    validityScore: number;
  };
  recommendations: string[];
}

export interface FieldStatisticMap {
  [fieldId: string]: {
    usedInStatistics: string[];
    criticalFor: string[];
  };
}

// Core mapping of fields to statistics
const FIELD_STATISTIC_MAP: FieldStatisticMap = {
  // Demographics
  age: { usedInStatistics: ['age_distribution', 'age_subgroups'], criticalFor: ['descriptive', 'risk_stratification'] },
  sex: { usedInStatistics: ['sex_distribution', 'sex_subgroups'], criticalFor: ['descriptive', 'subgroup_analysis'] },
  smoking_status: { usedInStatistics: ['smoking_prevalence'], criticalFor: ['risk_factors'] },
  
  // Key outcome fields
  any_stroke_30d: { usedInStatistics: ['primary_outcome_stroke', 'stroke_rate'], criticalFor: ['primary_outcome'] },
  stroke_type_cat: { usedInStatistics: ['stroke_type_distribution'], criticalFor: ['outcome_characterization'] },
  nihss_at_diagnosis: { usedInStatistics: ['stroke_severity'], criticalFor: ['outcome_severity'] },
  mrs_at_30d: { usedInStatistics: ['functional_outcome', 'disability_distribution'], criticalFor: ['primary_outcome'] },
  death_any_30d: { usedInStatistics: ['mortality_30d', 'all_cause_death'], criticalFor: ['safety', 'primary_outcome'] },
  
  // Procedural risk factors
  urgency_proc: { usedInStatistics: ['urgency_stratification'], criticalFor: ['risk_stratification'] },
  shaggy_aorta: { usedInStatistics: ['shaggy_predictor', 'plaque_burden'], criticalFor: ['risk_factors', 'predictor_analysis'] },
  epd_used_proc: { usedInStatistics: ['epd_protective_effect'], criticalFor: ['protective_factor_analysis'] },
  
  // Anatomical risk factors
  willis_classification: { usedInStatistics: ['willis_risk', 'cerebral_perfusion'], criticalFor: ['risk_stratification'] },
  asc_aorta_ge_40: { usedInStatistics: ['aorta_size_risk'], criticalFor: ['risk_factors'] },
  aneurysm_gt_70: { usedInStatistics: ['aneurysm_size_stratification'], criticalFor: ['risk_stratification'] },
  primary_indication: { usedInStatistics: ['indication_subgroups'], criticalFor: ['subgroup_analysis'] },
  
  // Hemodynamic & monitoring
  rso2_delta_max_r: { usedInStatistics: ['nirs_oxygenation'], criticalFor: ['intraop_monitoring'] },
  rso2_delta_max_l: { usedInStatistics: ['nirs_oxygenation'], criticalFor: ['intraop_monitoring'] },
  map_lowest: { usedInStatistics: ['hemodynamic_stability'], criticalFor: ['intraop_monitoring'] },
  
  // Procedural details
  proc_config: { usedInStatistics: ['config_comparison'], criticalFor: ['subgroup_analysis'] },
  stentgraft_system: { usedInStatistics: ['device_comparison'], criticalFor: ['subgroup_analysis'] },
  treated_vessels: { usedInStatistics: ['branch_vessel_analysis'], criticalFor: ['technical_outcome'] },
  
  // Complications
  endoleak_type_1: { usedInStatistics: ['endoleak_rate', 'safety_composite'], criticalFor: ['safety_outcome'] },
  sci_any: { usedInStatistics: ['sci_rate', 'safety_composite'], criticalFor: ['safety_outcome'] },
  aki_akin_ge_2: { usedInStatistics: ['aki_rate', 'safety_composite'], criticalFor: ['safety_outcome'] },
  bleeding_barc_ge_3: { usedInStatistics: ['bleeding_rate', 'safety_composite'], criticalFor: ['safety_outcome'] },
  
  // Follow-up
  followup_time_days: { usedInStatistics: ['followup_duration'], criticalFor: ['survival_analysis'] },
  followup_status: { usedInStatistics: ['vital_status'], criticalFor: ['survival_analysis'] },
};

class DataStatisticsDebugger {
  /**
   * Analyze all field-to-statistic mappings
   */
  analyzeFieldMappings(): FieldMapping[] {
    const mappings: FieldMapping[] = [];
    
    for (const section of DATA_SCHEMA) {
      for (const field of section.fields) {
        const mapEntry = FIELD_STATISTIC_MAP[field.id];
        
        mappings.push({
          fieldId: field.id,
          fieldLabel: field.label,
          sectionId: section.id,
          sectionTitle: section.title,
          usedInStatistics: mapEntry?.usedInStatistics || [],
          dataType: this.getDataType(field.type),
          isRequired: field.required || false,
          validValues: field.options?.map(o => o.value),
          statistics: this.getStatisticUsages(field.id, mapEntry)
        });
      }
    }
    
    return mappings;
  }
  
  /**
   * Check data quality for a single record
   */
  validateRecord(record: CollectionRecord): DataQualityIssue[] {
    const issues: DataQualityIssue[] = [];
    const data = record.data;
    
    for (const mapping of this.analyzeFieldMappings()) {
      const value = data[mapping.fieldId];
      
      // Check required fields
      if (mapping.isRequired && !value) {
        issues.push({
          recordId: record.id,
          fieldId: mapping.fieldId,
          fieldLabel: mapping.fieldLabel,
          currentValue: value,
          expectedType: mapping.dataType,
          issueType: 'missing',
          severity: mapping.statistics.some(s => s.mappingStatus === 'valid') ? 'critical' : 'warning',
          linkedStatistics: mapping.statistics.map(s => s.statisticName),
          affectedAnalysis: mapping.statistics
            .filter(s => s.mappingStatus === 'valid')
            .map(s => this.getAffectedAnalysis(s.usageType)),
          suggestion: `${mapping.fieldLabel} is required for ${mapping.statistics.map(s => s.statisticName).join(', ')}`
        });
      }
      
      // Check data type
      if (value && !this.isValidDataType(value, mapping.dataType)) {
        issues.push({
          recordId: record.id,
          fieldId: mapping.fieldId,
          fieldLabel: mapping.fieldLabel,
          currentValue: value,
          expectedType: mapping.dataType,
          issueType: 'type_mismatch',
          severity: 'warning',
          linkedStatistics: mapping.statistics.map(s => s.statisticName),
          affectedAnalysis: [this.getAffectedAnalysis('metric')],
          suggestion: `Expected ${mapping.dataType}, got ${typeof value}`
        });
      }
      
      // Check valid values for select/radio fields
      if (value && mapping.validValues && !mapping.validValues.includes(value)) {
        issues.push({
          recordId: record.id,
          fieldId: mapping.fieldId,
          fieldLabel: mapping.fieldLabel,
          currentValue: value,
          expectedType: mapping.dataType,
          issueType: 'invalid_value',
          severity: 'critical',
          linkedStatistics: mapping.statistics.map(s => s.statisticName),
          affectedAnalysis: mapping.statistics.map(s => this.getAffectedAnalysis(s.usageType)),
          suggestion: `Value "${value}" not in allowed options: ${mapping.validValues.join(', ')}`
        });
      }
      
      // Check date format
      if (value && mapping.dataType === 'date' && !this.isValidDate(value)) {
        issues.push({
          recordId: record.id,
          fieldId: mapping.fieldId,
          fieldLabel: mapping.fieldLabel,
          currentValue: value,
          expectedType: 'date (YYYY-MM-DD)',
          issueType: 'invalid_format',
          severity: 'critical',
          linkedStatistics: mapping.statistics.map(s => s.statisticName),
          affectedAnalysis: mapping.statistics.filter(s => s.usageType === 'metric').map(s => this.getAffectedAnalysis(s.usageType)),
          suggestion: `Date must be in format YYYY-MM-DD, got "${value}"`
        });
      }
      
      // Check number format
      if (value && mapping.dataType === 'number' && isNaN(Number(value))) {
        issues.push({
          recordId: record.id,
          fieldId: mapping.fieldId,
          fieldLabel: mapping.fieldLabel,
          currentValue: value,
          expectedType: 'number',
          issueType: 'invalid_format',
          severity: 'critical',
          linkedStatistics: mapping.statistics.map(s => s.statisticName),
          affectedAnalysis: mapping.statistics.filter(s => s.usageType === 'metric').map(s => this.getAffectedAnalysis(s.usageType)),
          suggestion: `Expected numeric value, got "${value}"`
        });
      }
    }
    
    return issues;
  }
  
  /**
   * Identify orphaned data fields that break mappings
   */
  findOrphanedFields(records: CollectionRecord[]): string[] {
    const orphaned: Set<string> = new Set();
    const mappedFieldIds = Object.keys(FIELD_STATISTIC_MAP);
    
    for (const record of records) {
      for (const fieldId of Object.keys(record.data)) {
        if (!mappedFieldIds.includes(fieldId) && record.data[fieldId]) {
          // Field exists in data but not in mapping
          orphaned.add(fieldId);
        }
      }
    }
    
    return Array.from(orphaned);
  }
  
  /**
   * Generate comprehensive debug report
   */
  generateDebugReport(records: CollectionRecord[]): LinkDebugReport {
    const allIssues: DataQualityIssue[] = [];
    const mappings = this.analyzeFieldMappings();
    const orphaned = this.findOrphanedFields(records);
    
    // Validate all records
    for (const record of records) {
      allIssues.push(...this.validateRecord(record));
    }
    
    // Calculate missing required fields statistics
    const missingByField: { [fieldId: string]: number } = {};
    for (const issue of allIssues.filter(i => i.issueType === 'missing')) {
      missingByField[issue.fieldId] = (missingByField[issue.fieldId] || 0) + 1;
    }
    
    const criticalIssues = allIssues.filter(i => i.severity === 'critical').length;
    const warnings = allIssues.filter(i => i.severity === 'warning').length;
    const validityScore = Math.max(0, 100 - (criticalIssues * 10 + warnings * 2));
    
    return {
      timestamp: new Date().toISOString(),
      totalRecords: records.length,
      totalFields: mappings.length,
      fieldMappings: mappings,
      dataQualityIssues: allIssues,
      summary: {
        criticalIssues,
        warnings,
        totalIssuesPerRecord: allIssues.length / Math.max(1, records.length),
        orphanedFields: orphaned,
        missingRequiredFields: Object.entries(missingByField)
          .map(([fieldId, count]) => ({
            fieldId,
            count,
            percentage: (count / records.length) * 100
          }))
          .sort((a, b) => b.percentage - a.percentage),
        validityScore
      },
      recommendations: this.generateRecommendations(allIssues, mappings, orphaned, records.length)
    };
  }
  
  /**
   * Get affected analysis for a usage type
   */
  private getAffectedAnalysis(usageType: string): string {
    const analysisMap: { [key: string]: string } = {
      grouping: 'Subgroup Analysis',
      metric: 'Statistical Summary',
      filter: 'Data Filtering',
      outcome: 'Outcome Analysis',
      predictor: 'Risk Prediction'
    };
    return analysisMap[usageType] || 'General Analysis';
  }
  
  /**
   * Get statistic usages for a field
   */
  private getStatisticUsages(fieldId: string, mapEntry?: any): StatisticUsage[] {
    if (!mapEntry) {
      return [{
        statisticId: 'unknown',
        statisticName: 'Unknown Statistics',
        usageType: 'filter',
        mappingStatus: 'deprecated',
        breakReason: `Field ${fieldId} has no registered statistics mapping`
      }];
    }
    
    return (mapEntry.criticalFor || []).map((analysis: string) => ({
      statisticId: analysis,
      statisticName: analysis.replace(/_/g, ' ').toUpperCase(),
      usageType: this.determineUsageType(analysis),
      mappingStatus: 'valid' as const
    }));
  }
  
  /**
   * Determine usage type from analysis
   */
  private determineUsageType(analysis: string): 'grouping' | 'metric' | 'filter' | 'outcome' | 'predictor' {
    if (analysis.includes('distribution') || analysis.includes('stratification')) return 'grouping';
    if (analysis.includes('outcome') || analysis.includes('primary')) return 'outcome';
    if (analysis.includes('predictor') || analysis.includes('factor')) return 'predictor';
    return 'metric';
  }
  
  /**
   * Get data type from field type
   */
  private getDataType(fieldType: string): 'text' | 'number' | 'date' | 'radio' | 'select' {
    const typeMap: { [key: string]: 'text' | 'number' | 'date' | 'radio' | 'select' } = {
      'TEXT': 'text',
      'NUMBER': 'number',
      'DATE': 'date',
      'RADIO': 'radio',
      'SELECT': 'select',
      'TEXTAREA': 'text'
    };
    return typeMap[fieldType] || 'text';
  }
  
  /**
   * Validate data type
   */
  private isValidDataType(value: any, type: string): boolean {
    switch (type) {
      case 'number':
        return !isNaN(Number(value));
      case 'date':
        return this.isValidDate(value);
      case 'radio':
      case 'select':
      case 'text':
        return typeof value === 'string' || typeof value === 'number';
      default:
        return true;
    }
  }
  
  /**
   * Validate date format
   */
  private isValidDate(dateStr: any): boolean {
    if (!dateStr) return false;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
  }
  
  /**
   * Generate recommendations
   */
  private generateRecommendations(
    issues: DataQualityIssue[],
    mappings: FieldMapping[],
    orphaned: string[],
    totalRecords: number
  ): string[] {
    const recommendations: string[] = [];
    
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push(`⚠️ CRITICAL: ${criticalIssues.length} data quality issues detected. These prevent accurate statistical analysis.`);
    }
    
    if (orphaned.length > 0) {
      recommendations.push(`🔗 ORPHANED FIELDS: ${orphaned.length} fields have data but no statistics mapping: ${orphaned.slice(0, 5).join(', ')}${orphaned.length > 5 ? '...' : ''}`);
    }
    
    // Find missing required fields
    const missingRequired = issues.filter(i => i.issueType === 'missing' && i.severity === 'critical');
    if (missingRequired.length > 0) {
      const fieldNames = [...new Set(missingRequired.map(i => i.fieldLabel))];
      recommendations.push(`📋 MISSING DATA: Fill required fields: ${fieldNames.join(', ')}`);
    }
    
    // Find format issues
    const formatIssues = issues.filter(i => i.issueType === 'invalid_format' || i.issueType === 'invalid_value');
    if (formatIssues.length > 0) {
      recommendations.push(`📝 FORMAT ERRORS: Fix data format in ${[...new Set(formatIssues.map(i => i.fieldId))].length} fields`);
    }
    
    if (issues.length === 0) {
      recommendations.push(`✅ EXCELLENT: All ${totalRecords} records have valid data-statistics mappings`);
    }
    
    return recommendations;
  }
}

export const debugger = new DataStatisticsDebugger();
export default DataStatisticsDebugger;
