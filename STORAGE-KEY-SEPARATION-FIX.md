# Storage Key Separation Fix - v0.6.4

## Issue Report

**Reported by User**: Testing v0.6.3 combined app revealed that:
- ✅ ServiceNow mode shows all ServiceNow configs correctly
- ❌ Jira mode does NOT show Jira configs from legacy jira-link-generator.html
- Only ServiceNow data was visible regardless of selected app type

## Root Cause

The unified link-generator.html was using **shared storage keys** for both app types:
- `linkGenBaseUrls` - used by both Jira and ServiceNow
- `linkGenIssueTypes` - used by both Jira and ServiceNow  
- `linkGenProjectIds` - used by Jira only

### Migration Logic Flaw

When migrating from legacy tools, the code used this pattern:
```javascript
items = loadItems('snowSavedBaseUrls') || loadItems('jiraSavedBaseUrls') || [];
```

**Problem**: The `||` operator stops at the first truthy value. If a user had:
- ServiceNow data in `snowSavedBaseUrls` (empty array `[]`)
- Jira data in `jiraSavedBaseUrls` (with actual data)

The code would:
1. Check `snowSavedBaseUrls` → finds `[]` → truthy! → stops
2. Never checks `jiraSavedBaseUrls`
3. Migrates empty array to unified key
4. Jira data lost/inaccessible

### Data Isolation Issue

Both app types sharing the same storage keys meant:
- Switching from ServiceNow → Jira would show ServiceNow data
- No way to keep Jira and ServiceNow configurations separate
- Migration would overwrite one set of data with the other

---

## Solution Implemented

### 1. App-Specific Storage Keys

Changed `getStorageKey()` to generate app-specific keys:

**Before**:
```javascript
function getStorageKey(key) {
  const prefix = 'linkGen';  // Same for both
  return prefix + key.charAt(0).toUpperCase() + key.slice(1);
}
// Result: linkGenBaseUrls (shared)
```

**After**:
```javascript
function getStorageKey(key) {
  const prefix = currentAppType === 'jira' ? 'linkGenJira' : 'linkGenSnow';
  return prefix + key.charAt(0).toUpperCase() + key.slice(1);
}
// Results: linkGenJiraBaseUrls OR linkGenSnowBaseUrls (separate)
```

### 2. App-Aware Migration Logic

Updated migration to check `currentAppType`:

**Base URLs** (in `populateBaseUrlDropdown()`):
```javascript
// Before: tries all legacy keys regardless of app type
items = loadItems('snowSavedBaseUrls') || loadItems('jiraSavedBaseUrls') || [];

// After: migrates from correct app-specific legacy key
const legacyKey = currentAppType === 'jira' ? 'jiraSavedBaseUrls' : 'snowSavedBaseUrls';
items = loadItems(legacyKey) || [];
```

**Issue Types** (in `populateIssueTypeDropdown()` and `refreshIssueTypeList()`):
```javascript
// Before: tries all legacy keys
items = loadItems('snowSavedIssueTypes') || 
        loadItems('snowSavedTableNames') || 
        loadItems('jiraSavedIssueTypes') || [];

// After: migrates from correct app-specific legacy key
const legacyKey = currentAppType === 'jira' ? 'jiraSavedIssueTypes' : 
                 (loadItems('snowSavedIssueTypes') ? 'snowSavedIssueTypes' : 'snowSavedTableNames');
items = loadItems(legacyKey) || [];
```

**Project IDs** (Jira-only, in `populateProjectIdDropdown()`):
```javascript
// Added proper migration + save logic
let items = loadItems(getStorageKey('projectIds'));
if (!items || items.length === 0) {
  items = loadItems('jiraSavedProjectIds') || [];
  if (items.length > 0) {
    saveItems(getStorageKey('projectIds'), items);
  }
}
```

---

## New Storage Key Structure

### Legacy Keys (from separate tools)
| App Type | Base URLs | Issue Types | Project IDs |
|----------|-----------|-------------|-------------|
| Jira | `jiraSavedBaseUrls` | `jiraSavedIssueTypes` | `jiraSavedProjectIds` |
| ServiceNow | `snowSavedBaseUrls` | `snowSavedIssueTypes` or `snowSavedTableNames` | N/A |

### Unified Keys (new)
| App Type | Base URLs | Issue Types | Project IDs |
|----------|-----------|-------------|-------------|
| Jira | `linkGenJiraBaseUrls` | `linkGenJiraIssueTypes` | `linkGenJiraProjectIds` |
| ServiceNow | `linkGenSnowBaseUrls` | `linkGenSnowIssueTypes` | N/A |

### Key Benefits
1. **Complete Data Isolation**: Jira and ServiceNow configs never interfere
2. **Proper Migration**: Each app migrates only its own legacy data
3. **Backward Compatible**: Reads from legacy keys on first load
4. **Persistent**: After migration, uses unified app-specific keys

---

## Testing

Created comprehensive test suite: `test-legacy-migration.spec.js`

### Test Coverage (8 tests, all passing ✅)

