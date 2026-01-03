# Data-Statistics Link Debugger & Segment Review Guide

## Overview

This toolkit provides three integrated tools to systematically review the SAFE-ARCH protocol, identify data-statistics mismatches, and fix broken relationships:

1. **Data-Statistics Debugger** - Validates field-to-statistic mappings
2. **Segment Review Tool** - Reviews protocol compliance by segment
3. **Segment-by-Segment CLI** - Interactive review and remediation

---

## Tool 1: Data-Statistics Debugger

### Purpose
Analyzes field definitions and identifies which data fields are properly linked to statistics calculations. Detects:
- Missing required fields in records
- Data type mismatches
- Invalid field values
- Broken statistics links
- Orphaned data (fields with data but no statistics mapping)

### Key Interfaces

#### `FieldMapping`
Maps a single field to its statistics:
```typescript
{
  fieldId: 'any_stroke_30d',
  fieldLabel: 'Jakikolwiek udar',
  sectionId: 'sec_k_neuro_outcome',
  usedInStatistics: ['primary_outcome_stroke', 'stroke_rate'],
  dataType: 'radio',
  isRequired: true,
  validValues: ['tak', 'nie', 'nieznane'],
  statistics: [
    { 
      statisticId: 'primary_outcome', 
      statisticName: 'PRIMARY OUTCOME', 
      usageType: 'outcome',
      mappingStatus: 'valid'
    }
  ]
}
```

#### `DataQualityIssue`
Identifies problems in individual records:
```typescript
{
  recordId: 'record-123',
  fieldId: 'any_stroke_30d',
  fieldLabel: 'Jakikolwiek udar',
  currentValue: undefined,
  expectedType: 'radio',
  issueType: 'missing',  // missing | invalid_format | invalid_value | type_mismatch
  severity: 'critical',
  linkedStatistics: ['primary_outcome_stroke'],
  affectedAnalysis: ['Outcome Analysis'],
  suggestion: 'This field is required for primary outcome calculation'
}
```

#### `LinkDebugReport`
Complete analysis of all records:
```typescript
{
  timestamp: '2025-01-02T10:30:00Z',
  totalRecords: 50,
  totalFields: 150,
  fieldMappings: [...],
  dataQualityIssues: [...],
  summary: {
    criticalIssues: 3,
    warnings: 7,
    totalIssuesPerRecord: 0.2,
    orphanedFields: ['old_field_1', 'deprecated_measure'],
    missingRequiredFields: [
      { fieldId: 'any_stroke_30d', count: 2, percentage: 4 }
    ],
    validityScore: 94
  },
  recommendations: [...]
}
```

### Usage

#### Basic Report Generation
```typescript
import { debugger } from './services/dataStatisticsDebugger';
import { MOCK_DATA } from './constants';

// Generate complete debug report
const report = debugger.generateDebugReport(MOCK_DATA);

console.log(`Data Validity Score: ${report.summary.validityScore}%`);
console.log(`Critical Issues: ${report.summary.criticalIssues}`);
console.log(`Warnings: ${report.summary.warnings}`);

report.recommendations.forEach(rec => console.log(`- ${rec}`));
```

#### Analyze Field Mappings
```typescript
// Get all field-to-statistic mappings
const mappings = debugger.analyzeFieldMappings();

// Find fields used in primary outcomes
const primaryOutcomeMappings = mappings.filter(m => 
  m.statistics.some(s => s.usageType === 'outcome')
);

primaryOutcomeMappings.forEach(m => {
  console.log(`${m.fieldLabel}:`);
  console.log(`  Used in: ${m.usedInStatistics.join(', ')}`);
});
```

#### Validate Single Record
```typescript
const issues = debugger.validateRecord(MOCK_DATA[0]);

// Group by severity
const critical = issues.filter(i => i.severity === 'critical');
const warnings = issues.filter(i => i.severity === 'warning');

console.log(`Critical: ${critical.length}, Warnings: ${warnings.length}`);
```

