# Developer Quick Start Guide
## SAFE-ARCH Modular Architecture

This guide helps you use the new modular components in your code.

---

## 📦 Module Structure

```
safe/
├── types.ts                      ← Enhanced type definitions
├── schemas/safeArchSchema.ts    ← Protocol definitions
├── validators/fieldValidator.ts ← Validation logic
├── hooks/useFormManager.ts      ← Form state management
└── utils/
    ├── dataIntegrity.ts         ← Checksums, versioning
    └── errors.ts                ← Error handling
```

---

## 🔧 Common Tasks

### Task 1: Validate User Input
```typescript
import { FieldValidator } from './validators/fieldValidator';
import { FieldDefinition } from './types';

const field: FieldDefinition = {
  id: 'collector_initials',
  label: 'Inicjały',
  type: FieldType.TEXT,
  required: true,
  validation: {
    pattern: /^[A-Z]{2,4}$/
  }
};

// Validate single field
const errors = FieldValidator.validateField(field, userInput);
if (errors.length > 0) {
  console.error('Validation failed:', errors[0].message);
}

// Validate all fields at once
const result = FieldValidator.validateFields(allFields, formData);
if (!result.valid) {
  result.errors.forEach(err => console.log(err.message));
}
```

### Task 2: Create a Form with Validation
```typescript
import { useFormManager } from './hooks/useFormManager';
import { SECTION_ADMINISTRATIVE } from './schemas/safeArchSchema';

function AdminForm() {
  const {
    formData,
    validationErrors,
    updateField,
    validateAll,
    saveRecord
  } = useFormManager({
    fields: SECTION_ADMINISTRATIVE.fields,
    onSuccess: (record) => {
      console.log('Record saved:', record);
      // Send to server, etc.
    },
    onError: (error) => {
      console.error('Form error:', error.message);
    }
  });

  const handleSubmit = () => {
    const record = saveRecord();
    if (record) {
      // Record was successfully validated and created
    }
  };

  return (
    <form>
      {SECTION_ADMINISTRATIVE.fields.map(field => (
        <div key={field.id}>
          <input
            value={formData[field.id] || ''}
            onChange={(e) => updateField(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
          {validationErrors
            .filter(e => e.fieldId === field.id)
            .map(err => <p key={err.fieldId} className="text-red-500">{err.message}</p>)
          }
        </div>
      ))}
      <button onClick={handleSubmit} disabled={!validationErrors.length === 0}>
        Save
      </button>
    </form>
  );
}
```

### Task 3: Save Record with Data Integrity
```typescript
import { enhanceRecord, serializeRecord, deserializeRecord } from './utils/dataIntegrity';
import { CollectionRecord } from './types';

// Creating and saving a record
const record: CollectionRecord = {
  id: crypto.randomUUID(),
  timestamp: new Date().toISOString(),
  data: formData,
  version: '1.0.0'
};

// Add checksums and metadata
const enhanced = enhanceRecord(record);
console.log('Checksum:', enhanced.checksum);

// Safe serialization
const json = serializeRecord(enhanced);
localStorage.setItem(`record_${record.id}`, json);

// Loading and verifying
const loaded = deserializeRecord(json);
// Throws error if checksum fails
```

### Task 4: Handle Errors Safely
```typescript
import { createAppError, handleError, isSafeError, logError } from './utils/errors';

// Create structured errors
function saveData(data: unknown) {
  try {
    if (!data) {
      throw createAppError('VALIDATION_ERROR', 'Data is required', { received: data });
    }
    // ... save logic
  } catch (error) {
    const { message, code } = handleError(error);
    
    if (code === 'DATA_CORRUPTION') {
      // Handle corruption specially
      showAlert('Your data was corrupted. Please refresh the page.');
    } else {
      showAlert(message);
    }
  }
}
```

### Task 5: Add Custom Validation
```typescript
import { FieldDefinition, FieldType, ValidationRule } from './types';

// Custom validation for Age field
const ageField: FieldDefinition = {
  id: 'age',
  label: 'Age',
  type: FieldType.NUMBER,
  required: true,
  validation: {
    min: 18,
    max: 120,
    custom: (value) => {
      if (typeof value !== 'number') {
        return { valid: false, message: 'Age must be a number' };
      }
      if (value < 0) {
        return { valid: false, message: 'Age cannot be negative' };
      }
      return { valid: true };
    }
  }
};

// Validate it
const errors = FieldValidator.validateField(ageField, userAge);
```

### Task 6: Use Polish Validators
```typescript
import { FieldValidator } from './validators/fieldValidator';

// Validate PESEL number
const peselValid = FieldValidator.isValidPesel('12345678901');

// Validate Polish date format
const dateValid = FieldValidator.isValidPolishDate('01/01/2024');

// Add to custom validation
const peselField: FieldDefinition = {
  id: 'pesel',
  label: 'PESEL',
  type: FieldType.TEXT,
  validation: {
    custom: (value) => {
      if (!FieldValidator.isValidPesel(value)) {
        return { valid: false, message: 'Invalid PESEL number' };
      }
      return { valid: true };
    }
  }
};
```

