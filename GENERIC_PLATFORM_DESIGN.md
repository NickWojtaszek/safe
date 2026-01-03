# Clinical Trial Data Platform - Generic Engine Design

## Overview
A reusable, AI-powered clinical trial data collection, analysis, and interpretation platform that allows users to define custom protocols, extract reference data from documents, and generate AI-driven clinical insights.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLINICAL TRIALS PLATFORM                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │   Protocol       │  │   Data           │  │   Analysis     │ │
│  │   Builder        │  │   Collection     │  │   Engine       │ │
│  │                  │  │                  │  │                │ │
│  │ - Document       │  │ - Dynamic Form   │  │ - Configurable │ │
│  │   Upload         │  │   Renderer       │  │   Statistics   │ │
│  │ - Field Config   │  │ - Validation     │  │ - AI Interpret │ │
│  │ - Analysis Setup │  │ - Data Storage   │  │ - Visualization│ │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬────────┘ │
│           │                     │                      │          │
│           └─────────────────────┴──────────────────────┘          │
│                              ↓                                    │
│                   ┌──────────────────────┐                        │
│                   │   Document/RAG       │                        │
│                   │   Extraction Layer   │                        │
│                   │                      │                        │
│                   │ - PDF Parsing        │                        │
│                   │ - Vector Embeddings  │                        │
│                   │ - Semantic Search    │                        │
│                   │ - Data Extraction    │                        │
│                   └──────────────────────┘                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
clinical-trials-platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── shared/
│   │   │   │   ├── DynamicFormRenderer.tsx      # Generic form builder
│   │   │   │   ├── DataViewer.tsx               # Table/chart display
│   │   │   │   └── Navigation.tsx
│   │   │   │
│   │   │   ├── protocol/
│   │   │   │   ├── ProtocolBuilder.tsx          # Create/edit protocol schema
│   │   │   │   ├── FieldEditor.tsx              # Add/configure fields
│   │   │   │   ├── SectionManager.tsx           # Organize sections
│   │   │   │   └── AnalysisConfig.tsx           # Configure analysis goals
│   │   │   │
│   │   │   ├── documents/
│   │   │   │   ├── DocumentUpload.tsx           # Upload PDFs/papers
│   │   │   │   ├── DocumentViewer.tsx           # View uploaded docs
│   │   │   │   ├── DataExtractor.tsx            # Query docs via AI
│   │   │   │   └── ExtractedDataReview.tsx      # Review/confirm extracted data
│   │   │   │
│   │   │   ├── collection/
│   │   │   │   ├── DataCollectionWizard.tsx     # Form filling (reuse from SAFE-ARCH)
│   │   │   │   ├── RecordValidator.tsx          # Real-time validation
│   │   │   │   └── DataImport.tsx               # Bulk import
│   │   │   │
│   │   │   ├── analysis/
│   │   │   │   ├── AnalysisDashboard.tsx        # Main analysis view
│   │   │   │   ├── StatisticsPanel.tsx          # Selectable analyses
│   │   │   │   ├── AIInsights.tsx               # AI-generated interpretation
│   │   │   │   ├── ComparisonCharts.tsx         # Subgroup analysis visuals
│   │   │   │   └── ReportGenerator.tsx          # PDF/export reports
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── ProtocolManagement.tsx       # List/manage protocols
│   │   │       ├── UserManagement.tsx           # Role-based access
│   │   │       └── AuditLogs.tsx
│   │   │
│   │   ├── contexts/
│   │   │   ├── ProtocolContext.tsx              # Active protocol state
│   │   │   ├── DataContext.tsx                  # Collected records
│   │   │   ├── AuthContext.tsx                  # User/role management
│   │   │   └── DocumentContext.tsx              # Uploaded docs + extraction state
│   │   │
│   │   ├── services/
│   │   │   ├── protocolService.ts               # CRUD operations on protocols
│   │   │   ├── dataService.ts                   # Data collection/storage
│   │   │   ├── analysisService.ts               # Statistical calculations
│   │   │   ├── aiService.ts                     # Claude API calls
│   │   │   ├── documentService.ts               # Document upload/retrieval
│   │   │   └── ragService.ts                    # Embedding + semantic search
│   │   │
│   │   ├── types/
│   │   │   ├── protocol.ts                      # Protocol schema definitions
│   │   │   ├── data.ts                          # Record/collection types
│   │   │   ├── analysis.ts                      # Analysis configuration types
│   │   │   └── document.ts                      # Document + extraction types
│   │   │
│   │   ├── App.tsx
│   │   └── index.tsx
│   │
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── protocols.ts                     # Protocol CRUD endpoints
│   │   │   ├── data.ts                          # Data submission/retrieval
│   │   │   ├── analysis.ts                      # Statistical endpoints
│   │   │   ├── documents.ts                     # Document management
│   │   │   ├── extraction.ts                    # RAG extraction endpoints
│   │   │   └── auth.ts                          # Authentication
│   │   │
│   │   ├── services/
│   │   │   ├── protocolService.ts               # Protocol DB operations
│   │   │   ├── dataService.ts                   # Data persistence
│   │   │   ├── statisticsEngine.ts              # Generic stats calculations
│   │   │   ├── aiService.ts                     # Claude integration
│   │   │   ├── documentService.ts               # PDF parsing, storage
│   │   │   ├── embeddingService.ts              # Vector embeddings
│   │   │   ├── ragService.ts                    # Semantic search, extraction
│   │   │   └── validationService.ts             # Field validation rules
│   │   │
│   │   ├── models/
│   │   │   ├── Protocol.ts                      # DB schema: protocol definitions
│   │   │   ├── Record.ts                        # DB schema: collected data
│   │   │   ├── Document.ts                      # DB schema: uploaded docs
│   │   │   ├── Embedding.ts                     # DB schema: doc embeddings
│   │   │   └── ExtractionResult.ts              # DB schema: extracted data
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── validation.ts                    # Protocol-specific validation
│   │   │
│   │   ├── utils/
│   │   │   └── prompts.ts                       # AI prompt templates
│   │   │
│   │   └── server.ts
│   │
│   ├── package.json
│   └── .env.example
│
├── db/
│   ├── schema/
│   │   ├── protocols.sql
│   │   ├── records.sql
│   │   ├── documents.sql
│   │   └── embeddings.sql
│   │
│   └── migrations/
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml                      # Services: app, DB, vector DB
│
└── README.md
```

---

## Core Data Models

### 1. Protocol Definition
```typescript
interface ProtocolDefinition {
  id: string;
  name: string;                    // "SAFE-ARCH v2", "CardioTrial 2025"
  description: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  
  // Schema configuration
  sections: ProtocolSection[];     // Groups of fields
  fields: FieldDefinition[];       // All field definitions
  validationRules: ValidationRule[];
  
