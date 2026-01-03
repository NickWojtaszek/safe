/**
 * Complete Debugger Integration Example
 * 
 * Shows how to use all three tools together:
 * 1. DataStatisticsDebugger - Find broken links
 * 2. SegmentReviewTool - Review segment compliance
 * 3. SegmentBySegmentCLI - Interactive review
 * 
 * This can be run from the admin panel or CLI
 */

import { debugger as statisticsDebugger } from './services/dataStatisticsDebugger';
import { segmentReviewer } from './services/segmentReviewTool';
import { segmentReviewer as cliReviewer } from './services/segmentReviewCLI';
import { DATA_SCHEMA, MOCK_DATA } from './constants';

export interface DebuggerSession {
  sessionId: string;
  timestamp: string;
  phase: 'scanning' | 'reviewing' | 'reporting' | 'complete';
  results: DebuggerResults;
  recommendations: string[];
  nextSteps: string[];
}

export interface DebuggerResults {
  dataIntegrityReport: any;
  segmentReviews: any[];
  criticalIssuesSummary: {
    totalCritical: number;
    bySeverity: { critical: number; warning: number; info: number };
    byType: { [type: string]: number };
    bySegment: { [segmentId: string]: number };
  };
  fieldMappingStatus: {
    totalFields: number;
    properlyMapped: number;
    orphaned: string[];
    deprecated: string[];
  };
}

class DebuggerIntegration {
  /**
   * Run complete debugging session
   */
  async runCompleteDiagnostics(records: any[] = MOCK_DATA): Promise<DebuggerSession> {
    const sessionId = `debug-${Date.now()}`;
    
    console.log('\n' + '='.repeat(80));
    console.log('STARTING COMPLETE DATA-STATISTICS DEBUGGER SESSION');
    console.log('='.repeat(80));
    console.log(`Session ID: ${sessionId}`);
    console.log(`Records to analyze: ${records.length}\n`);
    
    // Phase 1: Data Integrity Scan
    console.log('Phase 1: Scanning data integrity...');
    const dataReport = statisticsDebugger.generateDebugReport(records);
    console.log(`  ✓ Found ${dataReport.summary.criticalIssues} critical issues`);
    console.log(`  ✓ Found ${dataReport.summary.warnings} warnings`);
    console.log(`  ✓ Data validity score: ${dataReport.summary.validityScore}%\n`);
    
    // Phase 2: Segment Compliance Review
    console.log('Phase 2: Reviewing segment compliance...');
    const segmentReviews = DATA_SCHEMA.map(segment => {
      const review = segmentReviewer.reviewSegment(
        segment.id,
        segment.title,
        segment.description,
        segment.fields,
        this.buildFieldStatisticMap(dataReport)
      );
      return review;
    });
    
    const completeSegments = segmentReviews.filter(s => s.status === 'complete').length;
    console.log(`  ✓ Reviewed ${segmentReviews.length} segments`);
    console.log(`  ✓ ${completeSegments} compliant, ${segmentReviews.length - completeSegments} need attention\n`);
    
    // Phase 3: Critical Issue Summary
    console.log('Phase 3: Analyzing critical issues...');
    const criticalSummary = this.summarizeCriticalIssues(dataReport, segmentReviews);
    console.log(`  ✓ ${criticalSummary.totalCritical} total critical issues`);
    Object.entries(criticalSummary.bySegment).forEach(([segId, count]) => {
      if (count > 0) {
        const segment = DATA_SCHEMA.find(s => s.id === segId);
        console.log(`    • ${segment?.title}: ${count} issue(s)`);
      }
    });
    console.log('');
    
    // Phase 4: Generate Recommendations
    const recommendations = this.generateRecommendations(dataReport, segmentReviews, criticalSummary);
    const nextSteps = this.generateNextSteps(criticalSummary, dataReport);
    
    const results: DebuggerResults = {
      dataIntegrityReport: dataReport,
      segmentReviews,
      criticalIssuesSummary: criticalSummary,
      fieldMappingStatus: {
        totalFields: dataReport.totalFields,
        properlyMapped: dataReport.fieldMappings.filter(f => f.statistics.length > 0).length,
        orphaned: dataReport.summary.orphanedFields,
        deprecated: []
      }
    };
    
    const session: DebuggerSession = {
      sessionId,
      timestamp: new Date().toISOString(),
      phase: 'complete',
      results,
      recommendations,
      nextSteps
    };
    
    this.printSessionSummary(session);
    return session;
  }
  
