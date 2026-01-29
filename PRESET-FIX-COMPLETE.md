# Preset Save/Load Fix - Complete Report

## Issue
Presets were not capturing and restoring Base URL, Issue Type, and Project ID correctly:
- **ServiceNow:** Base URL and Issue Type were only saved if "lock" checkboxes were checked
- **Jira:** Base URL, Issue Type, and Project ID were only saved if "lock" checkboxes were checked
- When loading presets, these critical fields were not being populated

## Root Cause
The `saveCurrentAsPreset()` function at line 3592 had logic that only saved `baseUrl` and `issueType` when the lock checkboxes were checked:

```javascript
// OLD BUGGY CODE:
if (lockBaseUrl && baseUrl) preset.baseUrl = baseUrl;
if (lockIssueType && issueType) preset.issueType = issueType;
// Missing: projectId was never saved at all
```

This meant:
1. If users didn't check "lock" boxes, their Base URL and Issue Type weren't saved
2. Project ID was never saved for Jira presets
3. When loading presets, these fields stayed empty

## Solution

### 1. Save Function - Always Save Base URL, Issue Type, and Project ID

**File:** `link-generator.html`  
**Lines:** 3608-3623

```javascript
// NEW CODE:
// Always save baseUrl and issueType (not just when locked)
if (baseUrl) preset.baseUrl = baseUrl;
if (issueType) preset.issueType = issueType;

// For Jira, also save projectId
if (currentAppType === 'jira') {
  const projectId = document.getElementById('projectId').value.trim();
  if (projectId) preset.projectId = projectId;
}

// Store lock states
preset.lockBaseUrl = lockBaseUrl;
preset.lockIssueType = lockIssueType;
```

**Changes:**
- ✅ Removed `lockBaseUrl &&` condition - now saves baseUrl whenever present
- ✅ Removed `lockIssueType &&` condition - now saves issueType whenever present
- ✅ Added logic to save `projectId` for Jira presets
- ✅ Still stores lock states for future use

---

### 2. Load Function - Restore All Fields

**File:** `link-generator.html`  
**Lines:** 3651-3678

```javascript
function loadPresetFromDropdown() {
  // ... existing code ...
  
  // Populate form
  document.getElementById('baseUrl').value = formData.baseUrl;
  document.getElementById('issueType').value = formData.issueType;
  
  // For Jira, also restore projectId
  if (currentAppType === 'jira' && formData.projectId) {
    document.getElementById('projectId').value = formData.projectId;
  }
  
  // ... rest of function ...
}
```

**Changes:**
- ✅ Added logic to restore `projectId` for Jira presets
- ✅ Uses `currentAppType` check to only restore projectId for Jira

---

### 3. Apply Function - Include Project ID in Return

**File:** `link-generator.html`  
**Lines:** 3679-3690

```javascript
function applyPresetToForm(presetId) {
  const presets = loadConfigurationPresets();
  const preset = presets.find(p => p.id === presetId);
  if (!preset) throw new Error('Preset not found');
  return {
    baseUrl: preset.baseUrl || '',
    issueType: preset.issueType || preset.tableName || '',
    projectId: preset.projectId || '',  // NEW: Include projectId
    fields: preset.fields || []
  };
}
```

**Changes:**
- ✅ Added `projectId` to the returned object
- ✅ Defaults to empty string if not present

---

### 4. Edit Function - Restore Project ID

**File:** `link-generator.html`  
**Lines:** 3706-3735

```javascript
function editConfigurationPreset(presetId) {
  // ... existing code ...
  
  // Load the preset into the form
  document.getElementById('baseUrl').value = preset.baseUrl || '';
  document.getElementById('issueType').value = preset.issueType || preset.tableName || '';
  
  // For Jira, also restore projectId
  if (currentAppType === 'jira' && preset.projectId) {
    document.getElementById('projectId').value = preset.projectId;
  }
  
  // ... rest of function ...
}
```

**Changes:**
- ✅ Added logic to restore `projectId` when editing Jira presets

---

## What Gets Saved Now

### ServiceNow Presets
```json
{
  "id": "preset-id",
  "name": "My SNOW Preset",
  "baseUrl": "https://dev12345.service-now.com",
  "issueType": "change_request",
  "fields": [ /* field definitions */ ],
  "lockBaseUrl": true,
  "lockIssueType": false,
  "createdAt": 1738163700000
}
```

### Jira Presets
```json
{
  "id": "preset-id", 
  "name": "My Jira Preset",
  "baseUrl": "https://jira.company.com",
  "issueType": "10001",
  "projectId": "12345",
  "fields": [ /* field definitions */ ],
  "lockBaseUrl": true,
  "lockIssueType": false,
  "createdAt": 1738163700000
}
```

---

## Backward Compatibility

✅ **Existing presets continue to work:**
- Presets without `baseUrl`/`issueType`/`projectId` will work (fields default to empty string)
- Presets with old lock-based saves will work (those fields are still there)
- No data migration needed

✅ **New presets get all fields:**
- All presets saved going forward will include Base URL, Issue Type
- Jira presets will also include Project ID
- Users get consistent preset behavior

---

## User Impact

### Before Fix ❌
1. User creates preset without checking "lock" boxes
2. Base URL and Issue Type not saved
3. User loads preset later - fields are empty
4. User has to manually re-enter Base URL and Issue Type
5. For Jira, Project ID was NEVER saved (even with lock checked)

### After Fix ✅
1. User creates preset (lock boxes optional)
2. Base URL, Issue Type, and Project ID (Jira only) are ALWAYS saved
3. User loads preset later - all fields populated correctly
4. User can immediately generate links without re-entering configuration

---

## Testing

### Manual Test Steps

**ServiceNow:**
1. Switch to ServiceNow platform
2. Set Base URL: `https://dev12345.service-now.com`
3. Set Issue Type: `change_request`
4. Add some fields
5. Save as preset (don't check lock boxes)
6. Clear the form
7. Load the preset
8. ✅ Verify: Base URL and Issue Type are populated

**Jira:**
1. Switch to Jira platform
2. Set Base URL: `https://jira.company.com`
3. Set Project ID: `12345`
4. Set Issue Type: `10001`
5. Add some fields
6. Save as preset (don't check lock boxes)
7. Clear the form
8. Load the preset
9. ✅ Verify: Base URL, Project ID, and Issue Type are populated

---

## Files Modified

- **link-generator.html**
  - Lines 3608-3623: Save function - always save baseUrl, issueType, projectId (Jira)
  - Lines 3667-3669: Load function - restore projectId for Jira
  - Lines 3686: Apply function - include projectId in return object
  - Lines 3718-3720: Edit function - restore projectId for Jira

---

## Summary

✅ **Fixed:** Presets now always save Base URL and Issue Type (not just when locked)  
✅ **Fixed:** Jira presets now save and restore Project ID  
✅ **Fixed:** All preset load/edit operations restore all fields correctly  
✅ **Backward Compatible:** Existing presets continue to work  
✅ **Validated:** All code changes confirmed with automated checks

**Date Completed:** 2026-01-29  
**Lines Changed:** ~30 lines across 4 functions  
**Files Changed:** 1 (`link-generator.html`)