#### Find Orphaned Fields
```typescript
const orphaned = debugger.findOrphanedFields(MOCK_DATA);
console.log(`Fields with data but no statistics mapping: ${orphaned.join(', ')}`);
```

### Core Mappings (Field → Statistics)

The debugger defines these key field mappings:

| Field | Statistics Used | Critical For |
|-------|-----------------|--------------|
| `any_stroke_30d` | primary_outcome_stroke, stroke_rate | Primary Outcome |
| `mrs_at_30d` | functional_outcome | Primary Outcome |
| `death_any_30d` | mortality_30d | Safety |
| `shaggy_aorta` | shaggy_predictor | Risk Factors |
| `epd_used_proc` | epd_protective_effect | Protection Analysis |
| `rso2_delta_max_r/l` | nirs_oxygenation | Monitoring |
| `endoleak_type_1` | endoleak_rate | Safety |
| `aki_akin_ge_2` | aki_rate | Safety |
| `proc_config` | config_comparison | Subgroup Analysis |

---

## Tool 2: Segment Review Tool

### Purpose
Reviews each protocol segment (sekcja) for:
- Field definition completeness
- Required field coverage
- Statistics mappings
- Deprecated fields
- Protocol version compliance

### Key Interfaces

#### `SegmentReview`
Status of a single segment:
```typescript
{
  segmentId: 'sec_k_neuro_outcome',
  segmentTitle: 'Sekcja K: Wyniki Neurologiczne',
  fieldCount: 25,
  requiredFieldCount: 8,
  status: 'complete',  // complete | incomplete | needs_update | deprecated
  issues: [...],
  linkedStatistics: [
    'primary_outcome_stroke',
    'stroke_severity',
    'functional_outcome'
  ],
  protocolVersion: '1.1',
  recommendations: [...]
}
```

#### `SegmentIssue`
Problem within a segment:
```typescript
{
  fieldId: 'stroke_type_cat',
  fieldLabel: 'Typ udaru',
  issueType: 'broken_link',  // missing_from_protocol | deprecated | etc.
  severity: 'warning',
  description: 'Field has data but no linked statistics',
  suggestedAction: 'Map stroke_type_cat to stroke_type_distribution in debugger',
  linkedStatistics: []
}
```

### Segment Breakdown

All 16 segments reviewed:

| # | Segment ID | Title | Fields | Required | Key Statistics |
|---|-----------|-------|--------|----------|-----------------|
| 1 | sec_a_admin | Dane Administracyjne | 6 | 4 | Study tracking |
| 2 | sec_b_demo | Dane Demograficzne | 8 | 2 | Demographics |
| 3 | sec_c_comorb | Choroby Współistniejące | 36 | 8 | Risk factors |
| 4 | sec_d_patho | Wskazanie i Patologia Aorty | 33 | 15 | Anatomy risk |
| 5 | sec_e_neuro_pre | Ocena Naczyń Mózgowych | 21 | 1 | Willis risk |
| 6 | sec_f_cardiac | Ocena Kardiologiczna | 15 | 2 | Cardiac function |
| 7 | sec_g_proc | Dane Proceduralne | 21 | 12 | Technical outcomes |
| 8 | sec_g2_matasa | Próba Matasa | 8 | 3 | LIFS assessment |
| 9 | sec_h_hemo | Monitorowanie i Hemodynamika | 37 | 1 | Monitoring |
| 10 | sec_i_protection | Ochrona przed Zatorami | 17 | 2 | Embolic protection |
| 11 | sec_j_completion | Zakończenie Zabiegu | 18 | 8 | Technical success |
| 12 | sec_k_neuro_outcome | Wyniki Neurologiczne | 30 | 8 | **PRIMARY OUTCOME** |
| 13 | sec_l_complications | Inne Powikłania | 23 | 0 | Safety outcomes |
| 14 | sec_m_death | Śmiertelność | 6 | 2 | Mortality |
| 15 | sec_n_followup | Obserwacja | 8 | 0 | Long-term outcomes |
| 16 | sec_o_quality | Jakość Danych | 6 | 3 | Data quality |

