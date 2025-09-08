# Import Result Field Mapping Documentation

## Overview

Each import workflow returns results in slightly different formats. The standardized formatter (`resultFormatter.ts`) maps these diverse formats into a consistent `StandardImportResult` structure.

## Workflow Return Structures

### 1. **Codici IVA** (`importCodiceIvaWorkflow.ts`)

**Return Format:**
```typescript
{
  success: boolean,
  message: string,
  stats: {
    totalRecords: number,
    successfulRecords: number,  // ← Maps to createdRecords
    errorRecords: number
  },
  errors: Array<{row, error, data}>
}
```

**Formatter Mapping:**
- `totalRecords` → `stats.totalRecords`
- `successfulRecords` → `stats.createdRecords` 
- `0` → `stats.updatedRecords` (not distinguished)
- `errorRecords` → `stats.errorRecords`

---

### 2. **Causali Contabili** (`importCausaliContabiliWorkflow.ts`)

**Return Format:**
```typescript
{
  success: boolean,
  message: string,
  stats: {
    totalRecords: number,
    successfulRecords: number,  // ← Maps to createdRecords
    errorRecords: number
  },
  errors: Array<{row, error, data}>
}
```

**Formatter Mapping:**
- Same as Codici IVA pattern
- `successfulRecords` → `stats.createdRecords`

---

### 3. **Condizioni Pagamento** (`importCondizioniPagamentoWorkflow.ts`)

**Return Format:**
```typescript
{
  success: boolean,
  message: string,
  stats: {
    totalRecords: number,
    successfulRecords: number,  // ← Maps to createdRecords
    errorRecords: number
  },
  errors: Array<{row, error, data}>
}
```

**Formatter Mapping:**
- Same as Codici IVA pattern
- `successfulRecords` → `stats.createdRecords`

---

### 4. **Piano dei Conti** (`importPianoDeiContiWorkflow.ts`)

**Return Format:**
```typescript
{
  totalRecords: number,      // ← Direct fields (no nested stats)
  createdRecords: number,    // ← Already correct field name
  updatedRecords: number,    // ← Already correct field name
  successfulRecords: number,
  errorRecords: number
}
```

**Formatter Mapping:**
- `totalRecords` → `stats.totalRecords` (direct)
- `createdRecords` → `stats.createdRecords` (direct)
- `updatedRecords` → `stats.updatedRecords` (direct)
- `errorRecords` → `stats.errorRecords` (direct)

---

### 5. **Anagrafiche** (`importAnagraficheWorkflow.ts`)

**Return Format:**
```typescript
{
  success: boolean,
  message: string,
  stats: {
    totalRecords: number,
    successfulRecords: number,
    errorRecords: number,
    createdRecords: number,    // ← Has both successfulRecords AND createdRecords
    updatedRecords: number     // ← AND updatedRecords
  },
  anagraficheStats: {...},
  errors: Array<{row, error, data}>
}
```

**Formatter Mapping:**
- `stats.totalRecords` → `stats.totalRecords`
- `stats.createdRecords` → `stats.createdRecords` (use specific field)
- `stats.updatedRecords` → `stats.updatedRecords` (use specific field)
- `stats.errorRecords` → `stats.errorRecords`
- `anagraficheStats` → `reportDetails.transformation`

---

### 6. **Scritture Contabili** (`importScrittureContabiliWorkflow.ts`)

**Return Format:**
```typescript
{
  success: boolean,
  jobId: string,
  message: string,
  stats: {
    testateStaging: number,        // ← Complex multi-file stats
    righeContabiliStaging: number,
    righeIvaStaging: number,
    allocazioniStaging: number,
    erroriValidazione: number,
    // + performance metrics
  },
  report?: {...}
}
```

**Formatter Mapping:**
- Total records = `testateStaging + righeContabiliStaging + righeIvaStaging`
- Created records = `testateStaging` (primary indicator)
- Updated records = `0` (not applicable)
- Error records = `erroriValidazione`
- `jobId` → `metadata.jobId`
- `report` → `reportDetails`

---

## Field Mapping Summary

| Import Type | Total | Created | Updated | Errors |
|-------------|-------|---------|---------|---------|
| **Codici IVA** | `stats.totalRecords` | `stats.successfulRecords` | `0` | `stats.errorRecords` |
| **Causali** | `stats.totalRecords` | `stats.successfulRecords` | `0` | `stats.errorRecords` |
| **Condizioni Pag.** | `stats.totalRecords` | `stats.successfulRecords` | `0` | `stats.errorRecords` |
| **Piano Conti** | `totalRecords` | `createdRecords` | `updatedRecords` | `errorRecords` |
| **Anagrafiche** | `stats.totalRecords` | `stats.createdRecords` | `stats.updatedRecords` | `stats.errorRecords` |
| **Scritture** | `sum(staging)` | `testateStaging` | `0` | `erroriValidazione` |

## Common Issues Fixed

### 1. **Field Name Mismatches**
- **Problem**: Formatters looked for `createdCount` but workflows returned `successfulRecords`
- **Solution**: Updated formatters to use correct workflow field names

### 2. **Nested vs Direct Fields**
- **Problem**: Piano dei Conti returns fields directly, not in `stats` object
- **Solution**: Access fields directly without `stats.` prefix

### 3. **Multi-field Aggregation**
- **Problem**: Scritture Contabili has multiple staging counts
- **Solution**: Sum relevant fields for total count

### 4. **Missing Error Mapping**
- **Problem**: Error arrays not properly mapped to validation errors
- **Solution**: Extract row, message, and value from error objects

## Testing Verification

After implementing these fixes, verify with:

1. **Import each type** and check staging tables show correct counts
2. **Compare frontend stats** with staging table counts  
3. **Test error scenarios** to verify error mapping works
4. **Check metadata fields** (file size, processing time, etc.)

## Maintenance Notes

When adding new import types:

1. **Document the workflow return structure** first
2. **Create appropriate formatter function** based on structure pattern  
3. **Test with real data** to verify field mappings
4. **Update this documentation** with the new mapping pattern