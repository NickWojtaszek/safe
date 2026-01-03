/**
 * Segment Review & Protocol Compliance Checker
 * 
 * Reviews each protocol segment (sekcja) to ensure:
 * 1. All fields match current protocol specifications
 * 2. Field definitions are complete and accurate
 * 3. Links to statistics are properly established
 * 4. No deprecated or orphaned fields exist
 */

export interface SegmentReview {
  segmentId: string;
  segmentTitle: string;
  description: string;
  fieldCount: number;
  requiredFieldCount: number;
  status: 'complete' | 'incomplete' | 'needs_update' | 'deprecated';
  issues: SegmentIssue[];
  linkedStatistics: string[];
  protocolVersion: string;
  lastReviewDate: string;
  recommendations: string[];
}

export interface SegmentIssue {
  fieldId: string;
  fieldLabel: string;
  issueType: 'missing_from_protocol' | 'deprecated' | 'incomplete_definition' | 'broken_link' | 'renamed_field' | 'duplicate_field';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  suggestedAction: string;
  linkedStatistics: string[];
}

export interface SegmentComplianceReport {
  timestamp: string;
  protocolVersion: string;
  totalSegments: number;
  completeSegments: number;
  segmentReviews: SegmentReview[];
  overallStatus: 'compliant' | 'partially_compliant' | 'non_compliant';
  criticalIssues: number;
  recommendations: string[];
}

class SegmentReviewTool {
  private segmentStatisticsMappings: { [segmentId: string]: string[] } = {
    sec_a_admin: ['administrative_metadata', 'study_tracking'],
    sec_b_demo: ['demographic_distribution', 'age_distribution', 'sex_subgroups'],
    sec_c_comorb: ['comorbidity_prevalence', 'risk_factors', 'stroke_predictors'],
    sec_d_patho: ['indication_stratification', 'anatomy_risk_factors', 'aorta_size_risk'],
    sec_e_neuro_pre: ['willis_risk_assessment', 'cerebral_perfusion_reserve', 'stroke_predictors'],
    sec_f_cardiac: ['cardiac_function_baseline', 'risk_factors'],
    sec_g_proc: ['procedural_characteristics', 'device_comparison', 'technical_outcomes'],
    sec_g2_matasa: ['lifs_tolerance_assessment', 'device_limitations'],
    sec_h_hemo: ['intraoperative_monitoring', 'hemodynamic_stability', 'nirs_correlation'],
    sec_i_protection: ['embolic_protection_strategy', 'device_debris_analysis'],
    sec_j_completion: ['technical_success', 'complications', 'endoleak_assessment'],
    sec_k_neuro_outcome: ['primary_outcome_stroke', 'stroke_severity', 'functional_outcome', 'risk_correlation'],
    sec_l_complications: ['safety_outcomes', 'adverse_events', 'complication_rates'],
    sec_m_death: ['mortality_assessment', 'cause_of_death'],
    sec_n_followup: ['long_term_outcomes', 'follow_up_duration'],
    sec_o_quality: ['data_quality_assessment']
  };

  private protocolVersion = '1.1';
  
