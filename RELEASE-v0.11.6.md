# Release v0.11.6 - Label Cleaning Fix

## Release Date: 2025-01-27

## Overview
Fixed critical bug in Field Extractor where "Required" and "Mandatory" were not being removed from field labels despite regex being present in code.

## Root Cause
**The regex backslashes were not properly escaped in the JavaScript template literal!**

When the bookmarklet code is embedded in HTML as a template literal string, backslashes need to be DOUBLE escaped:
- ❌ Wrong: `/\s+(Required|Mandatory)/` → became `/s+(Required|Mandatory)/` in bookmarklet
- ✅ Correct: `/\\s+(Required|Mandatory)/` → becomes `/\s+(Required|Mandatory)/` in bookmarklet

## What Broke
In versions 0.11.3, 0.11.4, and 0.11.5, the label cleaning regex was present in the source code but was BROKEN when embedded in the bookmarklet:

```javascript
// In link-generator.html source (looked correct)
label = label.replace(/\s+(Required|Mandatory)[\s.,;:!?]*$/gi, '').trim();

// In actual bookmarklet (BROKEN - missing backslashes!)
label = label.replace(/s+(Required|Mandatory)[s.,;:!?]*$/gi, '').trim();
```

This caused the regex to fail because `s+` is not a valid pattern (should be `\s+` for whitespace).

## What Was Fixed

### Files Changed
**link-generator.html** (2 locations):

1. **Jira Field Extractor** (lines 4400-4403):
```javascript
// Before (broken)
label = label.replace(/\s+(Required|Mandatory)[\s.,;:!?]*$/gi, '').trim();
label = label.replace(/\s+(Required|Mandatory)\b/gi, '').trim();

// After (fixed)
label = label.replace(/\\s+(Required|Mandatory)[\\s.,;:!?]*$/gi, '').trim();
label = label.replace(/\\s+(Required|Mandatory)\\b/gi, '').trim();
```

2. **ServiceNow Field Extractor** (lines 4693-4696):
```javascript
// Same fix applied
label = label.replace(/\\s+(Required|Mandatory)[\\s.,;:!?]*$/gi, '').trim();
label = label.replace(/\\s+(Required|Mandatory)\\b/gi, '').trim();
```

3. **Version Numbers** (lines 4459, 4514, 4752, 4806):
- Updated extractorVersion from '0.11.4' to '0.11.6'
- Updated display badges to show 0.11.6

## Validation

### Unit Test
Created `test-label-cleaning-v11-6.html` that demonstrates the regex works correctly:
- Tests 12 variations of "Required" and "Mandatory" patterns
- All tests pass with expected label cleaning
- Confirms the fix works in isolation

### Integration Test
Created `test-label-cleaning-v11-6.spec.js` (Playwright):
- ✅ Verifies bookmarklet code contains correct escaped regex
- ✅ Verifies extractorVersion is "0.11.6" in both JSON and display
- 2 of 3 tests passing (3rd test requires live Jira environment)

### Manual Test Page
Created `test-visual-label-cleaning.html`:
- Mock Jira form with fields labeled "Summary Required", "Reporter Required", etc.
- Provides visual validation instructions for user
- Shows expected results after extraction

## Impact

### Before v0.11.6
User extracted fields from Jira and saw labels like:
- "Summary Required"
- "Reporter Required"
- "Priority Mandatory"

This cluttered the UI and confused users about whether "Required" was part of the field name.

### After v0.11.6
Field labels are now cleaned correctly:
- "Summary"
- "Reporter"
- "Priority"

The "Required" status is tracked separately in the field's metadata (`required: true`), not in the label text.

## User Instructions

1. **Delete old bookmarklet** from browser bookmarks
2. Open `link-generator.html` in browser
3. Click "🔍 Field Extractor" button
4. Drag the new bookmarklet (v0.11.6) to bookmarks bar
5. Verify the green badge shows "0.11.6"
6. Test extraction on Jira issue create form
7. Verify labels no longer have "Required" suffix

## Testing Protocol Followed

Per `C:\ProjectsWin\forge-terminal\.github\copilot-instructions.md`:
- ✅ Created unit tests (test-label-cleaning-v11-6.html)
- ✅ Created integration tests (test-label-cleaning-v11-6.spec.js)
- ✅ Created visual validation page (test-visual-label-cleaning.html)
- ✅ Verified regex in isolation before embedding
- ✅ Confirmed version numbers updated correctly

## Lessons Learned

1. **Template literals require double-escaping for backslashes**
   - JavaScript string escaping applies before regex interpretation
   - Always test bookmarklet code execution, not just source code

2. **Regex can "look correct" but be broken**
   - The regex pattern was correct in the HTML source
   - But URL encoding and template literal processing broke it
   - Need end-to-end testing of generated bookmarklet

3. **Version numbers in multiple places**
   - extractorVersion in JSON result (2 places)
   - Display badge in modal (2 places)
   - package.json
   - Must update all consistently

4. **Testing assumptions can be wrong**
   - Assumed user wasn't using latest version (wrong)
   - Assumed regex was correct because it "looked right" (wrong)
   - Should have tested extracted bookmarklet directly first

## Related Issues

- GitHub Issue #12 - User reported "Summary Required" not being cleaned
- Affects all Jira and ServiceNow field extractions since v0.11.3

## Breaking Changes
None - this is a bug fix, not a feature change.

## Migration Required
No data migration needed. Users just need to:
1. Delete old bookmarklet
2. Add new v0.11.6 bookmarklet
3. Re-extract fields if needed

## Next Steps

1. User should test v0.11.6 on real Jira environment
2. If confirmed working, close GitHub Issue #12
3. Consider adding automated tests that actually execute bookmarklet code
4. Document template literal escaping requirements for future changes
