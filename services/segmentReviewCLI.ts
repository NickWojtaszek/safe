/**
 * Segment-by-Segment Review CLI
 * 
 * Interactive tool to review each segment systematically:
 * 1. Display current segment definition
 * 2. Show linked statistics
 * 3. Identify issues
 * 4. Make corrections
 * 5. Generate verification report
 */

import { DATA_SCHEMA } from '../constants';
import { segmentReviewer, SegmentReview, SegmentComplianceReport } from './segmentReviewTool';
import { debugger as statisticsDebugger, FieldStatisticMap } from './dataStatisticsDebugger';

export interface SegmentReviewContext {
  currentSegmentIndex: number;
  totalSegments: number;
  completedSegments: string[];
  issuesFound: Map<string, any[]>;
  fieldStatisticMap: FieldStatisticMap;
}

export interface SegmentSummary {
  segmentId: string;
  segmentTitle: string;
  fieldCount: number;
  requiredFieldCount: number;
  issue: SegmentReview;
  statisticsLinked: string[];
  fieldDetails: FieldDetail[];
}

export interface FieldDetail {
  fieldId: string;
  label: string;
  type: string;
  isRequired: boolean;
  isLinkedToStatistics: boolean;
  linkedStatistics: string[];
  hasValidOptions?: boolean;
}

class SegmentBySegmentReviewer {
  private context: SegmentReviewContext;
  
  constructor() {
    this.context = {
      currentSegmentIndex: 0,
      totalSegments: DATA_SCHEMA.length,
      completedSegments: [],
      issuesFound: new Map(),
      fieldStatisticMap: {} // Will be populated from debugger
    };
  }
  
  /**
   * Start interactive review session
   */
  startReviewSession(): SegmentSummary[] {
    const reviews: SegmentSummary[] = [];
    
    console.log('\n' + '='.repeat(80));
    console.log('SEGMENT-BY-SEGMENT PROTOCOL COMPLIANCE REVIEW');
    console.log('Version 1.1 | SAFE-ARCH Aortic Intervention Study');
    console.log('='.repeat(80) + '\n');
    
    for (let i = 0; i < DATA_SCHEMA.length; i++) {
      const segment = DATA_SCHEMA[i];
      const review = this.reviewSegmentInteractive(segment, i);
      reviews.push(review);
    }
    
    return reviews;
  }
  
  /**
   * Review a single segment with detailed output
   */
  private reviewSegmentInteractive(segment: any, index: number): SegmentSummary {
    const review = segmentReviewer.reviewSegment(
      segment.id,
      segment.title,
      segment.description,
      segment.fields,
      {}
    );
    
    const fieldDetails = segment.fields.map((field: any) => ({
      fieldId: field.id,
      label: field.label,
      type: field.type,
      isRequired: field.required || false,
      isLinkedToStatistics: this.isFieldLinkedToStatistics(field.id),
      linkedStatistics: this.getLinkedStatistics(field.id),
      hasValidOptions: field.type === 'radio' || field.type === 'select' ? !!field.options : undefined
    }));
    
    this.printSegmentReview(segment, review, fieldDetails, index);
    
    return {
      segmentId: segment.id,
      segmentTitle: segment.title,
      fieldCount: segment.fields.length,
      requiredFieldCount: segment.fields.filter((f: any) => f.required).length,
      issue: review,
      statisticsLinked: review.linkedStatistics,
      fieldDetails
    };
  }
  
