# Release v0.6.4 - Storage Key Separation Fix

**Release Date**: 2025-01-16  
**Type**: Bug Fix  
**Severity**: High (data access issue)

---

## 🐛 Critical Bug Fix

### Issue Fixed
The unified link generator (v0.6.3) was **not loading Jira configurations** when switching from ServiceNow mode. Users with legacy Jira data from `jira-link-generator.html` could not access their saved Base URLs, Issue Types, or Project IDs.

### Impact
- ❌ Jira users: Could not see legacy configurations
- ❌ Mixed users: Only ServiceNow data visible regardless of app selection
- ❌ Data appeared lost (though it was still in localStorage)

### Root Cause
The unified tool used **shared storage keys** (`linkGenBaseUrls`, `linkGenIssueTypes`) for both app types. Migration logic checked ServiceNow keys first, preventing Jira data from being loaded.

---

## ✅ What's Fixed

### 1. App-Specific Storage Keys

**Before** (v0.6.3):
```
linkGenBaseUrls      (shared by both)
linkGenIssueTypes    (shared by both)
linkGenProjectIds    (Jira only)
```

**After** (v0.6.4):
```
Jira:        linkGenJiraBaseUrls, linkGenJiraIssueTypes, linkGenJiraProjectIds
ServiceNow:  linkGenSnowBaseUrls, linkGenSnowIssueTypes
```

### 2. App-Aware Migration Logic

- Selecting **Jira** → migrates from `jiraSavedBaseUrls`, `jiraSavedIssueTypes`, `jiraSavedProjectIds`
- Selecting **ServiceNow** → migrates from `snowSavedBaseUrls`, `snowSavedIssueTypes`
- Migration happens **once per app type** on first load
- Subsequent loads use the new unified keys

### 3. Complete Data Isolation

- Jira and ServiceNow data **never interfere** with each other
- Switching between app types shows correct data
- No data loss or corruption
- Full backward compatibility maintained

---

## 📋 Files Changed

1. **link-generator.html**
   - Updated `getStorageKey()` to generate app-specific keys
   - Fixed `populateBaseUrlDropdown()` migration logic
   - Fixed `populateIssueTypeDropdown()` migration logic
   - Fixed `refreshIssueTypeList()` migration logic
   - Fixed `populateProjectIdDropdown()` with proper migration

2. **test-legacy-migration.spec.js** (NEW)
   - 8 comprehensive tests for migration logic
   - Tests Jira data migration
   - Tests ServiceNow data migration
   - Tests data isolation between app types
   - All tests passing ✅

3. **STORAGE-KEY-SEPARATION-FIX.md** (NEW)
   - Detailed technical documentation
   - Root cause analysis
   - Migration flow diagrams
   - User verification steps

4. **package.json** & **package-lock.json**
   - Version bumped to 0.6.4

---

## 🧪 Testing

### Test Results
- **New Tests**: 8 migration tests (all passing ✅)
- **Existing Tests**: 71 tests (all passing ✅)
- **Total**: 79 tests passing

### Test Coverage
- ✅ Jira base URL migration
- ✅ Jira issue type migration
- ✅ Jira project ID migration
- ✅ ServiceNow base URL migration
- ✅ ServiceNow issue type migration
- ✅ Data separation verification
- ✅ Missing data handling
- ✅ Migration happens only once

---

## 🚀 Upgrade Instructions

### If You're Using v0.6.3

1. **Download** `link-generator.html` from this release
2. **Replace** your existing v0.6.3 file
3. **Open** in your browser
4. **Select** your app type (Jira or ServiceNow)
5. **Verify** your configurations appear correctly

### What Happens on First Load

**Jira Users**:
- Opens tool → defaults to ServiceNow
- Click "Jira" button
- Migration happens automatically from `jiraSavedBaseUrls`, etc.
- All your Jira configs appear ✅
- Data saved to new `linkGenJira*` keys

**ServiceNow Users**:
- Opens tool → defaults to ServiceNow
- Migration happens automatically from `snowSavedBaseUrls`, etc.
- All your ServiceNow configs appear ✅
- Data saved to new `linkGenSnow*` keys

**Mixed Users** (have both):
- ServiceNow data migrates on first load
- Click "Jira" → Jira data migrates
- Can switch freely between both
- Each app type maintains separate configs ✅

---

## 📝 Migration Details

### Legacy Storage Keys (from separate tools)
- **Jira**: `jiraSavedBaseUrls`, `jiraSavedIssueTypes`, `jiraSavedProjectIds`
- **ServiceNow**: `snowSavedBaseUrls`, `snowSavedIssueTypes` (or `snowSavedTableNames`)

