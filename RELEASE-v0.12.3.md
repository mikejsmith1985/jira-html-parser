# Release v0.12.3 - ServiceNow Feature Parity

**Release Date:** 2026-01-28  
**Focus:** ServiceNow improvements and cross-app field isolation

## Issues Fixed

### Issue #15: ServiceNow Field Extractor & App Type Isolation

## Changes

### 1. ✅ **Cross-App Field Isolation in Optimizer** (CRITICAL FIX)
**Problem:** Field Optimizer was grouping fields by `id|baseUrlId` only, causing Jira and ServiceNow fields with the same ID (e.g., "description") to be treated as duplicates and potentially merged together.

**Fix:** Updated `analyzeFieldDuplicates()` to group by `id|baseUrlId|appType`, ensuring Jira and ServiceNow fields are kept completely separate.

**Impact:**
- ✅ "Description" field in Jira and "Description" field in ServiceNow are now treated as separate entities
- ✅ Field Optimizer recommendations respect app type boundaries
- ✅ No risk of accidentally merging cross-app fields

**Files Changed:**
- `link-generator.html` line 1562: Updated grouping key to include appType
- `link-generator.html` line 1574: Updated key parsing to extract appType

### 2. ✅ **Field Reset on App Type Switch**
**Problem:** When switching from Jira to ServiceNow (or vice versa), field dropdowns were keeping selected fields from the previous app type visible due to the fallback logic `|| def.id === currentValue`.

**Fix:** Updated `updateAllFieldSelects()` to:
1. Check if currently selected value is still valid for new filters (including appType)
2. Only restore selection if it passes ALL filters (baseUrl, issueType, AND appType)
3. Clear selection if it doesn't match the new app type

**Impact:**
- ✅ Switching from Jira to ServiceNow clears Jira field selections
- ✅ Only relevant fields for current app type are shown
- ✅ No more "ghost" fields from the wrong app type

**Files Changed:**
- `link-generator.html` lines 1106-1169: Complete rewrite of `updateAllFieldSelects()` with validation logic

### 3. ✅ **ServiceNow Field Extractor Label Detection**
**Problem:** ServiceNow bookmarklet was finding 0 fields because it wasn't detecting labels correctly. ServiceNow uses `aria-labelledby` attribute to reference label elements, not traditional `<label for="">` HTML.

**Example ServiceNow Field:**
```html
<select 
  id="change_request.risk" 
  name="change_request.risk"
  aria-labelledby="label.change_request.risk">
  ...
</select>
```

**Fix:** Updated ServiceNow bookmarklet to:
1. **First check `aria-labelledby` attribute** (ServiceNow pattern)
2. Resolve the label element by ID and extract its text
3. Fallback to standard label methods if aria-labelledby not present
4. Updated BOTH passes: required field detection AND field extraction

**Impact:**
- ✅ ServiceNow bookmarklet should now detect fields correctly
- ✅ Maintains backward compatibility with standard HTML labels
- ✅ Works with ServiceNow's Angular-based forms

**Files Changed:**
- `link-generator.html` lines 4905-4960: Updated ServiceNow bookmarklet first pass (required fields)
- `link-generator.html` lines 5035-5090: Updated ServiceNow bookmarklet second pass (field extraction)

## Testing

### Automated Tests
- ✅ **test-cross-app-isolation.spec.js**: Verifies Jira and ServiceNow "description" fields are kept separate
  - Creates 2 Jira description fields (different issue types)
  - Creates 2 ServiceNow description fields (different issue types)
  - Verifies optimizer creates 2 separate groups (1 Jira, 1 ServiceNow)
  - Each group has 2 instances within its app type
  - **Result:** PASSED ✅

### Manual Testing Required
- **ServiceNow Bookmarklet**: User needs to test on actual ServiceNow instance to verify field detection works
- **Field Reset**: User should verify that selecting a Jira base URL/issue type, then switching to ServiceNow, properly clears the field selections

## Technical Details

### ServiceNow Field ID Pattern
ServiceNow uses `table.field` format for field IDs:
- `change_request.risk`
- `change_request.category`
- `incident.short_description`

### ServiceNow Label Pattern
ServiceNow labels are referenced via `aria-labelledby`:
- Field: `id="change_request.risk"`
- Label: `id="label.change_request.risk"`
- Connection: `aria-labelledby="label.change_request.risk"`

### Storage Key Separation
Fields are stored in completely separate localStorage keys:
- Jira: `linkGenJiraFieldDefinitions`
- ServiceNow: `linkGenSnowFieldDefinitions`

This physical separation + logical appType filtering = bulletproof isolation.

## User Requirements Met

✅ **All features between Jira and ServiceNow should be 1:1**
- Field Optimizer works for both (with proper isolation)
- Multi-file import works for both (shares same code path)
- Field Manager works for both
- All recent bug fixes apply to both

✅ **No cross-app field consolidation**
- Field Optimizer groups by `id|baseUrlId|appType`
- "Description" in Jira ≠ "Description" in ServiceNow
- User requirement: "should not combine those fields" - SATISFIED

✅ **ServiceNow field extractor fixed**
- Added `aria-labelledby` support
- Should now detect fields on ServiceNow forms
- Awaiting user testing on real ServiceNow instance

✅ **Fields reset when switching apps**
- Invalid selections are cleared
- Only relevant fields shown for current app type
- Clean UX when switching between Jira and ServiceNow modes

## Upgrade Instructions

1. Download link-generator.html from this release
2. Test the ServiceNow field extractor on a ServiceNow form
3. Report any issues with field detection
4. Verify that switching between Jira/ServiceNow modes clears field selections appropriately

## Known Limitations

- ServiceNow bookmarklet fix is based on inspection of one ServiceNow form
- May need adjustments for different ServiceNow versions or customizations
- User testing required to confirm it works in production environment

## Next Steps

User will test ServiceNow field extractor and provide feedback. Additional adjustments may be needed based on real-world ServiceNow form structures.
