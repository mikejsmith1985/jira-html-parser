# Release v0.12.4 - Label Cleaning Regex Fix

**Release Date:** 2026-01-28  
**Focus:** Fix regex escaping bug in bookmarklet label cleaning

## Issue Fixed

User reported that ServiceNow (and Jira) field labels still had "Required" and "Mandatory" text appearing, despite the label cleaning code being present.

## Changes

### ✅ **Label Cleaning Regex Escaping Fix**

**Problem:** Both Jira and ServiceNow bookmarklets had incorrect regex escaping (`\\s` instead of `\s`), causing "Required" and "Mandatory" text to remain in field labels.

**Root Cause:** JavaScript string literals inside bookmarklet code need single backslash for regex patterns. Double backslashes (`\\s`) match a literal backslash character followed by 's', not the whitespace character class.

**Before (v0.12.3 and earlier):**
```javascript
label.replace(/\\s+(Required|Mandatory)[\\s.,;:!?]*$/gi, '')  // ❌ WRONG
label.replace(/\\s+(Required|Mandatory)\\b/gi, '')            // ❌ WRONG
```

**After (v0.12.4):**
```javascript
label.replace(/\s+(Required|Mandatory)[\s.,;:!?]*$/gi, '')    // ✅ CORRECT
label.replace(/\s+(Required|Mandatory)\b/gi, '')              // ✅ CORRECT
```

**Impact:**
- ✅ "Short Description Required" → "Short Description"
- ✅ "Risk Mandatory" → "Risk"
- ✅ "Summary Required." → "Summary"
- ✅ "Status Mandatory!" → "Status"
- ✅ Works consistently across both Jira and ServiceNow
- ✅ Maintains required field detection (cleaning happens AFTER detection)

**Files Changed:**
- `link-generator.html` line 4763: Jira bookmarklet label cleaning (first regex)
- `link-generator.html` line 4765: Jira bookmarklet label cleaning (second regex)
- `link-generator.html` line 5083: ServiceNow bookmarklet label cleaning (first regex)
- `link-generator.html` line 5085: ServiceNow bookmarklet label cleaning (second regex)

## Testing

Created `test-label-cleaning-regex-fix.js` to verify the fix:

```
✅ FIXED "Short Description Required" → "Short Description"
✅ FIXED "Risk Mandatory" → "Risk"
✅ FIXED "Summary Required." → "Summary"
✅ FIXED "Status Mandatory!" → "Status"
✅ FIXED "Priority  Required  " → "Priority"
```

All test cases pass correctly with the new regex patterns.

## Why This Was Missed

The label cleaning code was added in v0.11.6 but the regex escaping was incorrect from the start. This affected both Jira and ServiceNow bookmarklets equally. The issue only became apparent when testing with actual field extractions where labels had "Required" or "Mandatory" in them.

## Upgrade Instructions

1. Download link-generator.html from this release (v0.12.4)
2. Re-run the field extractor bookmarklet on your Jira/ServiceNow forms
3. Verify that labels no longer contain "Required" or "Mandatory" text

## Related Releases

- v0.12.3: Added ServiceNow aria-labelledby support, cross-app isolation, field reset fixes
- v0.11.6: Original label cleaning code added (but with regex escaping bug)

## Technical Notes

**Why the double backslash was wrong:**

In a JavaScript string literal, `\\s` is interpreted as:
1. First backslash escapes the second backslash
2. Result: literal backslash character + 's' character
3. Regex matches: `\s` (literal text), not `\s` (whitespace class)

The bookmarklet code is a string containing JavaScript code, so regex patterns need single backslashes to work correctly when executed.
