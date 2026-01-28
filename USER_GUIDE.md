# User Guide: Unified Link Generator

Create pre-filled URL links for Jira issues and ServiceNow records. This guide shows you how to use the tool effectively.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Switching Between Jira and ServiceNow](#switching-between-jira-and-servicenow)
3. [Creating Your First Link](#creating-your-first-link)
4. [Extracting Fields from Forms](#extracting-fields-from-forms)
5. [Managing Your Fields](#managing-your-fields)
6. [Optimizing Duplicate Fields](#optimizing-duplicate-fields)
7. [Importing Multiple Configurations](#importing-multiple-configurations)
8. [Using Presets](#using-presets)
9. [Sharing Configurations](#sharing-configurations)
10. [Tips & Tricks](#tips--tricks)
11. [Troubleshooting](#troubleshooting)

---

## Getting Started

### What You Need

*   The `link-generator.html` file (download from [Releases](https://github.com/mikejsmith1985/jira-html-parser/releases))
*   A modern web browser (Chrome, Edge, Firefox, or Safari)
*   Access to your Jira or ServiceNow instance

### Opening the Tool

1.  Download `link-generator.html` to your computer
2.  Double-click the file to open it in your browser
3.  That's it! The tool runs entirely in your browser - no installation needed

### Your Data is Saved Locally

Everything you configure (base URLs, fields, presets) is saved automatically in your browser's local storage. Your data stays on your computer and works offline.

---

## Switching Between Jira and ServiceNow

The tool supports both Jira and ServiceNow in a single interface.

### How to Switch

Look for the toggle button in the top-right corner:
*   **Switch to Jira**: Changes to blue theme, shows Jira-specific options
*   **Switch to ServiceNow**: Changes to purple theme, shows ServiceNow-specific options

### What Changes When You Switch

*   The color theme updates
*   Form fields change (Project ID vs Table Name)
*   Your saved fields, base URLs, and presets change to match the app type
*   Any selected fields are cleared if they don't match the new app type

**Important**: Jira and ServiceNow configurations are completely separate. Fields you save for Jira won't appear in ServiceNow mode, and vice versa.

---

## Creating Your First Link

Let's create a pre-filled Jira issue link as an example.

### Step 1: Set Up Base Configuration

1.  **Switch to Jira Mode** (if not already there)
2.  **Add a Base URL**:
    *   Click **"Manage"** next to Base URL
    *   Click **"Add Base URL"**
    *   Enter your Jira URL (e.g., `https://company.atlassian.net`)
    *   Click **"Save"**
    *   Close the modal
3.  **Add an Issue Type**:
    *   Click **"Manage"** next to Issue Type
    *   Click **"Add Issue Type"**
    *   Enter the name (e.g., "Bug") and ID (e.g., `10001`)
    *   Click **"Save"**
    *   Close the modal

### Step 2: Add Fields

1.  Select your Base URL from the dropdown
2.  Select your Issue Type from the dropdown
3.  Click **"+ Add Field"**
4.  Select "Summary" from the dropdown
5.  Enter a value like "Login button not working"
6.  Click **"+ Add Field"** again
7.  Select "Description"
8.  Enter details about the issue

### Step 3: Generate and Use the Link

1.  Click **"Generate Link"**
2.  The URL appears in the output box
3.  Click **"Copy"** to copy it to your clipboard
4.  Paste the link anywhere (email, Slack, documentation)
5.  When someone clicks the link, Jira opens with all fields pre-filled!

**ServiceNow**: Follow the same steps but select "Table Name" instead of "Issue Type" (e.g., `incident` or `change_request`).

---

## Extracting Fields from Forms

Instead of manually adding fields one by one, use the Field Extractor to automatically discover all fields on a form.

### Setting Up the Bookmarklet

1.  Click the **"🔍 Generate Field Extractor"** button
2.  A bookmarklet appears on the page
3.  Drag this button to your browser's bookmarks bar
4.  You now have a bookmarklet you can use on any Jira or ServiceNow form

### Using the Field Extractor

1.  **Navigate** to a Jira issue creation page or ServiceNow form
2.  **Click** the bookmarklet from your bookmarks bar
3.  **Wait** a moment while it scans the page
4.  **Review** the results in the popup:
    *   Number of fields found
    *   Which fields are required (marked with ⚠️)
    *   How many dropdown fields have options
5.  **Download** the JSON file by clicking "Download JSON"

### Importing Extracted Fields

1.  Return to the link generator
2.  Click **"Import Config"** (orange button)
3.  Select the JSON file you just downloaded
4.  All fields are now available in your field dropdown!

### What Gets Extracted

*   **Field IDs**: The internal system names
*   **Labels**: Clean, readable names (with "Required" and "Mandatory" removed)
*   **Required Status**: Which fields are mandatory
*   **Dropdown Options**: For combobox fields, all available choices
*   **Base URL and Issue Type**: Automatically detected

---

## Managing Your Fields

The Field Manager lets you view, add, edit, and organize your field definitions.

### Opening Field Manager

1.  Click **"Manage Fields"** (or click **"Manage Fields"** button in any field row)
2.  The Field Manager modal opens showing all your saved fields

### Viewing Fields

*   **Search**: Type in the search box to filter fields by name
*   **Filter by Issue Type**: Check the box and select an issue type to see only fields for that type
*   **Ignored Fields**: Hidden fields appear with a strikethrough

### Adding a Custom Field

1.  Click **"Add Field"**
2.  Fill in the details:
    *   **ID**: The internal field name (e.g., `customfield_10050` for Jira, `u_root_cause` for ServiceNow)
    *   **Label**: The display name (e.g., "Root Cause")
    *   **Category**: Usually "custom"
    *   **Field Type**: Choose "text" or "combobox"
    *   **Base URL**: (Optional) Link to specific base URL
    *   **Issue Type**: (Optional) Link to specific issue type
    *   **Required**: Check if this field is mandatory
3.  For **combobox** fields, add options:
    *   Click **"Add Option"**
    *   Enter label and value for each choice
4.  Click **"Save Field"**

### Editing a Field

1.  Find the field in the list
2.  Click **"Edit"**
3.  Modify any properties
4.  Click **"Update Field"**

### Hiding vs. Deleting Fields

*   **Toggle Ignored**: Hides the field from dropdowns but keeps the definition
*   **Delete**: Permanently removes the field (requires confirmation)

**Tip**: Use "Ignore" instead of "Delete" if you might need the field later.

### Finding Field IDs

**For ServiceNow:**
1.  Open a ServiceNow form
2.  Right-click on the field → "Inspect Element"
3.  Look for `id` or `name` attribute (e.g., `change_request.risk`)

**For Jira:**
1.  Open a Jira issue creation form
2.  Right-click on the field → "Inspect Element"
3.  Look for `id` attribute (e.g., `customfield_10050`)

**Easier Method**: Use the Field Extractor bookmarklet to discover all fields automatically!

---

## Optimizing Duplicate Fields

If you've imported fields from multiple issue types (Bug, Story, Task, etc.), you'll have duplicate field definitions. The Field Optimizer helps consolidate them.

### Why Optimize?

*   **Reduce Clutter**: One "Summary" field instead of seven copies
*   **Easier Management**: Edit one field instead of multiple
*   **Still Flexible**: Can keep issue-specific fields separate

### How to Optimize

1.  Open **Field Manager**
2.  Click **"Optimize Fields"**
3.  Review the duplicate groups:
    *   Fields are sorted by number of duplicates
    *   Example: "Summary appears in 7 issue types"
4.  For each field group, choose an action:
    *   **Merge to Global**: Creates one field for ALL issue types
    *   **Merge to Multi-Type**: Creates one field for SOME issue types
    *   **Skip**: Leave as-is

### When to Use Global Merge

Use for fields that appear in **all** or **most** issue types:
*   Summary
*   Description
*   Priority
*   Assignee
*   Reporter

### When to Use Multi-Type Merge

Use for fields that appear in **some** issue types:
*   Story Points (Stories and Epics only)
*   Bug Severity (Bugs only)
*   Epic Link (Stories, Tasks, Bugs - but not Epics)

### Safety Features

*   A backup is created before any merge
*   You must confirm before changes are made
*   You can see exactly how many duplicates will be removed

---

## Importing Multiple Configurations

If you've extracted fields from multiple forms (e.g., Bug, Story, Task), you can import them all at once.

### Why Use Multi-Import?

*   Import fields from 5+ issue types in one step
*   See a preview of duplicates before importing
*   Automatically merges metadata (base URLs, issue types)

### Step-by-Step

1.  **Extract fields** from each form using the Field Extractor:
    *   Bug form → Download bug-fields.json
    *   Story form → Download story-fields.json
    *   Task form → Download task-fields.json
    *   (Repeat for all issue types)

2.  **Multi-Import**:
    *   Click **"📁 Import Multiple Configurations"**
    *   Select all JSON files at once (Ctrl+Click or Shift+Click)
    *   Click "Open"

3.  **Review Preview**:
    *   Shows total fields being imported
    *   Lists fields that appear in multiple files (duplicates)
    *   Example: "Summary: Appears in 7 issue types"

4.  **Confirm Import**:
    *   Click **"Confirm Import"**
    *   All fields are saved
    *   Duplicates are preserved (each issue type gets its own copy)

5.  **Optimize** (Recommended):
    *   Open Field Manager → Click "Optimize Fields"
    *   Merge duplicates as desired

### What Gets Imported

*   All field definitions from all files
*   Base URLs from all files (merged)
*   Issue types from all files (merged)
*   Presets (if included in files)

---

## Using Presets

Presets let you save form configurations for quick reuse.

### Saving a Preset

1.  Set up your form exactly how you want it:
    *   Select base URL and issue type
    *   Add fields
    *   Fill in values
2.  Click **"Save as Preset"**
3.  Enter a name (e.g., "Standard Bug Report")
4.  Optionally add a description
5.  **Lock Options**:
    *   Check "Lock Base URL" to always use this base URL
    *   Check "Lock Issue Type" to always use this issue type
6.  Click **"Save"**

### Loading a Preset

1.  Select a preset from the **"Load Preset"** dropdown
2.  Your form instantly populates with all the saved fields and values
3.  Base URL and Issue Type are set (if locked)
4.  Make any adjustments needed
5.  Click "Generate Link"

### Managing Presets

*   Click **"Manage Presets"** to view all saved presets
*   **Edit**: Change name, description, or fields
*   **Delete**: Remove presets you no longer need
*   **Load**: Apply preset to form

### Preset Tips

*   Create presets for common scenarios (Bug Report, Feature Request, Incident)
*   Lock base URL and issue type for consistency
*   Include default values to save time
*   Share presets with your team via Export/Import

---

## Sharing Configurations

Export your complete setup (base URLs, fields, presets) to share with your team.

### Exporting

1.  Click **"Export Config"** (green button)
2.  A JSON file downloads to your computer
    *   Jira: `jira-config-2026-01-28.json`
    *   ServiceNow: `servicenow-config-2026-01-28.json`
3.  Share this file with teammates via email, Slack, or SharePoint

### Importing

1.  Click **"Import Config"** (orange button)
2.  Select the JSON file
3.  Click "Open"
4.  Your existing configuration is **merged** with the imported one:
    *   New items are added
    *   Matching items are updated
    *   Your unique items are preserved

### Team Workflow

**Admin Setup:**
1.  Extract fields from all issue types
2.  Optimize duplicates
3.  Create useful presets
4.  Export configuration
5.  Share JSON file with team

**Team Members:**
1.  Download `link-generator.html`
2.  Import the JSON configuration file
3.  Start creating pre-filled links immediately!

**Updates:**
*   When fields change, admin re-extracts and exports
*   Team members re-import (merges with existing setup)

---

## Tips & Tricks

### Workflow Best Practices

1.  **Start with Field Extraction**
    *   Use the bookmarklet on each form type
    *   Download all JSON files
    *   Multi-import everything at once

2.  **Optimize After Import**
    *   Run Field Optimizer
    *   Merge common fields to Global
    *   Keep issue-specific fields separate

3.  **Create Presets**
    *   Save presets for frequent use cases
    *   Lock base URL and issue type for consistency
    *   Share presets via export

4.  **Export Regularly**
    *   Keep backup copies of your configuration
    *   Export after major changes
    *   Share with new team members

### Field Organization

*   **Global Fields**: Summary, Description, Priority (appear everywhere)
*   **Issue-Specific**: Story Points, Bug Severity (only for certain types)
*   **Clear Labels**: Use descriptive names for custom fields
*   **Required Fields**: Mark appropriately so they show ⚠️ indicator

### Rich Text Formatting

The text editor supports:
*   **Bold** and *Italic*
*   Bullet lists and numbered lists
*   Links
*   Basic formatting

These convert to appropriate format for Jira/ServiceNow.

### Keyboard Shortcuts

*   **Ctrl+Enter**: Generate link (when focused in a field)
*   **Esc**: Close open modals

---

## Troubleshooting

### Fields Don't Appear in the Dropdown

**Check these things:**
1.  Are you in the correct mode? (Jira vs ServiceNow)
2.  Have you selected a base URL?
3.  Have you selected an issue type?
4.  Is the field associated with a different base URL or issue type?

**Try this:**
*   Switch to the correct app type (Jira or ServiceNow)
*   Change base URL or issue type selection
*   Open Field Manager → Check if field is marked as "Ignored"
*   Look at field's associations (base URL and issue type)

### Field Optimizer Shows "No Duplicates Found"

This is normal if:
*   You've already optimized your fields
*   Each field has unique issue type combinations
*   You haven't imported multiple JSON files yet

**To create duplicates for optimization:**
*   Extract fields from multiple issue types (Bug, Story, Task, etc.)
*   Import all JSON files
*   Then run Field Optimizer

### "414 Request-URI Too Large" Error

The generated URL is too long.

**Solutions:**
*   Reduce the length of description fields
*   Remove unnecessary formatting
*   Split content across multiple fields
*   Look for the character count warning (appears at 8,200 characters for ServiceNow)

### Import Shows 0 Fields

**Check:**
1.  Are you in the correct mode? (Jira JSON needs Jira mode, ServiceNow JSON needs ServiceNow mode)
2.  Is the JSON file empty or corrupted?
3.  Does the file actually contain field definitions?

**Try:**
*   Switch to the correct app type before importing
*   Open the JSON file in a text editor to verify it's valid
*   Re-download the file if it might be corrupted

### Can't Find a Field ID

**Easiest Method:**
*   Use the Field Extractor bookmarklet - it finds all field IDs automatically

**Manual Method:**
1.  Open the form in your browser
2.  Right-click on the field → "Inspect Element"
3.  Look for `id` or `name` attribute in the HTML
4.  For ServiceNow, field IDs often use `table.field` format (e.g., `change_request.risk`)
5.  For Jira, custom fields use `customfield_` prefix (e.g., `customfield_10050`)

### Jira/ServiceNow Fields Are Mixed Up

Make sure you're in the correct mode:
*   Jira mode (blue theme) for Jira fields
*   ServiceNow mode (purple theme) for ServiceNow fields

The tool keeps Jira and ServiceNow completely separate. Switching modes automatically filters fields.

---

## Getting Help

*   **Issues or Questions**: [GitHub Issues](https://github.com/mikejsmith1985/jira-html-parser/issues)
*   **Latest Version**: [Releases Page](https://github.com/mikejsmith1985/jira-html-parser/releases)
*   **Documentation**: README.md in the repository

---

*This guide covers the unified Link Generator tool for both Jira and ServiceNow.*

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