### New Unified Keys (v0.6.4+)
- **Jira**: `linkGenJiraBaseUrls`, `linkGenJiraIssueTypes`, `linkGenJiraProjectIds`
- **ServiceNow**: `linkGenSnowBaseUrls`, `linkGenSnowIssueTypes`

### Migration Process
1. First time selecting an app type
2. Checks for new unified key → not found
3. Falls back to legacy key for that app type
4. Migrates data to new unified key
5. Subsequent loads read from new key

**Note**: Legacy keys are **not deleted** - they remain for backward compatibility with old tools.

---

## 🔧 Technical Details

### Storage Key Generation
```javascript
function getStorageKey(key) {
  // App-specific prefix based on currentAppType
  const prefix = currentAppType === 'jira' ? 'linkGenJira' : 'linkGenSnow';
  return prefix + key.charAt(0).toUpperCase() + key.slice(1);
}

// Examples:
// Jira:        getStorageKey('baseUrls') → 'linkGenJiraBaseUrls'
// ServiceNow:  getStorageKey('baseUrls') → 'linkGenSnowBaseUrls'
```

### Migration Logic Example
```javascript
function populateBaseUrlDropdown() {
  const select = document.getElementById('baseUrl');
  if (!select) return;
  
  // Try unified key first
  let items = loadItems(getStorageKey('baseUrls'));
  
  if (!items || items.length === 0) {
    // Migrate from app-specific legacy key
    const legacyKey = currentAppType === 'jira' ? 'jiraSavedBaseUrls' : 'snowSavedBaseUrls';
    items = loadItems(legacyKey) || [];
    if (items.length > 0) {
      saveItems(getStorageKey('baseUrls'), items);  // Save to new key
    }
  }
  
  // Populate dropdown...
}
```

---

## 📊 Comparison Table

| Feature | v0.6.3 (Broken) | v0.6.4 (Fixed) |
|---------|-----------------|----------------|
| Jira data loading | ❌ Not working | ✅ Working |
| ServiceNow data loading | ✅ Working | ✅ Working |
| Data isolation | ❌ Shared keys | ✅ Separate keys |
| Mixed user support | ❌ Only SNOW visible | ✅ Both work |
| Migration logic | ❌ SNOW-priority | ✅ App-aware |
| Backward compatibility | ✅ Yes | ✅ Yes |
| Test coverage | 71 tests | 79 tests (+8) |

---

## 🎯 Verification Steps

### For Jira Users
1. Open `link-generator.html`
2. Click **"Jira"** button at top
3. Check dropdowns:
   - Base URL dropdown shows your Jira URLs ✅
   - Issue Type dropdown shows your issue types ✅
   - Project ID dropdown shows your projects ✅

### For ServiceNow Users
1. Open `link-generator.html`
2. Tool defaults to **ServiceNow** mode
3. Check dropdowns:
   - Base URL dropdown shows your SNOW URLs ✅
   - Issue Type dropdown shows your issue types ✅

### For Mixed Users
1. Open tool → ServiceNow configs visible
2. Click **"Jira"** → Jira configs visible
3. Click **"ServiceNow"** → ServiceNow configs still there
4. Switch back and forth → each maintains its own data ✅

---

## 📚 Documentation

- **User Guide**: See [README.md](https://github.com/mikejsmith1985/jira-html-parser/blob/master/README.md)
- **Technical Details**: See [STORAGE-KEY-SEPARATION-FIX.md](https://github.com/mikejsmith1985/jira-html-parser/blob/master/STORAGE-KEY-SEPARATION-FIX.md)
- **Version Management**: See [VERSION-MANAGEMENT.md](https://github.com/mikejsmith1985/jira-html-parser/blob/master/VERSION-MANAGEMENT.md)
- **Full v0.6.0 Release**: See [RELEASE-v0.6.0.md](https://github.com/mikejsmith1985/jira-html-parser/blob/master/RELEASE-v0.6.0.md)

---

## 🐛 Known Issues

None reported for v0.6.4.

---

## 🙏 Credits

- **Reported by**: User testing of v0.6.3
- **Fixed by**: GitHub Copilot CLI
- **Released**: 2025-01-16

---

## 📦 Assets

Download from this release:
- **link-generator.html** - 🆕 **RECOMMENDED** - Unified tool (v0.6.4)
- **jira-link-generator.html** - Deprecated (legacy Jira-only tool)
- **servicenow-link-generator.html** - Deprecated (legacy ServiceNow-only tool)
- **package.json** - Project metadata
- **README.md** - User documentation

---

## 🔜 What's Next

v0.6.4 is a **critical bug fix** release. Future releases will focus on:
- Additional Field Extractor enhancements
- UI/UX improvements
- Performance optimizations

---

**Full Changelog**: [v0.6.3...v0.6.4](https://github.com/mikejsmith1985/jira-html-parser/compare/v0.6.0...v0.6.4)