  /**
   * Review a single segment for completeness and compliance
   */
  reviewSegment(
    segmentId: string,
    segmentTitle: string,
    description: string,
    fields: any[],
    currentStatisticsMap: { [fieldId: string]: string[] }
  ): SegmentReview {
    const issues: SegmentIssue[] = [];
    const linkedStatistics = this.segmentStatisticsMappings[segmentId] || [];
    
    // Check field definitions
    for (const field of fields) {
      // Check required fields have proper definitions
      if (field.required && !field.type) {
        issues.push({
          fieldId: field.id,
          fieldLabel: field.label,
          issueType: 'incomplete_definition',
          severity: 'critical',
          description: 'Required field missing type definition',
          suggestedAction: `Add type definition for field "${field.label}"`,
          linkedStatistics: currentStatisticsMap[field.id] || []
        });
      }
      
      // Check for fields that should have options
      if (['radio', 'select'].includes(field.type) && !field.options) {
        issues.push({
          fieldId: field.id,
          fieldLabel: field.label,
          issueType: 'incomplete_definition',
          severity: 'critical',
          description: 'Choice field missing options array',
          suggestedAction: `Define options array for field "${field.label}"`,
          linkedStatistics: currentStatisticsMap[field.id] || []
        });
      }
      
      // Check for broken statistics links
      if (currentStatisticsMap[field.id] && currentStatisticsMap[field.id].length === 0) {
        issues.push({
          fieldId: field.id,
          fieldLabel: field.label,
          issueType: 'broken_link',
          severity: 'warning',
          description: 'Field has data but no linked statistics',
          suggestedAction: `Map field "${field.label}" to applicable statistics in dataStatisticsDebugger`,
          linkedStatistics: []
        });
      }
    }
    
    // Check for deprecated fields (fields not in current protocol)
    const deprecatedFieldNames = this.findDeprecatedFields(segmentId, fields);
    for (const fieldName of deprecatedFieldNames) {
      issues.push({
        fieldId: fieldName,
        fieldLabel: fieldName,
        issueType: 'deprecated',
        severity: 'warning',
        description: `Field "${fieldName}" appears to be deprecated or no longer used`,
        suggestedAction: `Review and either re-enable or remove field "${fieldName}" from all records`,
        linkedStatistics: []
      });
    }
    
    const requiredFields = fields.filter(f => f.required).length;
    const allFieldsComplete = fields.every(f => f.type && (f.type !== 'radio' && f.type !== 'select' || f.options));
    const allLinksValid = fields.every(f => !currentStatisticsMap[f.id] || currentStatisticsMap[f.id].length > 0);
    
    let status: 'complete' | 'incomplete' | 'needs_update' | 'deprecated';
    if (issues.filter(i => i.severity === 'critical').length > 0) {
      status = 'incomplete';
    } else if (issues.filter(i => i.severity === 'warning').length > 0) {
      status = 'needs_update';
    } else {
      status = 'complete';
    }
    
    const recommendations = this.generateSegmentRecommendations(
      segmentTitle,
      issues,
      fields.length,
      requiredFields
    );
    
    return {
      segmentId,
      segmentTitle,
      description,
      fieldCount: fields.length,
      requiredFieldCount: requiredFields,
      status,
      issues,
      linkedStatistics,
      protocolVersion: this.protocolVersion,
      lastReviewDate: new Date().toISOString(),
      recommendations
    };
  }
  
  /**
   * Find fields that might be deprecated
   */
  private findDeprecatedFields(segmentId: string, fields: any[]): string[] {
    const deprecatedPatterns = ['_old', '_deprecated', '_v0', '__backup'];
    return fields
      .filter(f => deprecatedPatterns.some(pattern => f.id.includes(pattern)))
      .map(f => f.id);
  }
  
  /**
   * Generate segment-specific recommendations
   */
  private generateSegmentRecommendations(
    segmentTitle: string,
    issues: SegmentIssue[],
    fieldCount: number,
    requiredFieldCount: number
  ): string[] {
    const recommendations: string[] = [];
    
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    
    if (criticalCount > 0) {
      recommendations.push(`⚠️ CRITICAL: Fix ${criticalCount} critical issue(s) in ${segmentTitle} before data collection`);
    }
    
    if (warningCount > 0) {
      recommendations.push(`⚠️ WARNING: Address ${warningCount} warning(s) to ensure data consistency`);
    }
    
    if (requiredFieldCount / fieldCount > 0.7) {
      recommendations.push(`📋 HIGH BURDEN: ${requiredFieldCount} of ${fieldCount} fields are required - consider making optional fields for convenience`);
    }
    
    const brokenLinks = issues.filter(i => i.issueType === 'broken_link');
    if (brokenLinks.length > 0) {
      recommendations.push(`🔗 STATISTICS MAPPING: Link ${brokenLinks.length} field(s) to statistics for analysis`);
    }
    
    if (issues.length === 0) {
      recommendations.push(`✅ COMPLIANT: ${segmentTitle} is fully compliant with current protocol`);
    }
    
    return recommendations;
  }
  
  /**
   * Generate comprehensive compliance report for all segments
   */
  generateComplianceReport(
    segmentReviews: SegmentReview[]
  ): SegmentComplianceReport {
    const completeCount = segmentReviews.filter(s => s.status === 'complete').length;
    const criticalCount = segmentReviews.reduce((sum, s) => sum + s.issues.filter(i => i.severity === 'critical').length, 0);
    
    let overallStatus: 'compliant' | 'partially_compliant' | 'non_compliant';
    if (criticalCount === 0 && completeCount === segmentReviews.length) {
      overallStatus = 'compliant';
    } else if (criticalCount > 0 && completeCount > 0) {
      overallStatus = 'partially_compliant';
    } else {
      overallStatus = 'non_compliant';
    }
    
    const allRecommendations = segmentReviews
      .flatMap(s => s.recommendations)
      .filter((v, i, a) => a.indexOf(v) === i); // dedup
    
    return {
      timestamp: new Date().toISOString(),
      protocolVersion: this.protocolVersion,
      totalSegments: segmentReviews.length,
      completeSegments: completeCount,
      segmentReviews,
      overallStatus,
      criticalIssues: criticalCount,
      recommendations: allRecommendations
    };
  }
}

export const segmentReviewer = new SegmentReviewTool();
export default SegmentReviewTool;
