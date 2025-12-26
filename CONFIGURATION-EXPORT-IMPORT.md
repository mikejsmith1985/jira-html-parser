# Configuration Export/Import & URL Loading

## Overview

The JIRA Issue Link Generator now supports exporting and importing configurations, as well as loading configurations directly from URLs. This enables:

1. **Centralized Configuration Management**: Build once, share with everyone
2. **No API Required**: Configuration hosted on Confluence, GitHub, or any static file server
3. **Auto-Loading**: Users can launch with pre-configured settings via URL parameter
4. **Team Distribution**: Export configuration as JSON and share via Confluence

## Features

### 1. Export Configuration
Export all your configurations to a JSON file:
- **What's exported**:
  - Custom field definitions (with types and combobox options)
  - Configuration items (Base URL, Project ID, Issue Type ID labels)
  - Saved dropdown values (Base URLs, Project IDs, Issue Type IDs)
- **When to use**: After building all your fields and dropdowns
- **How to use**: Click "Export Config" button → downloads `jira-config-YYYY-MM-DD.json`

### 2. Import Configuration
Import a previously exported JSON file:
- **What's imported**:
  - All custom fields
  - All dropdown values
  - All configuration items
  - Field types and combobox options
- **When to use**: Users receive the exported JSON file
- **How to use**: Click "Import Config" button → select JSON file → auto-reloads with new config

### 3. Load Configuration from URL
Auto-load configuration from a URL without user action:
- **What's supported**:
  - Any publicly accessible JSON file (Confluence, GitHub, S3, etc.)
  - CORS-enabled endpoints
- **When to use**: Create a link that pre-configures the app for users
- **How to use**: Share a link with `?config=<url>` parameter

## Usage Scenarios

### Scenario 1: Building Configuration in Your System

1. Open `jira-link-generator.html`
2. Add all custom fields (text, combobox, etc.)
3. Add all dropdown values (Base URLs, Project IDs, Issue Type IDs)
4. Click **"Export Config"**
5. Save the JSON file alongside the HTML on Confluence/GitHub

### Scenario 2: Users Importing Configuration

1. User downloads the HTML file from Confluence
2. User downloads the JSON config file from the same location
3. Open the HTML file
4. Click **"Import Config"**
5. Select the JSON file
6. Application reloads with all your configurations
7. Ready to use!

### Scenario 3: Auto-Loading Configuration from Confluence

**Best approach for maximum user experience:**

1. Host the configuration JSON on Confluence (upload as attachment)
2. Create a link to the HTML with the config URL parameter:
   ```
   file:///path/to/jira-link-generator.html?config=https://confluence.company.com/download/attachments/123456/jira-config.json
   ```
   
   Or use a raw GitHub link:
   ```
   file:///path/to/jira-link-generator.html?config=https://raw.githubusercontent.com/yourorg/jira-configs/main/jira-config.json
   ```

3. Share this link with users
4. When users open the link, configuration auto-loads
5. Users can immediately start creating issue links

## Configuration JSON Structure

Example exported configuration:

```json
{
  "version": "0.4.0",
  "exportedAt": "2025-12-26T18:30:00.000Z",
  "description": "JIRA Issue Link Generator Configuration",
  "configItems": [
    {
      "id": "baseUrl",
      "label": "Production Server",
      "category": "config"
    }
  ],
  "fieldDefinitions": [
    {
      "id": "customfield_10001",
      "label": "Story Points",
      "category": "custom",
      "fieldType": "combobox",
      "options": [
        {"label": "0 Points", "value": "104111"},
        {"label": "1 Point", "value": "54505"}
      ]
    }
  ],
  "baseUrls": [
    {
      "id": "url_1",
      "url": "https://jira.company.com",
      "label": "Production"
    }
  ],
  "projectIds": [
    {
      "id": "proj_1",
      "projectId": "PROJ",
      "label": "Main Project"
    }
  ],
  "issueTypeIds": [
    {
      "id": "issue_1",
      "issueTypeId": "10001",
      "label": "Story"
    }
  ]
}
```

## Setup Instructions for Confluence

