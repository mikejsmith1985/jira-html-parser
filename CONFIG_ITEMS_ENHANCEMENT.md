# Configuration Items Management Enhancement

## Summary
The Base URL, Project ID, and Issue Type ID are now fully manageable just like fields in the "Add Field" section. Users can edit their labels and manage them through the same modal interface.

## Changes Made

### 1. **Added Configuration Items Data Structure**
- Created `DEFAULT_CONFIG_ITEMS` constant with three configuration items:
  - `baseUrl` (Base URL)
  - `projectId` (Project ID)
  - `issueTypeId` (Issue Type ID)
- Each config item has properties: `id`, `label`, and `category: "config"`

### 2. **Implemented Configuration Items Persistence Layer**
- `loadConfigurationItems()` - Loads config items from localStorage with fallback to defaults
- `saveConfigurationItems(items)` - Saves config items with deduplication by ID
- Follows the same pattern as field definitions for consistency

### 3. **Enhanced Field Manager Modal**
- Split the modal into two sections:
  - **Configuration Items** - Shows Base URL, Project ID, Issue Type ID
  - **Custom Fields** - Shows user-defined custom fields
- Added `refreshConfigItemsList()` to render configuration items with Edit/Delete buttons
- Both sections share the same add/edit/delete input fields

### 4. **Configuration Items Management Functions**
- `editConfigurationItem(index)` - Opens edit mode for a config item
- `updateConfigurationItem()` - Updates the selected config item's label
- `deleteConfigurationItem(index)` - Removes a config item from the list
- All functions mirror the field definition operations

### 5. **Unified Add/Edit Interface**
- The "Add" button now intelligently handles both config items and fields
- Updated `addFieldDefinition()` to detect if the ID matches a config item or custom field
- Configuration items can only have their labels edited (IDs are protected)
- Custom fields can be added/edited/deleted freely

### 6. **Backward Compatibility**
- Existing presets that lock Base URL, Project ID, and Issue Type ID continue to work
- The original form inputs remain functional
- Configuration items are stored in separate localStorage key (`jiraConfigItems`)
- Field definitions use existing key (`jiraFieldDefinitions`)

## User Experience

### Before
- Base URL, Project ID, and Issue Type ID were hardcoded form inputs
- Could not customize their labels
- Limited management options

### After
- All three items appear in the "Manage Fields & Configuration" modal
- Users can edit labels (e.g., "Base URL" → "Custom Base URL Label")
- Users can optionally delete and restore items
- Full visual consistency with custom field management
- Integrated into preset system for sharing configurations

## File Structure

```
jira-link-generator.html
├── DEFAULT_CONFIG_ITEMS (constant)
├── loadConfigurationItems()
├── saveConfigurationItems()
├── openFieldManager() [updated]
├── refreshConfigItemsList() [new]
├── editConfigurationItem() [new]
├── updateConfigurationItem() [new]
├── deleteConfigurationItem() [new]
├── editFieldDefinition()
├── addFieldDefinition() [enhanced]
├── cancelEditField() [updated]
└── [Other existing functions remain unchanged]
```

## Testing

Three new test files validate the implementation:

1. **test-config-items.js** (14 tests)
   - Configuration items persistence layer
   - Load/save/filter functionality
   - Edit and delete workflows

2. **test-config-items-integration.js** (12 tests)
   - Configuration items visibility and separation
   - Edit workflow with preservation of IDs
   - Delete/restore functionality
   - Coexistence with field definitions
   - UI operation simulation

3. **validate-html.js**
   - Validates all required functions are defined
   - Checks for required HTML elements
   - 35 validation checks passed

All tests pass successfully ✓

## API & Storage

### localStorage Keys
- `jiraConfigItems` - Configuration items (Base URL, Project ID, Issue Type ID)
- `jiraFieldDefinitions` - Custom field definitions
- `jiraGenState` - Current form state
- `jiraConfigurationPresets` - Saved presets

### Configuration Item Schema
```javascript
{
  id: string,           // Unique identifier (baseUrl, projectId, issueTypeId)
  label: string,        // User-facing label
  category: "config"    // Classification
}
```

## Extensibility

The system is designed to easily add more configuration items in the future:
```javascript
// Add to DEFAULT_CONFIG_ITEMS
{ id: "customConfigId", label: "Custom Config", category: "config" }
```

All management functions will automatically support the new item.

## Notes

- Configuration item IDs are immutable (protected in edit mode)
- Labels can be customized freely
- Deleting an item removes it until localStorage is cleared (defaults reload)
- Configuration items are fully integrated with the preset system
- No breaking changes to existing functionality
