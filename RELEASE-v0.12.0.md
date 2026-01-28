# Release v0.12.0

## 🎯 Major Improvements

### 1. **Multi-File Import** ✨
You can now select multiple JSON configuration files at once when importing. The tool will:
- Automatically merge all configurations
- Intelligently deduplicate base URLs, issue types, and project IDs
- **Properly assign `baseUrlId` and `issueTypeId` to each field BEFORE merging**
- Preserve field duplicates across different issue types (so the optimizer can find them!)
- Show you a unified preview with duplicate detection before importing

**How to use:**
1. Click "Import Config"
2. Select multiple JSON files at once (Ctrl/Cmd+Click to multi-select)
3. Review the merged preview showing duplicate detection
4. Import all at once

**Example:** Import 7 JSON field extractions from different Jira issue types (Task, Story, Defect, etc.) all at once. The preview will show you "Summary appears in 7 issue types" before you import.

### 2. **Fixed Field Optimizer Bug** 🐛
The optimizer was unable to detect duplicate fields because the `saveFieldDefinitions()` function was deduplicating fields by ID only during save. This meant fields with the same ID across different issue types (e.g., "Summary" in Task, Story, and Defect) were being removed before the optimizer could see them.

**The Fix:**
- Changed deduplication logic to use `id + issueTypeId + baseUrlId` as the unique key
- Now preserves fields across multiple issue types
- Optimizer can now correctly detect and merge duplicates

### 3. **Fixed Multi-File Import Processing** 🔧
The initial v0.11.8 implementation had a bug where fields weren't getting their `baseUrlId` and `issueTypeId` assigned before merging. This has been fixed:
- Each config is now processed individually BEFORE merging
- Fields from extraction format (with top-level `baseUrl` and `issueType`) are properly converted
- All 260 fields from 7 different extractions are now correctly preserved with metadata
- Optimizer can detect all 47 duplicate field groups

**Test Results:** Using your 7 field extraction files:
- ✅ 260 fields imported successfully
- ✅ 47 duplicate groups detected (215 total instances)
- ✅ "Summary" detected across all 7 issue types
- ✅ "Description" detected across all 7 issue types
- ✅ Optimizer correctly identifies all duplicates

### 4. **GitHub Action Cleanup**
- Removed separate `jira-link-generator.html` and `servicenow-link-generator.html` from releases
- Only `link-generator.html` is released (unified tool)
- Cleaner release assets

## 📊 Import Preview Enhancements

The import preview now shows:
- **Issue Type badges** on each field showing which issue type it belongs to
- **Duplicate detection summary** showing how many fields appear across multiple issue types
- **Total duplicate instances** to help you understand what the optimizer will find
- **Helpful tip** to use the Field Optimizer after importing

## 🔧 Technical Changes

- `openImportModal()` now supports `multiple` file selection
- New `importMultipleConfigurations()` async function for merging configs
- Enhanced `saveFieldDefinitions()` to preserve cross-issue-type fields
- Improved import preview with duplicate analysis
- Updated GitHub Actions workflow to only release unified tool

## 📝 Usage Notes

**If you had duplicate fields that were being removed:**
1. Export your current config as backup
2. Clear your field definitions (or remove from localStorage)
3. Re-import from your JSON field extractions (all at once now!)
4. The optimizer should now detect your duplicates

**Multi-file import workflow:**
- Extract fields from multiple Jira issue types (Task, Story, Defect, etc.)
- Import all JSON files at once
- Review the preview showing duplicate detection
- Import and then use Field Optimizer to merge

## 🎉 What's Next

With proper duplicate detection working, you can now:
- Import fields from multiple issue types
- See exactly which fields are duplicated
- Use the Field Optimizer to merge them into global fields
- Reduce configuration complexity significantly
