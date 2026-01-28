# User Guide: Unified Link Generator (v0.12.4)

This comprehensive guide explains how to use the **Unified Link Generator** for both Jira and ServiceNow. Create pre-filled URL links, manage field definitions, optimize duplicates, and share configurations with your team.

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [App Type Switching](#app-type-switching)
4. [Working with Jira](#working-with-jira)
5. [Working with ServiceNow](#working-with-servicenow)
6. [Field Extractor Bookmarklet](#field-extractor-bookmarklet)
7. [Multi-File Import](#multi-file-import)
8. [Field Management](#field-management)
9. [Field Optimizer](#field-optimizer)
10. [Configuration Presets](#configuration-presets)
11. [Export & Import](#export--import)
12. [Troubleshooting](#troubleshooting)

---

## Introduction

The **Unified Link Generator** is a single-file application that works with both Jira and ServiceNow:

*   **Unified Interface**: One HTML file (`link-generator.html`) handles both Jira and ServiceNow
*   **App Type Switching**: Toggle between Jira and ServiceNow modes with a single click
*   **Offline Capable**: Runs entirely in your browser - no server required
*   **Persistent Storage**: Settings are saved to browser localStorage with complete app isolation
*   **Cross-App Isolation**: Jira and ServiceNow fields are kept completely separate
*   **Field Optimizer**: Detect and merge duplicate field definitions across multiple issue types
*   **Multi-File Import**: Import multiple JSON field extractions at once
*   **Shareable**: Export/import configurations as JSON files

## Getting Started

1.  **Download**: Get the latest `link-generator.html` from the [Releases page](https://github.com/mikejsmith1985/jira-html-parser/releases)
2.  **Open**: Double-click the file to open it in any modern web browser (Chrome, Edge, Firefox, Safari)
3.  **Choose App Type**: Click the toggle button to select Jira or ServiceNow mode
4.  **No Installation Required**: Works entirely offline in your browser

---

## App Type Switching

The application supports both Jira and ServiceNow with complete data isolation.

### How to Switch

*   **Toggle Button**: Click the **"Switch to [App]"** button in the top-right corner
*   **Jira Mode**: Blue theme, shows Jira-specific fields (Project ID, Issue Type)
*   **ServiceNow Mode**: Purple theme, shows ServiceNow-specific fields (Table Name)

### Data Isolation

*   **Separate Storage**: Jira and ServiceNow use completely separate localStorage keys
*   **No Cross-Contamination**: Fields, Base URLs, Issue Types, and Presets are app-specific
*   **Field Optimizer**: Respects app boundaries - will NOT merge Jira and ServiceNow fields
*   **Switching Clears Form**: When you switch apps, field selections are cleared if they don't match the new app type

### Storage Keys

The application uses these localStorage keys:

**Jira:**
- `linkGenJiraBaseUrls`
- `linkGenJiraIssueTypes` (formerly Project IDs)
- `linkGenJiraFieldDefinitions`
- `linkGenJiraPresets`

**ServiceNow:**
- `linkGenSnowBaseUrls`
- `linkGenSnowIssueTypes` (formerly Table Names)
- `linkGenSnowFieldDefinitions`
- `linkGenSnowPresets`

---

## Working with Jira

### Basic Setup

1.  **Switch to Jira Mode**: Ensure the toggle shows you're in Jira mode (blue theme)
2.  **Base URL**: Select or add your Jira instance URL
    - Click **"Manage"** to add new base URLs
    - Example: `https://company.atlassian.net`
3.  **Issue Type**: Select the type of issue to create
    - Click **"Manage"** to add issue types with their IDs
    - Example: Bug (ID: `10001`), Story (ID: `10002`)

### Adding Fields

*   Click **"+ Add Field"** to add a field row
*   Select from available fields (Summary, Description, Priority, etc.)
*   Fill in the value for each field
*   **Required Fields**: Fields marked with ⚠️ are required for the selected issue type

### Field Types

*   **Text Fields**: Standard text input with rich text support
*   **Combobox Fields**: Dropdowns with predefined options
*   **Rich Text**: Description fields support formatting (bold, italic, bullets, etc.)

### Generating Jira Links

1.  Fill in all desired field values
2.  Click **"Generate Link"**
3.  The generated URL appears in the output box
4.  Click **"Copy"** to copy the URL to clipboard
5.  Share the link - when opened, it creates a new Jira issue with all fields pre-filled

---

## Working with ServiceNow

### Basic Setup

1.  **Switch to ServiceNow Mode**: Click toggle to switch (purple theme)
2.  **Base URL**: Select or add your ServiceNow instance URL
    - Click **"Manage"** to add new instances
    - Example: `https://dev12345.service-now.com`
3.  **Table Name**: Select the table for the record
    - Click **"Manage"** to add table names
    - Common tables: `incident`, `change_request`, `problem`

### ServiceNow-Specific Features

*   **Table.Field ID Format**: ServiceNow fields use `table.field` format (e.g., `change_request.risk`)
*   **Rich Text Support**: Full formatting support for description fields
*   **Dropdown Options**: Combobox fields can have value/label pairs

### URL Length Limits

*   ServiceNow has URL length restrictions
*   The tool warns if content exceeds **8,200 characters**
*   **Tip**: Reduce description field length if you see warnings to avoid "414 Request-URI Too Large" errors

### Generating ServiceNow Links

1.  Fill in all desired field values
2.  Click **"Generate Link"**
3.  Copy and share the generated URL
4.  Opens ServiceNow with all fields pre-filled in the new record form

---

## Field Extractor Bookmarklet

The Field Extractor automatically discovers all fields on a Jira or ServiceNow form page.

### How It Works

1.  **Generate Bookmarklet**: Click the **"🔍 Generate Field Extractor"** button
2.  **Drag to Bookmarks**: Drag the generated bookmarklet button to your browser's bookmarks bar
3.  **Navigate**: Go to a Jira issue creation page or ServiceNow form
4.  **Run Extractor**: Click the bookmarklet from your bookmarks bar
5.  **View Results**: A modal appears showing all detected fields
6.  **Download JSON**: Click "Download JSON" to save the field definitions

### What It Detects

**For Jira:**
- Field IDs and names
- Field labels (with "Required"/"Mandatory" cleaned)
- Required fields (marked with ⚠️)
- Dropdown options (for combobox fields)
- Base URL and Project Key
- Issue Type

**For ServiceNow:**
- Field IDs (using `aria-labelledby` for label detection)
- Field names in `table.field` format
- Required fields
- Dropdown options with value/label pairs
- Base URL
- Table name

### Field Cleaning

The extractor automatically:
- Removes "Required" and "Mandatory" from labels
- Skips technical/validation fields
- Skips duplicate textarea variants
- Skips QuickSearch and system fields
- Capitalizes labels for readability

### Version Info

*   **Extractor Version**: v0.11.6 (embedded in bookmarklet)
*   **Output Format**: JSON with metadata (version, timestamp, tool info)

---

## Multi-File Import

Import multiple JSON field extraction files at once to consolidate fields from different issue types.

### Why Use Multi-File Import?

*   **Consolidate Fields**: Import fields from Bug, Story, Task, etc. all at once
*   **Detect Duplicates**: The import preview shows which fields appear in multiple issue types
*   **Merge Automatically**: Field definitions are merged intelligently during import

### How to Use

1.  **Extract Fields**: Use the Field Extractor on multiple forms
    - Example: Run on Bug form → Download JSON
    - Run on Story form → Download JSON
    - Run on Task form → Download JSON

2.  **Multi-Import**: Click **"📁 Import Multiple Configurations"**
    - Select multiple JSON files at once (Ctrl+Click or Shift+Click)
    - Click "Open"

3.  **Review Preview**:
    - Shows total fields being imported
    - **Duplicate Preview**: Lists fields that appear in 2+ issue types
    - Example: "Summary" appears in 7 issue types

4.  **Confirm Import**:
    - Click **"Confirm Import"** to proceed
    - All fields are saved with their issue type associations

### What Gets Merged

*   **Field Definitions**: All unique fields are preserved
*   **Issue Type Associations**: Each field remembers which issue types it belongs to
*   **Duplicate Detection Key**: Fields are unique by `id + issueTypeId + baseUrlId`
*   **Metadata**: Base URLs and Issue Types are also imported

### After Import

1.  **Run Field Optimizer**: Open Field Manager → Click "Optimize Fields"
2.  **Review Duplicates**: See which fields appear in multiple issue types
3.  **Merge if Desired**: Consolidate duplicate fields to global or multi-type variants

---

## Field Management

Click **"Manage Fields"** to view, add, edit, or delete field definitions.

### Field Manager Modal

*   **Search**: Filter fields by name
*   **Filter by Issue Type**: Show only fields for a specific issue type
*   **Add Field**: Create new custom field definitions
*   **Edit**: Modify existing field properties
*   **Delete**: Remove fields (with confirmation)
*   **Toggle Ignored**: Hide fields from the field selector without deleting them

### Field Properties

When adding/editing a field:

*   **ID** (required): Internal system field ID
    - Jira: `customfield_10000`, `summary`, `description`
    - ServiceNow: `change_request.risk`, `incident.short_description`
*   **Label** (required): Display name shown in dropdown
*   **Category**: `standard`, `custom`, or `epic`
*   **Field Type**: `text` (rich editor) or `combobox` (dropdown)
*   **Base URL**: Associate with specific base URL (optional)
*   **Issue Type / Table Name**: Associate with specific issue type (optional)
*   **Required**: Mark as required field
*   **Options** (for combobox): Define dropdown options with labels and values

### Association Levels

Fields can be:

1.  **Global**: No associations - appears for all base URLs and issue types
2.  **Base URL-Specific**: Only appears when that base URL is selected
3.  **Issue Type-Specific**: Only appears when that issue type is selected
4.  **Multi-Issue-Type**: Field has array of issue type IDs (created by Field Optimizer)

### Finding Field IDs

**Option 1: Field Extractor (Recommended)**
- Use the bookmarklet to automatically discover all fields
- See [Field Extractor Bookmarklet](#field-extractor-bookmarklet) section

**Option 2: Manual Inspection**
1.  Navigate to Jira/ServiceNow form
2.  Right-click on the field → "Inspect Element"
3.  Look for `id` or `name` attribute in the HTML
4.  For ServiceNow, check `aria-labelledby` to find the label element

---

## Field Optimizer

The Field Optimizer detects duplicate field definitions and helps consolidate them.

### What It Detects

Fields are considered duplicates if they have:
- Same field ID
- Same base URL
- **Same app type** (Jira fields are NEVER merged with ServiceNow fields)
- Multiple instances across different issue types

### When to Use

*   After importing multiple JSON files (one per issue type)
*   When you notice the same field appearing in multiple issue type dropdowns
*   To reduce redundancy and simplify field management

### How to Use

1.  **Open Field Manager**: Click "Manage Fields"
2.  **Click "Optimize Fields"**: Opens the Field Optimizer modal
3.  **Review Analysis**:
    - Shows duplicate groups sorted by instance count
    - Example: "Summary" appears in 7 issue types
4.  **Choose Action**:
    - **Merge to Global**: Creates one global field (no issue type restriction)
    - **Merge to Multi-Type**: Creates one field with array of issue type IDs
    - **Ignore**: Skip this field group

### Merge Strategies

**Global Merge:**
- Removes all instances
- Creates ONE field with no `issueTypeId`
- Appears for ALL issue types
- **Use when**: Field is universal (Summary, Description, Priority)

**Multi-Type Merge:**
- Removes all instances
- Creates ONE field with `issueTypeId: [array of IDs]`
- Appears only for specified issue types
- **Use when**: Field appears in some issue types but not all

### Safety Features

*   **Backup Created**: Before any merge, a backup is saved to `lastFieldOptimizationBackup`
*   **Confirmation Required**: You must confirm before merging
*   **Real-Time Preview**: Shows how many duplicates will be removed
*   **App Type Isolation**: Jira and ServiceNow fields are kept completely separate

### Example Workflow

1.  Import 7 JSON files (Bug, Story, Task, Epic, Subtask, Incident, Change)
2.  Open Field Optimizer → See "Summary appears in 7 issue types"
3.  Click "Merge to Global" → Confirm
4.  Result: 7 instances reduced to 1 global instance
5.  "Summary" now appears for all issue types without duplication

---

## Configuration Presets

Save and load form configurations for quick reuse.

### Saving a Preset

1.  Configure the form with fields and values
2.  Click **"Save as Preset"**
3.  Enter a name (e.g., "Standard Bug Report")
4.  Optionally add a description
5.  **Lock Options**:
    - Lock Base URL: Preset will always use this base URL
    - Lock Issue Type: Preset will always use this issue type

### Loading a Preset

1.  Select from **"Load Preset"** dropdown
2.  Form instantly populates with saved fields and values
3.  Base URL and Issue Type are set if they were locked

### Managing Presets

Click **"Manage Presets"** to:
- View all saved presets
- Edit preset details
- Delete presets
- See which presets are locked to specific base URLs/issue types

### Preset Storage

*   Presets are app-specific (separate for Jira and ServiceNow)
*   Switching apps shows different preset lists
*   Exported configurations include presets

---

## Export & Import

Share your complete configuration (Base URLs, Issue Types, Fields, Presets) with your team.

### Single Configuration Export

1.  Click **"Export Config"** (green button)
2.  Downloads JSON file: `jira-config-YYYY-MM-DD.json` or `servicenow-config-YYYY-MM-DD.json`
3.  Share file with team members

### Single Configuration Import

1.  Click **"Import Config"** (orange button)
2.  Select a JSON file
3.  **Import Behavior**: Merges with existing data
    - New items are added
    - Items with matching IDs are updated
    - Existing unique items are preserved

### Multi-File Import

1.  Click **"📁 Import Multiple Configurations"**
2.  Select multiple JSON files (Ctrl+Click)
3.  Preview shows total fields and duplicates
4.  Confirm to import all files at once

### What Gets Exported/Imported

*   Base URLs (instances)
*   Issue Types (with IDs)
*   Field Definitions (with all properties)
*   Configuration Presets
*   App type information (auto-detected)

### Export Format

The JSON file includes:
```json
{
  "version": "1.3.0",
  "exportedAt": "2026-01-28T18:00:00.000Z",
  "appType": "jira",
  "description": "Exported Configuration",
  "baseUrls": [...],
  "issueTypes": [...],
  "fieldDefinitions": [...],
  "presets": [...]
}
```

---

## Troubleshooting

### Fields Don't Appear in Dropdown

**Possible Causes:**
1.  **Wrong App Type**: Check that you're in the correct mode (Jira vs ServiceNow)
2.  **Wrong Base URL**: Field might be associated with a different base URL
3.  **Wrong Issue Type**: Field might be specific to a different issue type
4.  **Field Ignored**: Field might be marked as ignored in Field Manager

**Solution:**
- Switch to correct app type
- Change base URL or issue type selection
- Open Field Manager → Check field associations
- Look for "Filter by Issue Type" checkbox in Field Manager

### Field Optimizer Shows "No duplicates found"

**Possible Causes:**
1.  **Fields Already Optimized**: Duplicates were already merged
2.  **Unique Fields**: Each field has unique issue type combinations
3.  **Wrong App Type**: Optimizer only shows duplicates for current app type

**Solution:**
- This is normal if fields are already optimized
- Import multiple JSON files to create duplicates
- Switch app types to see duplicates for that app

### "414 Request-URI Too Large" Error

**Cause:** Generated URL exceeds ServiceNow's length limit

**Solution:**
- Reduce description field length
- Remove unnecessary formatting
- Split content across multiple fields
- Tool shows warning at 8,200 characters

### Import Preview Shows 0 Fields

**Possible Causes:**
1.  **Wrong App Type**: Importing Jira JSON while in ServiceNow mode (or vice versa)
2.  **Empty JSON File**: File has no field definitions
3.  **Corrupted File**: JSON file is malformed

**Solution:**
- Check app type matches JSON file (`"appType": "jira"` or `"servicenow"`)
- Switch to correct app type before importing
- Verify JSON file is valid

### Labels Still Show "Required" or "Mandatory"

**Cause:** Using old bookmarklet (pre-v0.12.4)

**Solution:**
- Regenerate the Field Extractor bookmarklet
- Drag the NEW bookmarklet to your bookmarks bar
- Re-run extraction on your forms
- The v0.12.4 bookmarklet correctly removes these words from labels

### Jira Fields Appear When in ServiceNow Mode

**Cause:** This was a bug in versions before v0.12.3

**Solution:**
- Ensure you're using v0.12.3 or later
- Select a ServiceNow base URL and issue type
- Field dropdowns should automatically clear and show only ServiceNow fields
- If problem persists, refresh the page

### Field Optimizer Merges Jira and ServiceNow Fields Together

**Cause:** This was a bug in versions before v0.12.3

**Solution:**
- Ensure you're using v0.12.3 or later
- Field Optimizer now groups by `id|baseUrlId|appType`
- Jira and ServiceNow fields are NEVER merged together
- Each app type maintains separate duplicate groups

---

## Version History

### v0.12.4 (Current)
- ✅ Fixed regex escaping bug in label cleaning for both Jira and ServiceNow
- ✅ "Required" and "Mandatory" now properly removed from field labels

### v0.12.3
- ✅ Added cross-app field isolation in Field Optimizer
- ✅ Fixed field reset when switching between Jira and ServiceNow
- ✅ Added ServiceNow `aria-labelledby` support for label detection

### v0.12.2
- ✅ Fixed multi-file import bugs
- ✅ Fixed field storage key issues
- ✅ Fixed app type switching timing

### v0.12.0-v0.12.1
- ✅ Added multi-file import feature
- ✅ Fixed field deduplication logic
- ✅ Enhanced Field Optimizer

### Earlier Versions
- Field Extractor bookmarklet
- Configuration presets
- Export/Import functionality
- Rich text editor support

---

## Tips & Best Practices

### Workflow Recommendations

1.  **Start Fresh**:
    - Choose app type (Jira or ServiceNow)
    - Set up base URLs and issue types first
    - Then import or extract field definitions

2.  **Use Field Extractor**:
    - Run on each issue type form to get all fields
    - Download each JSON file
    - Use Multi-File Import to consolidate

3.  **Optimize After Import**:
    - Open Field Optimizer after importing multiple files
    - Merge common fields (Summary, Description) to Global
    - Keep issue-specific fields as Multi-Type

4.  **Save Presets**:
    - Create presets for common scenarios
    - Lock base URL and issue type for consistency
    - Share preset-included exports with team

5.  **Export Regularly**:
    - Export your configuration after major changes
    - Keep backup copies
    - Share with new team members

### Field Organization

*   **Global Fields**: Summary, Description, Priority, Assignee
*   **Issue-Specific**: Story Points (Stories only), Bug Severity (Bugs only)
*   **Custom Fields**: Use clear, descriptive labels
*   **Required Fields**: Mark appropriately so they show ⚠️ indicator

### Team Collaboration

1.  **Admin Creates Master Config**:
    - Set up all base URLs
    - Extract all fields from all issue types
    - Optimize duplicates
    - Create useful presets

2.  **Export and Share**:
    - Export complete configuration
    - Share JSON file via email/Slack/SharePoint

3.  **Team Members Import**:
    - Download the HTML file
    - Import the JSON configuration
    - Start creating pre-filled links immediately

4.  **Updates**:
    - When fields change, re-extract and export
    - Share updated JSON file
    - Team re-imports (merges with existing)

---

## Advanced Features

### Auto-Populate Required Fields

When you select an issue type, the tool can automatically add required fields to your form:

*   Fields marked with ⚠️ are detected as required
*   These come from the Field Extractor's analysis
*   Helps ensure you don't forget mandatory fields

### Filter Fields by Issue Type

In Field Manager, enable **"Filter by Issue Type"** to:
- See only fields for selected issue type
- Identify issue-specific vs. global fields
- Clean up unused fields per issue type

### Rich Text Formatting

The text editor supports:
- **Bold** and *Italic*
- Bullet lists
- Numbered lists
- Links
- Code blocks

These are converted to appropriate format for Jira/ServiceNow.

### URL Character Counter

For ServiceNow, the tool shows:
- Current URL length
- Warning when approaching limit (8,200 characters)
- Prevents "414 Too Large" errors before you generate the link

---

## Support & Resources

*   **GitHub Issues**: [Report bugs or request features](https://github.com/mikejsmith1985/jira-html-parser/issues)
*   **Releases**: [Download latest version](https://github.com/mikejsmith1985/jira-html-parser/releases)
*   **Documentation**: README.md and release notes in repository

---

## Keyboard Shortcuts

*   **Ctrl+Enter** (in text fields): Generate link
*   **Ctrl+C**: Copy generated URL (when output is focused)
*   **Esc**: Close modals

---

## Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

Requires modern browser with:
- localStorage support
- JavaScript enabled
- Clipboard API (for copy functionality)

---

*Last Updated: v0.12.4 - January 28, 2026*