### Task 7: Access Schema Information
```typescript
import {
  DATA_SCHEMA,
  SECTION_ADMINISTRATIVE,
  getSchemaSection,
  getFieldDefinition,
  validateSchemaStructure
} from './schemas/safeArchSchema';

// Get a specific field definition
const studyNumberField = getFieldDefinition('study_number');

// Get a section
const adminSection = getSchemaSection('sec_a_admin');

// Validate entire schema structure
const validation = validateSchemaStructure();
if (!validation.valid) {
  validation.errors.forEach(err => console.error(err));
}

// Iterate all fields
DATA_SCHEMA.forEach(section => {
  console.log(`Section: ${section.title}`);
  section.fields.forEach(field => {
    console.log(`  - ${field.label}`);
  });
});
```

---

## 📚 Type Definitions

### CollectionRecord
```typescript
interface CollectionRecord {
  id: string;                           // Unique identifier
  timestamp: string;                    // ISO date string
  data: Record<string, any>;            // Field values
  version: string;                      // Schema version (e.g., "1.0.0")
  checksum?: string;                    // Data integrity checksum
  validationStatus?: 'valid' | 'warnings' | 'errors';
  validationErrors?: Record<string, string>;
}
```

### FieldDefinition
```typescript
interface FieldDefinition {
  id: string;                           // Unique field ID
  label: string;                        // Display label
  type: FieldType;                      // Field type
  options?: FieldOption[];              // For SELECT/RADIO
  required?: boolean;                   // Is required
  placeholder?: string;                 // Input placeholder
  unit?: string;                        // Unit (e.g., "cm", "kg")
  className?: string;                   // CSS classes
  validation?: ValidationRule;          // Validation rules
}
```

### ValidationMessage
```typescript
interface ValidationMessage {
  fieldId: string;                      // Which field failed
  message: string;                      // Error message
  severity: 'error' | 'warning' | 'info';
}
```

### AppError
```typescript
interface AppError extends Error {
  code: string;                         // Error code
  timestamp: Date;                      // When it occurred
  context?: Record<string, any>;        // Additional context
}
```

---

## 🎯 Best Practices

### 1. Always Use Validation
```typescript
// ✅ Good
const result = FieldValidator.validateFields(fields, data);
if (!result.valid) {
  // Handle errors
}

// ❌ Bad - skipping validation
const record = { id: uuid(), data: formData };
```

### 2. Handle Errors Explicitly
```typescript
// ✅ Good
try {
  saveRecord();
} catch (error) {
  const { message, code } = handleError(error);
  showUserNotification(message);
}

// ❌ Bad - silent failure
try {
  saveRecord();
} catch (error) {
  // Ignored!
}
```

### 3. Use Type-Safe Data
```typescript
// ✅ Good
interface UserRecord extends CollectionRecord {
  version: '1.0.0';
}

// ❌ Bad - loses type information
const record: any = createRecord();
```

### 4. Verify Data Integrity
```typescript
// ✅ Good
const record = enhanceRecord(userData);
const verification = isRecordValid(record);
if (!verification.valid) {
  showError(verification.reason);
}

// ❌ Bad - no integrity check
const record = { ...userData };
```

---

## 🐛 Troubleshooting

### Validation Errors
**Problem:** "Validation error for Numer badania: format is invalid"

**Solution:** Check the pattern in the field definition:
```typescript
// Pattern expects: 5-20 alphanumeric or hyphens
// Valid: "SAFE-ARCH-00001"
// Invalid: "safe-arch" (too short, lowercase)
```

### Checksum Verification Failed
**Problem:** "Checksum verification failed - data may be corrupted"

**Solution:** 
- Data was modified after being saved
- Use `serializeRecord()` to ensure proper formatting
- Don't manually edit record JSON

### Form Not Validating
**Problem:** Form doesn't show validation errors

**Solution:**
```typescript
// Make sure to call validateAll or validateField
const saveRecord = useFormManager(...);
const isValid = saveRecord.validateAll();

// Check if hook is properly initialized with fields
const { validationErrors } = useFormManager({
  fields: SECTION_ADMINISTRATIVE.fields  // ← must provide fields
});
```

---

## 📖 Related Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Full architecture documentation
- [types.ts](types.ts) - Type definitions
- [validators/fieldValidator.ts](validators/fieldValidator.ts) - Validation API
- [hooks/useFormManager.ts](hooks/useFormManager.ts) - Form hook API
- [utils/dataIntegrity.ts](utils/dataIntegrity.ts) - Data integrity API
- [utils/errors.ts](utils/errors.ts) - Error handling API

---

## 💡 Tips

- **Import only what you need** to keep bundle size small
- **Use hooks in React components** for state management
- **Validate early** in the form, not just at submit
- **Log errors** for debugging production issues
- **Test validation rules** before deploying to production
- **Version your schemas** for backward compatibility

---

**Last Updated:** January 2, 2026  
**Status:** ✅ Production Ready