### Usage

```typescript
import { segmentReviewer } from './services/segmentReviewTool';
import { DATA_SCHEMA } from './constants';

// Review a single segment
const segment = DATA_SCHEMA[11]; // sec_k_neuro_outcome
const review = segmentReviewer.reviewSegment(
  segment.id,
  segment.title,
  segment.description,
  segment.fields,
  {}  // fieldStatisticMap
);

console.log(`Status: ${review.status}`);
console.log(`Issues: ${review.issues.length}`);
review.issues.forEach(issue => {
  console.log(`  - [${issue.severity}] ${issue.description}`);
});

// Generate compliance report for all segments
const allReviews = DATA_SCHEMA.map(seg => 
  segmentReviewer.reviewSegment(
    seg.id, seg.title, seg.description, seg.fields, {}
  )
);

const report = segmentReviewer.generateComplianceReport(allReviews);
console.log(`Overall Status: ${report.overallStatus}`);
console.log(`Compliant Segments: ${report.completeSegments}/${report.totalSegments}`);
```

---

## Tool 3: Segment-by-Segment CLI

### Purpose
Provides interactive, human-readable output for reviewing segments one-by-one with detailed field-level information.

### Usage

```typescript
import { segmentReviewer } from './services/segmentReviewCLI';

// Start interactive review session
const reviews = segmentReviewer.startReviewSession();

// Get final compliance report
const report = segmentReviewer.generateFinalReport(reviews);

// Export results
const json = segmentReviewer.exportReviewResults(reviews, report);
fs.writeFileSync('review-report.json', json);
```

### Output Example

```
================================================================================
SEGMENT-BY-SEGMENT PROTOCOL COMPLIANCE REVIEW
Version 1.1 | SAFE-ARCH Aortic Intervention Study
================================================================================

────────────────────────────────────────────────────────────────────────────────
[12/16] Sekcja K: Wyniki Neurologiczne
────────────────────────────────────────────────────────────────────────────────
Segment ID: sec_k_neuro_outcome
Description: Ocena powikłań v1.1 - ROZSZERZONA
Status: ✅ COMPLETE
Fields: 30 (8 required)

Linked Statistics:
  • PRIMARY OUTCOME STROKE
  • STROKE SEVERITY
  • FUNCTIONAL OUTCOME
  • RISK CORRELATION

Field Details:
  ✓ Nowy ogniskowy deficyt neurologiczny przy wybudzeniu (new_neuro_deficit_at_wake) - radio [REQ]
      → Uses: primary_outcome
      ✓ Options defined
  ✗ Udar (w ciągu 30 dni) (any_stroke_30d) - radio [REQ]
      → Uses: primary_outcome_stroke, stroke_rate
      ✓ Options defined

✅ No issues found

💡 Recommendations:
  ✅ COMPLIANT: Sekcja K: Wyniki Neurologiczne is fully compliant with current protocol
```

---

## Workflow: Complete Segment Review

### Step 1: Run Debugger to Identify Broken Links
```typescript
import { debugger } from './services/dataStatisticsDebugger';
import { MOCK_DATA } from './constants';

const report = debugger.generateDebugReport(MOCK_DATA);

console.log('\n=== BROKEN LINKS ===');
report.dataQualityIssues
  .filter(i => i.issueType === 'broken_link')
  .forEach(issue => {
    console.log(`${issue.fieldId}: ${issue.suggestion}`);
  });
```

