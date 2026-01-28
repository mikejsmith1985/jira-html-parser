# Field Optimizer Enhancement - Issue #14 Fix

## Problem
The field optimizer was not detecting duplicate fields when they were stored separately for each issue type. For example, if "summary" was imported for Task, Story, and Defect as three separate field definitions, the optimizer would not recognize them as duplicates that could be merged.

## Root Cause
The original logic at line 1572 only considered fields as duplicates if they had `issueTypes.size >= 2`, which required the SAME field object to already have multiple issue type IDs. However, when fields are imported via the bookmarklet, each field is stored with a single `issueTypeId`, creating separate instances that were not being detected.

## Solution
Enhanced the field optimizer with the following changes:

### 1. **Updated Duplicate Detection Logic**
- Changed grouping to use `fieldId|baseUrlId` as the key to properly identify duplicates
- Now detects when the same field ID appears multiple times with different issue type IDs
- Supports both:
  - Fields stored separately (one per issue type)
  - Fields already merged (array of issue type IDs)

### 2. **Added Multi-Issue-Type Support**
- Field definitions now support `issueTypeId` as:
  - `undefined` (global - all issue types)
  - Single string (one issue type)
  - Array of strings (multiple specific issue types)

### 3. **Two Merge Options**
The field optimizer now offers two ways to merge duplicates:

#### **Merge Button** (Multi-Issue-Type)
- Combines duplicate fields into ONE field with an array of issue type IDs
- Best for fields that appear in SOME issue types
- Example: A field in Task and Story (but not Defect) becomes:
  ```json
  {
    "id": "customfield_12345",
    "label": "Special Field",
    "issueTypeId": ["10000", "10202"]
  }
  ```

#### **Global Button** (All Issue Types)
- Converts field to global (no issue type restriction)
- Best for fields that appear in ALL issue types (like summary, description)
- Automatically recommended when field appears in all known issue types
- Example:
  ```json
  {
    "id": "summary",
    "label": "Summary",
    // No issueTypeId property = global
  }
  ```

### 4. **Updated Field Filtering**
- Enhanced `addField()` function to properly filter fields with array issue type IDs
- Fields now appear in dropdowns if:
  - They have no issue type ID (global), OR
  - Their single issue type ID matches current issue type, OR
  - Their array of issue type IDs contains current issue type

### 5. **Enhanced Field Display**
- Field manager now shows:
  - `🌐 GLOBAL` badge for global fields (no issue type restriction)
  - `📋 N Types` badge for fields with multiple issue types (hover to see all)
  - Individual issue type badge for single-issue-type fields

### 6. **Improved Recommendations**
- `⭐ SUGGEST GLOBAL` badge appears when:
  - Field appears in all known issue types, OR
  - Field appears in 4+ issue types
- Fields with 2+ issue types are automatically recommended for merging

## UI Changes

### Field Optimizer Modal
**Before:**
- Single "Make Global" button per group
- "Merge Selected" did global merge only

**After:**
- **Merge** button (purple) - creates multi-issue-type field
- **Global** button (blue/gold) - creates global field
- **⭐ SUGGEST GLOBAL** badge for appropriate fields
- Bulk actions:
  - "Merge Selected" (purple) - multi-issue-type merge
  - "⭐ Global Selected" (gold) - global merge
  - "Undo Last" - restore previous state

### Field Manager
- Shows issue type scope for each field clearly
- Multi-type fields display count with tooltip

## Testing
Created comprehensive test suite in `test-field-optimizer-issue14-fix.html`:
1. **Test 1:** Detects duplicates across issue types
2. **Test 2:** Merges to multi-issue-type format
3. **Test 3:** Merges to global format  
4. **Test 4:** Field filtering works with arrays

## Backward Compatibility
✅ Fully backward compatible:
- Existing single `issueTypeId` fields continue to work
- Existing global fields (no `issueTypeId`) continue to work
- New array format is additive, not breaking

## Files Modified
- `link-generator.html` - All changes in one file

## Key Functions Updated
1. `analyzeFieldDuplicates()` - Enhanced duplicate detection
2. `mergeToMultiType()` - NEW: Multi-issue-type merge
3. `mergeToGlobal()` - Existing: Global merge (unchanged logic)
4. `mergeSelectedToMultiType()` - NEW: Bulk multi-type merge
5. `mergeSelectedToGlobal()` - Existing: Bulk global merge
6. `addField()` - Enhanced filtering for arrays
7. `refreshFieldsList()` - Enhanced display for arrays

## Expected Behavior for Issue #14 Config

Given the exported config with fields like:
- `summary` in Task (10000)
- `summary` in Story (10202)
- `summary` in Defect (18501)

The optimizer will now:
1. ✅ Detect these as duplicates (3 instances)
2. ✅ Show "⭐ SUGGEST GLOBAL" (appears in all types)
3. ✅ Offer two merge options:
   - **Merge**: Creates `{id: "summary", issueTypeId: ["10000", "10202", "18501"]}`
   - **Global**: Creates `{id: "summary"}` (no issueTypeId)
4. ✅ Reduce field count from 3 to 1

## Version
- Feature version: v0.11.7 (pending)
- Addresses: GitHub Issue #14