1. **Migrates Jira base URLs from legacy storage**
   - Verifies `jiraSavedBaseUrls` → `linkGenJiraBaseUrls`
   - Checks dropdown population
   
2. **Migrates ServiceNow base URLs from legacy storage**
   - Verifies `snowSavedBaseUrls` → `linkGenSnowBaseUrls`
   - Checks dropdown population

3. **Migrates Jira issue types from legacy storage**
   - Verifies `jiraSavedIssueTypes` → `linkGenJiraIssueTypes`
   
4. **Migrates ServiceNow issue types from legacy storage**
   - Verifies `snowSavedIssueTypes` → `linkGenSnowIssueTypes`
   
5. **Migrates Jira project IDs from legacy storage**
   - Verifies `jiraSavedProjectIds` → `linkGenJiraProjectIds`
   - Confirms save operation completes
   
6. **Keeps Jira and ServiceNow data separate**
   - Loads both legacy datasets
   - Switches between app types
   - Verifies each shows only its own data
   
7. **Handles missing legacy data gracefully**
   - No errors when legacy keys don't exist
   - Empty dropdowns display correctly
   
8. **Migration happens only once per app type**
   - First load: migrates from legacy
   - Subsequent loads: reads from unified key
   - Manual additions persist correctly

---

## Migration Flow

### First Time User Opens Unified Tool

**Scenario A: Has Jira data from legacy tool**
1. Opens `link-generator.html`
2. Clicks "Jira" button
3. `switchAppType('jira')` called
4. `populateBaseUrlDropdown()` runs:
   - Checks `linkGenJiraBaseUrls` → empty
   - Falls back to `jiraSavedBaseUrls` → finds data!
   - Migrates to `linkGenJiraBaseUrls`
   - Populates dropdown
5. `populateIssueTypeDropdown()` runs (same process)
6. `populateProjectIdDropdown()` runs (same process)
7. **Result**: All Jira configs visible ✅

**Scenario B: Has ServiceNow data from legacy tool**
1. Opens `link-generator.html` (defaults to ServiceNow)
2. `populateBaseUrlDropdown()` runs:
   - Checks `linkGenSnowBaseUrls` → empty
   - Falls back to `snowSavedBaseUrls` → finds data!
   - Migrates to `linkGenSnowBaseUrls`
3. **Result**: All ServiceNow configs visible ✅

**Scenario C: Has BOTH Jira and ServiceNow data**
1. Opens tool → ServiceNow data migrated
2. Clicks "Jira" → Jira data migrated
3. Can switch freely between both
4. Each app type maintains separate configs ✅

---

## User Impact

### Before Fix (v0.6.3)
- ❌ Jira users: couldn't see legacy configurations
- ❌ Mixed users: only ServiceNow data visible
- ❌ Switching app types: didn't change data shown
- ❌ Data loss: one dataset would overwrite the other

### After Fix (v0.6.4)
- ✅ Jira users: all legacy configs migrated correctly
- ✅ ServiceNow users: all legacy configs migrated correctly
- ✅ Mixed users: both datasets preserved and isolated
- ✅ Switching app types: shows correct data for each
- ✅ No data loss: complete backward compatibility

---

## Files Modified

1. **link-generator.html**
   - `getStorageKey()` - app-specific key generation
   - `populateBaseUrlDropdown()` - app-aware migration
   - `populateIssueTypeDropdown()` - app-aware migration
   - `refreshIssueTypeList()` - app-aware migration
   - `populateProjectIdDropdown()` - added migration + save

2. **test-legacy-migration.spec.js** (NEW)
   - 8 comprehensive tests
   - Covers all migration scenarios
   - Verifies data isolation

---

## Deployment

```bash
# Committed: 562cb55
# Branch: master
# Status: Pushed to GitHub
```

**Next Version**: v0.6.4 (ready for release)

---

## Verification Steps for Users

1. **If you have OLD Jira configs**:
   - Open unified `link-generator.html`
   - Click "Jira" button at top
   - Your Base URLs, Issue Types, Project IDs should appear in dropdowns
   - Data is now saved under new `linkGenJira*` keys

2. **If you have OLD ServiceNow configs**:
   - Open unified `link-generator.html`
   - ServiceNow should be selected by default
   - Your Base URLs, Issue Types should appear in dropdowns
   - Data is now saved under new `linkGenSnow*` keys

3. **If you have BOTH**:
   - Switch between app types using top buttons
   - Each should show its own configs
   - No mixing of data

---

## Technical Notes

### Why Not Merge Data?

We keep Jira and ServiceNow data separate because:
- **Different schemas**: Jira has Project IDs, ServiceNow doesn't
- **Different URL patterns**: Mixing would be confusing
- **User expectations**: Users want to manage them independently
- **Safer**: No risk of data corruption from attempted merges

### Storage Size Impact

Minimal - each app's data is stored independently:
- Typical user: ~1-5 KB per app type
- Mixed user: ~2-10 KB total
- Well within localStorage limits (5-10 MB)

---

Last updated: 2025-01-16  
Status: ✅ Fixed and tested  
Version: v0.6.4 (pending release)