  /**
   * Build field-to-statistic map from debugger output
   */
  private buildFieldStatisticMap(report: any): { [fieldId: string]: string[] } {
    const map: { [fieldId: string]: string[] } = {};
    report.fieldMappings.forEach((mapping: any) => {
      map[mapping.fieldId] = mapping.usedInStatistics;
    });
    return map;
  }
  
  /**
   * Summarize critical issues by category
   */
  private summarizeCriticalIssues(dataReport: any, segmentReviews: any[]) {
    const criticalIssues = dataReport.dataQualityIssues.filter((i: any) => i.severity === 'critical');
    const byType: { [type: string]: number } = {};
    const bySegment: { [segId: string]: number } = {};
    
    criticalIssues.forEach((issue: any) => {
      byType[issue.issueType] = (byType[issue.issueType] || 0) + 1;
    });
    
    segmentReviews.forEach(review => {
      const segCritical = review.issues.filter((i: any) => i.severity === 'critical').length;
      if (segCritical > 0) {
        bySegment[review.segmentId] = segCritical;
      }
    });
    
    return {
      totalCritical: criticalIssues.length + segmentReviews.reduce((sum: number, s: any) => 
        sum + s.issues.filter((i: any) => i.severity === 'critical').length, 0),
      bySeverity: {
        critical: criticalIssues.length,
        warning: dataReport.dataQualityIssues.filter((i: any) => i.severity === 'warning').length,
        info: dataReport.dataQualityIssues.filter((i: any) => i.severity === 'info').length
      },
      byType,
      bySegment
    };
  }
  
  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(dataReport: any, segmentReviews: any[], criticalSummary: any): string[] {
    const recs: string[] = [];
    
    // Data integrity recommendations
    if (criticalSummary.bySeverity.critical > 0) {
      recs.push(`🔴 URGENT: Fix ${criticalSummary.bySeverity.critical} critical data issues before analysis`);
    }
    
    // Missing required fields
    if (dataReport.summary.missingRequiredFields.length > 0) {
      const missing = dataReport.summary.missingRequiredFields.slice(0, 3);
      recs.push(`📋 Missing Data: ${missing.map((m: any) => `${m.fieldId} (${m.percentage.toFixed(0)}%)`).join(', ')}`);
    }
    
    // Orphaned fields
    if (dataReport.summary.orphanedFields.length > 0) {
      recs.push(`🔗 Orphaned Fields: ${dataReport.summary.orphanedFields.slice(0, 3).join(', ')} have no statistics mapping`);
    }
    
    // Segment status
    const incompleteSegments = segmentReviews.filter(s => s.status !== 'complete');
    if (incompleteSegments.length > 0) {
      recs.push(`⚠️ Segment Issues: ${incompleteSegments.length} segments need attention (${
        incompleteSegments.map(s => s.segmentTitle).join(', ').substring(0, 50)
      }...)`);
    }
    
    // Data validity
    if (dataReport.summary.validityScore < 80) {
      recs.push(`📊 Data Quality: Validity score is ${dataReport.summary.validityScore}% - review and fix issues`);
    }
    
    return recs;
  }
  
