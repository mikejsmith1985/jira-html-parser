# Required Fields Detection - Root Cause Analysis

## Problem Identified

The extracted JSON shows fields are NOT being marked as required, even though the validation fields exist.

### Example from extracted-fields-jira-2026-01-26.json:

```json
{
  "id": "summary",
  "label": "Summary Required",
  "required": false  // ← WRONG! Should be true
},
{
  "id": "reporter-field",
  "label": "Reporter Required",  
  "required": false
},
{
  "id": "reporter",
  "label": "reporter",
  "required": false  // ← WRONG! Should be true
}
```

## Root Cause

**Current logic looks for field IDs ending in "Required":**
- Looking for: `summaryRequired`, `reporterRequired`  
- But Jira uses: `summary` with label "Summary Required", `reporter-field` with label "Reporter Required"

**The detection logic is checking the WRONG thing!**
- ❌ Checking field ID for suffix: `if (fieldId.match(/(Required|_required)$/i))`
- ✅ Should check LABEL for "Required" keyword

## Solution

Update first pass to:
1. Collect ALL field labels first
2. Find fields where **label** contains "Required" or "Mandatory"
3. Extract base field name from the validation field ID:
   - `reporter-field` (label: "Reporter Required") → mark `reporter` as required
   - `summaryRequired` → mark `summary` as required
4. Skip validation fields during extraction
5. Mark actual fields as required based on the collected set

## Pattern Recognition

### Pattern 1: `-field` suffix (Your Jira)
- Validation field: `reporter-field` with label "Reporter Required"
- Actual field: `reporter` with label "reporter"  
- Logic: If ID ends with `-field` AND label has "Required" → base field = ID minus `-field`

### Pattern 2: `Required` suffix (Other Jiras)
- Validation field: `reporterRequired` with label "Reporter Required"
- Actual field: `reporter` with label "Reporter"
- Logic: If ID ends with `Required` → base field = ID minus `Required`

## Implementation Plan

```javascript
// First pass: Identify required fields by checking LABELS
fields.forEach(field => {
  const fieldId = field.id || field.name;
  const label = getLabel(field); // Extract label
  
  // Check if label indicates this is a validation/required field
  if (label.match(/Required|Mandatory/i)) {
    // Extract base field name
    if (fieldId.endsWith('-field')) {
      const baseFieldId = fieldId.replace(/-field$/, '');
      requiredFieldIds.add(baseFieldId);
    } else if (fieldId.match(/Required$/i)) {
      const baseFieldId = fieldId.replace(/Required$/i, '');
      requiredFieldIds.add(baseFieldId);
    }
  }
});

// Second pass: Skip validation fields, mark actual fields as required
fields.forEach(field => {
  const fieldId = field.id || field.name;
  const label = getLabel(field);
  
  // Skip validation fields
  if (fieldId.endsWith('-field') && label.match(/Required/i)) return;
  if (fieldId.match(/Required$/i)) return;
  
  // Check if this field is required
  const isRequired = requiredFieldIds.has(fieldId);
  
  // Extract field with required flag
  extracted.push({
    id: fieldId,
    label: label,
    required: isRequired  // ✓ Now correctly set!
  });
});
```

## Testing

After fix, extracting from your Jira should produce:
```json
{
  "id": "summary",
  "label": "Summary Required",
  "required": true  // ✓ CORRECT!
},
{
  "id": "reporter",
  "label": "reporter",
  "required": true  // ✓ CORRECT!
}
```

And `reporter-field` should NOT be in the extracted fields at all (filtered out).

## Next Steps

1. Update both Jira and ServiceNow Field Extractor bookmarklets
2. Add console logging to show what's detected
3. Test extraction on your Jira form
4. Verify console shows: `[Jira] Required via -field: reporter-field -> reporter`
5. Verify extracted JSON has `required: true` on correct fields
6. Re-import and test auto-population

