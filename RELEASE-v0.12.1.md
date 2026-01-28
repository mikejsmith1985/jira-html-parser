# Release v0.12.1

## 🐛 Critical Bugfix

### **Fixed: Import Losing 168 Fields!**
In v0.12.0, the `mergeItems()` function in `executeImport` was deduplicating fields by ID only, which meant it was **removing duplicate fields across different issue types**. This is why the optimizer couldn't find any duplicates after import.

**The Problem:**
- Multi-file import would correctly process 260 fields with proper metadata
- But `mergeItems(existing, incoming)` in `executeImport` was using `map.set(item.id, item)`
- This removed all but ONE instance of each field ID
- Result: 260 fields → 92 fields (lost 168 fields!)
- Optimizer had nothing to detect

**The Fix:**
- Added `isFieldDefinitions` parameter to `mergeItems()`
- When true, uses `id + issueTypeId + baseUrlId` as the unique key
- Preserves all field instances across different issue types
- Updated `executeImport` to call `mergeItems(existing, config.fieldDefinitions, true)`

**Test Results:**
- ✅ 260 fields imported → 260 fields saved (0 lost!)
- ✅ 47 duplicate groups correctly preserved
- ✅ Optimizer can now detect all duplicates

## 📊 Before vs After

### v0.12.0 (Broken)
```
Import: 260 fields
After mergeItems: 92 fields (lost 168!)
Optimizer: "No duplicates found" ❌
```

### v0.12.1 (Fixed)
```
Import: 260 fields  
After mergeItems: 260 fields (lost 0!)
Optimizer: "Found 47 duplicate groups" ✅
```

## 🚀 What You Should Do

If you imported with v0.12.0:
1. **Clear your field definitions** (or export backup first)
2. **Download v0.12.1**
3. **Re-import your JSON files**
4. **Run Field Optimizer** - it will now work!

## 🎯 Multi-File Import Now Fully Working

Import all your JSON field extractions at once, and the optimizer will correctly detect:
- Summary across 7 issue types
- Description across 7 issue types  
- Assignee across 7 issue types
- And 44 more duplicate groups!