  // Analysis configuration
  analysisTemplates: AnalysisTemplate[];
  
  // Document references
  referenceDocuments: DocumentReference[];
  
  // AI configuration
  aiConfig: {
    systemPrompt: string;          // Clinical context for AI
    benchmarks: Benchmark[];        // Comparison values (extracted from docs)
    outcomeVariables: string[];     // Which fields are outcomes
    contextVariables: string[];     // Which fields for context
  };
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'radio' | 'date' | 'checkbox';
  section: string;                 // Section ID
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: FieldOption[];
  };
  unit?: string;
  metadata: {
    source?: string;               // "extracted from protocol_v2.pdf"
    importanceLevel?: 'critical' | 'important' | 'optional';
  };
}

interface AnalysisTemplate {
  id: string;
  name: string;
  description: string;
  type: 'descriptive' | 'survival' | 'logistic' | 'comparison' | 'custom';
  
  configuration: {
    outcomeVariable: string;        // Field ID
    stratificationVariables?: string[];
    groupingVariables?: string[];
    comparisonBenchmark?: number;
  };
  
  prompt?: string;                  // Custom AI interpretation prompt
}

interface Benchmark {
  name: string;
  value: number | string;
  source: string;                   // "ESO Guidelines 2024"
  sourceDocument?: string;          // Document ID
  category: string;                 // "stroke_rate", "mortality", etc.
}
```

### 2. Collected Data Record
```typescript
interface CollectedRecord {
  id: string;
  protocolId: string;
  timestamp: Date;
  collectorId: string;
  data: Record<string, any>;        // Field ID → Value mapping
  
  // Validation
  validationStatus: 'valid' | 'warnings' | 'errors';
  validationMessages: ValidationMessage[];
  
  // Audit trail
  createdAt: Date;
  modifiedAt: Date;
  modifiedBy: string;
}
```

### 3. Document & Extraction
```typescript
interface UploadedDocument {
  id: string;
  protocolId: string;
  filename: string;
  fileType: 'pdf' | 'text' | 'url';
  category: 'protocol' | 'guideline' | 'reference' | 'other';
  
  // Processing
  status: 'uploaded' | 'processing' | 'indexed' | 'error';
  uploadedAt: Date;
  
  // Extraction metadata
  embeddingModel: string;
  chunkCount: number;
  tokens: number;
}

interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];             // Vector embedding
  metadata: {
    page?: number;
    section?: string;
  };
}

interface ExtractionResult {
  id: string;
  documentId: string;
  extractedAt: Date;
  
  // Extracted data
  extractions: {
    inclusionCriteria?: string[];
    exclusionCriteria?: string[];
    primaryOutcomes?: string[];
    secondaryOutcomes?: string[];
    benchmarks?: Benchmark[];
    dataPoints?: { label: string; value: any; source: string }[];
  };
  
  // Mapping to protocol fields
  fieldMappings?: {
    fieldId: string;
    extractedValue: any;
    confidence: number;
    sourceChunks: string[];
  }[];
  
  reviewed: boolean;
  reviewedBy?: string;
}
```

---

## Key Workflows

### Workflow 1: Create New Protocol

```
1. Admin uploads protocol PDF + guidelines PDFs
   ↓
2. System processes documents (parsing, chunking, embedding)
   ↓