  /**
   * Print detailed segment review
   */
  private printSegmentReview(segment: any, review: SegmentReview, fieldDetails: FieldDetail[], index: number): void {
    console.log('\n' + '─'.repeat(80));
    console.log(`[${index + 1}/${DATA_SCHEMA.length}] ${review.segmentTitle}`);
    console.log('─'.repeat(80));
    console.log(`Segment ID: ${review.segmentId}`);
    console.log(`Description: ${review.description}`);
    console.log(`Status: ${this.getStatusEmoji(review.status)} ${review.status.toUpperCase()}`);
    console.log(`Fields: ${review.fieldCount} (${review.requiredFieldCount} required)`);
    
    // Print statistics mappings
    if (review.linkedStatistics.length > 0) {
      console.log(`\nLinked Statistics:`);
      review.linkedStatistics.forEach(stat => {
        console.log(`  • ${stat.replace(/_/g, ' ').toUpperCase()}`);
      });
    }
    
    // Print field details
    console.log(`\nField Details:`);
    for (const field of fieldDetails) {
      const statusIcon = field.isLinkedToStatistics ? '✓' : '✗';
      const reqIcon = field.isRequired ? '[REQ]' : '[OPT]';
      console.log(`  ${statusIcon} ${field.label} (${field.fieldId}) - ${field.type} ${reqIcon}`);
      
      if (field.linkedStatistics.length > 0) {
        console.log(`      → Uses: ${field.linkedStatistics.join(', ')}`);
      }
      
      if (field.type === 'radio' || field.type === 'select') {
        const hasOptions = field.hasValidOptions ? '✓' : '✗';
        console.log(`      ${hasOptions} Options defined`);
      }
    }
    
    // Print issues
    if (review.issues.length > 0) {
      console.log(`\n⚠️  Issues Found (${review.issues.length}):`);
      review.issues.forEach(issue => {
        const severityIcon = issue.severity === 'critical' ? '🔴' : '🟡';
        console.log(`  ${severityIcon} [${issue.issueType.toUpperCase()}] ${issue.fieldLabel}`);
        console.log(`     ${issue.description}`);
        console.log(`     Action: ${issue.suggestedAction}`);
      });
    } else {
      console.log(`\n✅ No issues found`);
    }
    
    // Print recommendations
    if (review.recommendations.length > 0) {
      console.log(`\n💡 Recommendations:`);
      review.recommendations.forEach(rec => {
        console.log(`  ${rec}`);
      });
    }
  }
  
  /**
   * Check if field is linked to statistics
   */
  private isFieldLinkedToStatistics(fieldId: string): boolean {
    // This would be populated from the debugger's mapping
    return false; // Placeholder
  }
  
  /**
   * Get statistics linked to field
   */
  private getLinkedStatistics(fieldId: string): string[] {
    // This would be populated from the debugger's mapping
    return [];
  }
  
  /**
   * Get status emoji
   */
  private getStatusEmoji(status: string): string {
    const emojiMap: { [key: string]: string } = {
      'complete': '✅',
      'incomplete': '❌',
      'needs_update': '⚠️',
      'deprecated': '🗑️'
    };
    return emojiMap[status] || '❓';
  }
  
  /**
   * Generate final compliance report
   */
  generateFinalReport(reviews: SegmentSummary[]): SegmentComplianceReport {
    const segmentReviews = reviews.map(r => r.issue);
    return segmentReviewer.generateComplianceReport(segmentReviews);
  }
  
  /**
   * Export review results to JSON
   */
  exportReviewResults(reviews: SegmentSummary[], report: SegmentComplianceReport): string {
    return JSON.stringify({
      timestamp: report.timestamp,
      protocolVersion: report.protocolVersion,
      overallStatus: report.overallStatus,
      totalSegments: report.totalSegments,
      completeSegments: report.completeSegments,
      criticalIssues: report.criticalIssues,
      segments: reviews.map(r => ({
        id: r.segmentId,
        title: r.segmentTitle,
        status: r.issue.status,
        fieldCount: r.fieldCount,
        requiredFieldCount: r.requiredFieldCount,
        issueCount: r.issue.issues.length,
        issues: r.issue.issues,
        recommendations: r.issue.recommendations
      })),
      recommendations: report.recommendations
    }, null, 2);
  }
}

export const segmentReviewer = new SegmentBySegmentReviewer();
export default SegmentBySegmentReviewer;