  /**
   * Generate next action items
   */
  private generateNextSteps(criticalSummary: any, dataReport: any): string[] {
    const steps: string[] = [];
    
    if (criticalSummary.totalCritical === 0) {
      steps.push('1. ✅ All data integrity checks passed');
      steps.push('2. 📊 Proceed to statistical analysis');
      steps.push('3. 📈 Generate outcome reports');
      steps.push('4. 📝 Export data for publication');
    } else {
      steps.push('1. 🔍 Review critical issues using debugger report');
      
      const missingCount = dataReport.dataQualityIssues.filter((i: any) => i.issueType === 'missing').length;
      if (missingCount > 0) {
        steps.push(`2. 📋 Fill ${missingCount} missing required fields in records`);
      }
      
      const invalidCount = dataReport.dataQualityIssues.filter((i: any) => i.issueType === 'invalid_value').length;
      if (invalidCount > 0) {
        steps.push(`3. ✏️ Correct ${invalidCount} invalid field values`);
      }
      
      const brokenLinks = dataReport.dataQualityIssues.filter((i: any) => i.issueType === 'broken_link').length;
      if (brokenLinks > 0) {
        steps.push(`4. 🔗 Establish statistics mappings for ${brokenLinks} broken links`);
      }
      
      steps.push('5. 🔄 Re-run debugger to verify all fixes');
    }
    
    return steps;
  }
  
  /**
   * Print session summary
   */
  private printSessionSummary(session: DebuggerSession): void {
    console.log('\n' + '='.repeat(80));
    console.log('DEBUGGER SESSION SUMMARY');
    console.log('='.repeat(80) + '\n');
    
    console.log('📊 DATA INTEGRITY:');
    console.log(`   Validity Score: ${session.results.dataIntegrityReport.summary.validityScore}%`);
    console.log(`   Critical Issues: ${session.results.criticalIssuesSummary.bySeverity.critical}`);
    console.log(`   Warnings: ${session.results.criticalIssuesSummary.bySeverity.warning}\n`);
    
    console.log('📋 SEGMENT COMPLIANCE:');
    const complete = session.results.segmentReviews.filter(s => s.status === 'complete').length;
    console.log(`   Compliant: ${complete}/${session.results.segmentReviews.length}`);
    console.log(`   Status: ${complete === session.results.segmentReviews.length ? '✅ COMPLIANT' : '⚠️ NEEDS ATTENTION'}\n`);
    
    console.log('🔗 FIELD MAPPINGS:');
    console.log(`   Total Fields: ${session.results.fieldMappingStatus.totalFields}`);
    console.log(`   Mapped: ${session.results.fieldMappingStatus.properlyMapped}`);
    console.log(`   Orphaned: ${session.results.fieldMappingStatus.orphaned.length}\n`);
    
    console.log('💡 RECOMMENDATIONS:');
    session.recommendations.forEach(rec => console.log(`   ${rec}`));
    
    console.log('\n📌 NEXT STEPS:');
    session.nextSteps.forEach(step => console.log(`   ${step}`));
    
    console.log('\n' + '='.repeat(80) + '\n');
  }
  
  /**
   * Export session results to JSON
   */
  exportSession(session: DebuggerSession): string {
    return JSON.stringify({
      sessionId: session.sessionId,
      timestamp: session.timestamp,
      summary: {
        validityScore: session.results.dataIntegrityReport.summary.validityScore,
        criticalIssues: session.results.criticalIssuesSummary.totalCritical,
        completeSegments: session.results.segmentReviews.filter(s => s.status === 'complete').length,
        totalSegments: session.results.segmentReviews.length,
        properlyMappedFields: session.results.fieldMappingStatus.properlyMapped,
        totalFields: session.results.fieldMappingStatus.totalFields
      },
      issues: {
        byType: session.results.criticalIssuesSummary.byType,
        bySegment: session.results.criticalIssuesSummary.bySegment,
        orphanedFields: session.results.fieldMappingStatus.orphaned
      },
      recommendations: session.recommendations,
      nextSteps: session.nextSteps
    }, null, 2);
  }
}

export const debuggerIntegration = new DebuggerIntegration();
export default DebuggerIntegration;

// Example usage:
// import { debuggerIntegration } from './services/debuggerIntegration';
// 
// (async () => {
//   const session = await debuggerIntegration.runCompleteDiagnostics();
//   const json = debuggerIntegration.exportSession(session);
//   console.log(json);
// })();