3. Admin opens ProtocolBuilder UI
   ↓
4. "Extract from documents" button
   → System queries AI: "What are the inclusion criteria?"
   → RAG retrieves relevant sections
   → Claude extracts structured data
   → Presents to admin for review/confirmation
   ↓
5. Admin manually adds/refines fields
   (or auto-create from extracted data)
   ↓
6. Configure Analysis:
   "What's the primary outcome?" → "30-day mortality"
   "How to stratify?" → "By age group, anatomical features"
   "Benchmarks to compare against?" → Auto-populated from docs
   ↓
7. Save protocol → Ready for data collection
```

### Workflow 2: Collect & Analyze Data

```
1. Researcher opens data collection form (auto-rendered from schema)
   ↓
2. Fields validated in real-time based on protocol rules
   ↓
3. Submit record → Stored with protocol version reference
   ↓
4. In Analysis tab:
   - System auto-generates descriptive statistics
   - User selects analysis type:
     "Compare stroke rate in EPD vs No-EPD groups"
   - System auto-calculates + generates visualization
   ↓
5. AI Insights:
   "Stroke rate in this cohort: 8.2% (n=45/550) vs. ESO benchmark 7-13%
    → Within guideline range. [See reference: ESO Guidelines 2024 pdf]
    
    Risk factors identified:
    - No EPD use: 2.1x increased risk
    - Shaggy aorta: 3.2x increased risk
    
    Clinical significance: Outcomes comparable to published literature."
   ↓
6. Export report with all analyses, charts, AI interpretation + citations
```

### Workflow 3: Query Documents

```
User: "What are the contraindications in this protocol?"
   ↓
RAG Service:
   - Search embeddings for "contraindication"
   - Return top relevant chunks
   ↓
Claude:
   - Read chunks
   - Extract contraindications
   - Format as structured list
   ↓
UI Shows:
   - List of contraindications
   - "From: Protocol_v2.pdf, page 3"
   - Link to relevant doc section
```

---

## Technical Decisions

### Frontend (React/TypeScript)
- **Form Rendering**: Extend existing Wizard component to pull schema from state instead of hardcoded constants
- **Charts**: Keep plotly/lucide-react, add Recharts for comparison visualizations
- **State Management**: Context API (current) or upgrade to Redux for complex protocol state
- **UI Library**: Keep current Tailwind/shadcn patterns

### Backend (Node.js/Express)
- **Database**: PostgreSQL for structured data + Supabase for vector embeddings (pgvector extension)
- **Embeddings**: OpenAI embeddings API (or Hugging Face for self-hosted)
- **PDF Processing**: pdf-parse, pdfjs-dist
- **Vector Search**: Native pgvector queries
- **LLM**: Claude API (via @anthropic-ai/sdk, already integrated)
- **Async Jobs**: Bull/BullMQ for background document processing

### Deployment
- **Docker**: Multi-container setup (app, DB, services)
- **Scale**: Stateless app tier, managed database
- **Secrets**: Environment variables for API keys

---

## Key Differentiators vs REDCap/Qualtrics

| Feature | REDCap | Qualtrics | **This Platform** |
|---------|--------|-----------|------------------|
| Custom Data Collection | ✅ | ✅ | ✅ |
| Statistics Engine | ✅ | ✅ | ✅ |
| **AI Interpretation** | ❌ | ❌ | ✅ Configurable |
| **Document-Powered Config** | ❌ | ❌ | ✅ RAG-based |
| **Cited Insights** | ❌ | ❌ | ✅ With source tracking |
| **Protocol Auto-Creation** | ❌ | ❌ | ✅ From PDFs |

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-4)
- Refactor SAFE-ARCH into generic form renderer
- Build ProtocolBuilder UI (basic field + section management)
- Generic statistics engine (mean, median, percentages, stratification)
- Basic API endpoints for protocols + data

### Phase 2: AI & Analysis (Weeks 5-8)
- Configurable AI interpretation prompts
- Analysis template system (users select analysis type)
- Chart/visualization generation
- Report export

### Phase 3: Documents & RAG (Weeks 9-12)
- Document upload + PDF parsing
- Embedding generation + vector DB setup
- Semantic search + extraction prompts
- Field mapping UI for auto-population

### Phase 4: Polish & Deployment (Weeks 13-16)
- User management + multi-tenancy
- Audit logging
- Performance optimization
- Documentation + training materials

---

## Success Metrics

1. **Time to Deploy New Protocol**: <4 hours (vs. rebuild: 1-2 weeks)
2. **Field Creation**: Automated extraction from docs (currently manual)
3. **Analysis Turnaround**: Real-time (currently requires statistician)
4. **Reusability**: 90%+ code shared across protocols (currently 0%)

---

## Next Steps

1. **Validate with stakeholders**: Is document extraction valuable?
2. **Start Phase 1**: Refactor SAFE-ARCH into generic engine
3. **Create proof-of-concept**: Load SAFE-ARCH protocol into generic builder
4. **Design Phase 3 UX**: How should clinicians interact with document extraction?