### Step 2: Review Segment Compliance
```typescript
import { segmentReviewer } from './services/segmentReviewTool';
import { DATA_SCHEMA } from './constants';

DATA_SCHEMA.forEach((segment, idx) => {
  const review = segmentReviewer.reviewSegment(
    segment.id,
    segment.title,
    segment.description,
    segment.fields,
    {}
  );
  
  if (review.issues.length > 0) {
    console.log(`\n${idx + 1}. ${segment.title}`);
    review.issues.forEach(i => {
      console.log(`   - ${i.description}`);
    });
  }
});
```

### Step 3: Interactive Review Session
```typescript
import { segmentReviewer } from './services/segmentReviewCLI';

const reviews = segmentReviewer.startReviewSession();
// Output shows each segment with field-level details
```

### Step 4: Generate Summary Report
```typescript
const report = segmentReviewer.generateFinalReport(reviews);

console.log(`\n=== FINAL REPORT ===`);
console.log(`Overall Status: ${report.overallStatus}`);
console.log(`Compliant: ${report.completeSegments}/${report.totalSegments}`);
console.log(`Critical Issues: ${report.criticalIssues}`);

console.log(`\nRecommendations:`);
report.recommendations.forEach(r => console.log(`- ${r}`));
```

---

## Critical Segments Requiring Review

### Priority 1: Primary Outcome
**Segment K: Wyniki Neurologiczne**
- Contains `any_stroke_30d` (primary outcome)
- 30 fields, many linked to risk prediction
- Status check required before data analysis

### Priority 2: Anatomical Risk
**Segment D: Wskazanie i Patologia Aorty**
- 33 fields defining aortic anatomy
- High correlation with stroke risk
- Links to predictor analysis

### Priority 3: Procedural Data
**Segments G, G2, H, I, J**
- Device configuration and intraoperative monitoring
- Links to technical and safety outcomes
- Critical for stratification analysis

### Priority 4: Safety Outcomes
**Segment L: Inne Powikłania**
- Complication rates and safety composite
- 23 fields documenting adverse events
- Essential for safety profile

---

## Troubleshooting

### Issue: Field has data but "broken_link"
**Cause**: Field exists in records but not in FIELD_STATISTIC_MAP
**Solution**: Add field to map in `dataStatisticsDebugger.ts`
```typescript
const FIELD_STATISTIC_MAP: FieldStatisticMap = {
  your_new_field: {
    usedInStatistics: ['your_analysis'],
    criticalFor: ['outcome_analysis']
  }
};
```

### Issue: "invalid_value" for radio/select fields
**Cause**: Data contains value not in defined options
**Solution**: Update field options in constants.ts or normalize data
```typescript
// Before analysis, map old values to new ones
const normalizeValue = (fieldId: string, value: string) => {
  const migrations: { [key: string]: { [key: string]: string } } = {
    'some_field': { 'old_value': 'new_value' }
  };
  return migrations[fieldId]?.[value] || value;
};
```

### Issue: Missing required field in many records
**Cause**: Field not consistently collected
**Solution**: Review collection protocol or make field optional
```typescript
// In constants.ts
{ id: 'field_id', label: '...', type: 'radio', required: false }
```

---

## Integration with Analysis

Once segments are verified:

1. **Statistics Engine** uses field mappings to aggregate data
2. **Form Validator** checks incoming data against protocol
3. **Analysis Dashboard** displays statistics linked to segments
4. **Export Service** validates completeness before reporting

```typescript
// Example: Using debugger output in statistics
const report = debugger.generateDebugReport(records);
const validRecords = records.filter(r => 
  !report.dataQualityIssues.some(i => i.recordId === r.id && i.severity === 'critical')
);

// Proceed with analysis on valid records
const stats = statisticsEngine.analyzeRecords(validRecords);
```

---

## Next Steps

1. **Run the debugger** on current data to identify broken links
2. **Review priority segments** (K, D, G, L) using segment review tool
3. **Fix mapping issues** in dataStatisticsDebugger.ts
4. **Update protocol fields** in constants.ts as needed
5. **Re-run debugger** to verify all links are valid
6. **Deploy updates** to statistics engine and validators