### Step 1: Build Configuration
1. Open `jira-link-generator.html` locally
2. Add all custom fields with correct types and options
3. Add all dropdown values (URLs, projects, issue types)
4. Test everything works
5. Click "Export Config" → save as `jira-config.json`

### Step 2: Host on Confluence

1. Create a Confluence page: "JIRA Issue Link Generator"
2. Upload `jira-link-generator.html` as an attachment
3. Upload `jira-config.json` as an attachment
4. Note the download URLs for both files

### Step 3: Create User Instructions

**Option A: Manual Import (Easiest)**
```
1. Download jira-link-generator.html from this page
2. Download jira-config.json from this page
3. Open the HTML file in your browser
4. Click "Import Config"
5. Select the JSON file
6. Start creating issue links!
```

**Option B: Auto-Loading (Best UX)**
```
Right-click this link and save target as jira-link-generator.html:
[Link to HTML file with ?config= parameter]

Or open directly in browser:
[Link to HTML file with ?config= parameter]
```

## Updating Configuration

When you need to update the configuration:

1. Open `jira-link-generator.html` locally
2. Import the previous `jira-config.json` (preserves all your work)
3. Make changes (add/remove fields, update dropdowns)
4. Export the new configuration
5. Update the JSON file on Confluence
6. Users will auto-load the new config on next app launch

## Security Considerations

✅ **Safe to Share**:
- Configurations are JSON files containing only field/dropdown definitions
- No sensitive data like passwords or API keys
- No personal information

⚠️ **CORS Notes**:
- Configuration URL must be CORS-enabled for auto-loading to work
- Confluence and GitHub both support CORS by default
- If CORS fails, users can manually import the JSON file

## Troubleshooting

### Import fails with "Invalid configuration"
- Ensure the JSON file was exported from this app
- Check that `"version"` field exists in JSON
- Try exporting and re-importing locally first

### Auto-loading doesn't work (?config parameter)
- Check the URL is publicly accessible
- Ensure CORS headers are present
- Try the import method instead
- Check browser console (F12) for error messages

### Missing fields after import
- Ensure the JSON file is complete
- Re-export and check all fields are present
- Import again from the correct JSON file

## Advanced: Hosting on GitHub

For even better version control:

1. Create a GitHub repository: `jira-configs`
2. Commit `jira-config.json`
3. Use raw GitHub URL for auto-loading:
   ```
   https://raw.githubusercontent.com/yourorg/jira-configs/main/jira-config.json
   ```
4. Users can always get the latest config
5. You can version control all changes

## FAQ

**Q: Can I share the configuration with team members?**
A: Yes! Export the JSON file and share it via Confluence, email, or GitHub.

**Q: What happens if I import a configuration?**
A: All existing custom fields and dropdowns are replaced with the imported configuration. Local presets are not affected.

**Q: Can I undo an import?**
A: Browser back button won't help, but you can import a previous configuration file if you saved it.

**Q: Does this require an API or backend?**
A: No! Configuration can be hosted anywhere - Confluence, GitHub, S3, or as a local file.

**Q: Can users modify the imported configuration?**
A: Yes! Once imported, users can add more fields, modify dropdowns, or save presets as usual.

**Q: Is there a file size limit?**
A: The JSON file size is limited by browser localStorage (typically 5-10MB), but realistic configs are under 1MB.

## Examples

### Example Confluence Page Setup

```
Page Title: JIRA Issue Link Generator

Content:
----

h1. Quick Start

1. [Download jira-link-generator.html|^jira-link-generator.html]
2. [Download jira-config.json|^jira-config.json]
3. Open the HTML file
4. Click "Import Config"
5. Select the JSON file
6. Start creating issue links!

Or use auto-loading:
[Open with Configuration|jira-link-generator.html?config=...]

h2. Available Fields

* Summary (text)
* Description (text with formatting)
* Story Points (combobox: 0-13)
* Priority (combobox: High/Medium/Low)
* Custom Field 1 (text)

h2. Supported Servers

* Production (https://jira.company.com)
* Staging (https://jira-staging.company.com)

h2. Support

Email the platform team for updates or questions.
```

---

**Version**: 0.4.0+  
**Last Updated**: December 26, 2025  
**No API Required** ✓  
**CORS-friendly** ✓
