# Configuration Items Management - Usage Guide

## Overview

The Base URL, Project ID, and Issue Type ID are now fully manageable through the "Manage Fields & Configuration" modal, just like custom fields in the "Add Field" section.

## Accessing Configuration Items

1. Click the **"Manage Fields"** button in any field row
2. The modal will open showing two sections:
   - **Configuration Items** (Base URL, Project ID, Issue Type ID)
   - **Custom Fields** (user-defined fields)

## Managing Configuration Items

### Edit a Configuration Item Label

1. Find the item you want to edit in the "Configuration Items" section
2. Click the **"Edit"** button next to it
3. The item's current label will appear in the input field
4. Modify the label text as desired
5. Click **"Update"** to save
6. Click **"Cancel"** to discard changes

**Example:**
- Original: "Base URL"
- Change to: "Jira Server URL" or "Company Jira URL"
- The ID (baseUrl) stays the same - only the label changes

### Delete a Configuration Item

1. Click the **"Delete"** button next to the item
2. Confirm the deletion when prompted
3. The item will be removed from your local storage

**Note:** Deleting a configuration item only removes it temporarily. When you reload the page or clear your browser's local storage, the default items will reappear.

### Restore Configuration Items

1. Clear your browser's localStorage for this site, OR
2. Open browser DevTools (F12) → Application → Local Storage
3. Find "jiraConfigItems" and delete it
4. Reload the page

## Working with Fields

### Add a Custom Field

1. Open the "Manage Fields & Configuration" modal
2. Enter the **Field ID** (e.g., "customfield_10001") in the ID input
3. Enter the **Label** (e.g., "Priority Level") in the Label input
4. Click **"Add"**
5. The field will appear in the Custom Fields section

### Edit a Custom Field

1. Click **"Edit"** next to the field
2. Modify the label (ID cannot be edited)
3. Click **"Update"**

### Delete a Custom Field

1. Click **"Delete"** next to the field
2. The field will be removed (but can be re-added)

## Configuration Items vs Custom Fields

| Aspect | Config Items | Custom Fields |
|--------|--------------|---------------|
| Built-in Items | Base URL, Project ID, Issue Type ID | None (user-created) |
| ID Editability | Read-only | Read-only during edit |
| Add New | No (pre-defined) | Yes |
| Delete | Yes (can be restored) | Yes |
| Edit Label | Yes | Yes |
| Used in Link Gen | Yes (required) | Optional |
| In Presets | Yes (can be locked) | Optional |

## Using with Presets

When you save a preset, you can optionally "lock" the configuration items:

1. Click **"Save as Preset"**
2. In the modal, check the boxes for items to lock:
   - ☑ Lock Base URL to: https://jira.example.com
   - ☑ Lock Project ID to: 12345
   - ☐ Lock Issue Type to: (unchecked)
3. Click **"Save Preset"**

When the preset is loaded, locked items will automatically populate the form.

## Storage Details

Configuration data is stored in your browser's localStorage:

- **Key:** `jiraConfigItems`
- **Data:** JSON array of configuration items
- **Format:**
  ```json
  [
    {"id":"baseUrl","label":"Base URL","category":"config"},
    {"id":"projectId","label":"Project ID","category":"config"},
    {"id":"issueTypeId","label":"Issue Type ID","category":"config"}
  ]
  ```

## Troubleshooting

### Configuration Items Don't Show Up

1. Check browser console for errors (F12 → Console)
2. Clear localStorage and reload
3. Ensure JavaScript is enabled

### Changes Not Saved

1. Check if your browser allows localStorage
2. Ensure you clicked "Update" button (not just closed modal)
3. Check the "Close" button to exit the modal

### Can't Edit an Item

1. Configuration items in edit mode have their ID field disabled (this is normal)
2. You can only edit the Label field
3. Click Cancel to exit edit mode

### Want Default Items Back

1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Delete the "jiraConfigItems" entry
4. Reload the page

## Best Practices

1. **Use Clear Labels** - Make labels descriptive for your team
   - Instead of: "url"
   - Better: "Production Jira URL"

2. **Document Changes** - Keep notes if you customize items
   - Share label changes with team members

3. **Test After Changes** - Generate a test link after editing
   - Verify the URL is still correct

4. **Backup Important Presets** - Export/save preset names
   - Can't recover deleted presets easily

5. **Use Presets for Different Environments**
   - Dev Preset (locks dev Jira URL)
   - Staging Preset (locks staging Jira URL)
   - Production Preset (locks production Jira URL)

## Examples

### Scenario 1: Multiple Jira Instances

You work with different Jira servers. Create presets for each:

**Preset: Dev Environment**
- Base URL: https://jira-dev.company.com
- Project ID: DEV
- Issue Type: 10001

**Preset: Production Environment**
- Base URL: https://jira.company.com
- Project ID: PROD
- Issue Type: 10001

### Scenario 2: Custom Labels

Your team uses different terminology:

Default → Custom Labels:
- "Base URL" → "Jira Server"
- "Project ID" → "Project Code"
- "Issue Type ID" → "Issue Type Number"

### Scenario 3: Temporary Field Addition

Add a temporary field for tracking:

ID: `customfield_99999`
Label: "Release Version"

Use in presets, then delete when done.

## Related Functions

For developers, the API is exposed in the browser console:

```javascript
// Load current configuration items
loadConfigurationItems()

// Save modified items
saveConfigurationItems([...])

// Load field definitions
loadFieldDefinitions()

// Save field definitions
saveFieldDefinitions([...])
```

## Support

If you encounter issues:

1. Check the browser console (F12 → Console) for error messages
2. Try clearing localStorage and reloading
3. Check test files for expected behavior:
   - test-config-items.js
   - test-config-items-integration.js
   - test-e2e-workflows.js
