# Release v0.6.0: Unified Link Generator with Enhanced Field Extractor

**Released**: 2026-01-26

## Overview

This major release combines the best of both tools (Jira and ServiceNow) into a single unified application with powerful new field extraction capabilities.

## Major Features

### 🎯 Unified Link Generator (`link-generator.html`)
- Single tool for both **Jira** and **ServiceNow** with intelligent app type detection
- App type selector buttons for manual switching
- Base URL auto-detection from form selection
- **Recommended**: Use this going forward instead of separate tools

### 🔄 Enhanced Field Extractor (v1.2.0)
- **New**: Extracts dropdown/select options with labels and values
- Perfect for setting up combobox fields with predefined options
- Detects field types automatically:
  - Text fields → `fieldType: 'text'`
  - Dropdown fields → `fieldType: 'combobox'` with options array
- Shows extraction summary: "Found 15 fields (3 dropdowns with options)"
- Works for both Jira and ServiceNow

### 📝 Terminology Update
- Renamed "Table Name" → "Issue Type" across ServiceNow tool
- More familiar terminology for both Jira and ServiceNow users
- Updated all labels, functions, and storage keys

### 🗂️ Unified Storage
- New unified storage keys: `linkGen*` (replaces `snow*` and `jira*`)
- Automatic backward compatibility with legacy keys
- Migration happens transparently on first load

## What's New

### Field Extractor Example Output
```json
{
  "version": "1.2.0",
  "appType": "servicenow",
  "fieldDefinitions": [
    {
      "id": "priority",
      "label": "Priority",
      "fieldType": "combobox",
      "options": [
        { "label": "1 - Critical", "value": "1" },
        { "label": "2 - High", "value": "2" },
        { "label": "3 - Moderate", "value": "3" }
      ]
    },
    {
      "id": "short_description",
      "label": "Short Description", 
      "fieldType": "text"
    }
  ]
}
```

### Project ID Manager (Jira)
- Manage multiple Jira projects with aliases
- Save, edit, delete project IDs
- Quick selection when generating links

### Improved Features
- Dynamic Field Extractor bookmarklet based on app type
- Auto-detection of base URL and issue type from page URL
- Unified configuration export/import with app type preservation
- Deprecation notices on legacy tool files (still functional)

## Breaking Changes

⚠️ **ServiceNow Storage Migration**
- Old key: `snowSavedTableNames` → New key: `snowSavedIssueTypes`
- Old key: `snowSavedBaseUrls` → New key: `linkGenBaseUrls`
- Migration happens automatically on first load
- Legacy data is preserved and migrated

## Files Changed

| File | Status | Description |
|------|--------|-------------|
| `link-generator.html` | **NEW** | Unified tool for both Jira and ServiceNow |
| `servicenow-link-generator.html` | Updated | Terminology changes, marked deprecated |
| `jira-link-generator.html` | Updated | Enhanced Field Extractor, marked deprecated |
| `test-unified-link-generator.spec.js` | **NEW** | 5 comprehensive tests for unified tool |
| `README.md` | Updated | Updated documentation and examples |

## Test Results

✅ **7 tests passing** (new unified tool + field extractor tests)
✅ **66 existing tests passing**
✅ All critical functionality verified

## Migration Guide

### For ServiceNow Users
1. Open `link-generator.html` instead of `servicenow-link-generator.html`
2. Old data is automatically migrated to new storage keys
3. Terminology changed from "Table Name" to "Issue Type"

### For Jira Users  
1. Open `link-generator.html` instead of `jira-link-generator.html`
2. New Project ID Manager provides better UX
3. Old project ID data is migrated automatically

### Using the Field Extractor
1. Click "Field Extractor" button
2. Run the bookmarklet on your Jira/ServiceNow form page
3. JSON output now includes:
   - `fieldType` (text or combobox)
   - `options` array for dropdowns (if applicable)
   - `baseUrl` and `issueType` auto-detected

## What's Deprecated

The following files still work but should be considered legacy:

- `servicenow-link-generator.html` → Use `link-generator.html` instead
- `jira-link-generator.html` → Use `link-generator.html` instead

Both files have deprecation notices in their headers and will continue to receive maintenance for backward compatibility.

## Next Steps

### Recommended Actions
1. Update bookmarks to point to `link-generator.html`
2. Share the new unified tool with your team
3. Use Field Extractor to extract and configure dropdowns

### Future Enhancements
- Field filtering by issue type
- Advanced field validation
- Configuration sharing UI improvements
- Additional field type support

## Support

For issues or questions:
- GitHub Issues: https://github.com/mikejsmith1985/jira-html-parser/issues
- Check README.md for usage guide
- All legacy tools still functional for now

---

**Thank you for using Link Generator!** 🚀
