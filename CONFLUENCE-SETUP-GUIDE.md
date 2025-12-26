# Confluence Setup Guide - JIRA Issue Link Generator

## Complete Setup for Confluence

This guide walks you through setting up the JIRA Issue Link Generator on a Confluence page with centralized configuration management.

## Step 1: Build Your Configuration (One Time)

### 1.1 Create Configuration Locally
```
1. Download jira-link-generator.html
2. Open in your web browser
3. Click "Manage Presets" or "Manage Fields" in a field row
4. Add all custom fields you need:
   - Field ID (e.g., customfield_10001)
   - Field Label (e.g., Story Points)
   - Field Type (Text or Combobox)
   - For Combobox: Add options (label → value pairs)
```

### 1.2 Add Dropdown Values
```
1. Click "Manage" buttons for:
   - Base URL: Add your JIRA servers (https://jira.company.com)
   - Project ID: Add your projects (PROJ, INFRA, etc.)
   - Issue Type ID: Add your issue types (10001, 10002, etc.)

2. Each item needs:
   - ID/Value: The actual JIRA ID
   - Label: User-friendly name (what users see)
```

### 1.3 Export Configuration
```
1. Click the green "Export Config" button
2. A file jira-config-YYYY-MM-DD.json downloads
3. Rename it to something permanent: jira-config.json
4. Keep this file safe - it's your master configuration
```

## Step 2: Create Confluence Page

### 2.1 Create New Page
```
Confluence Dashboard
  → Create → Page

Title: "JIRA Issue Link Generator"
Location: Your team or project space
```

### 2.2 Page Content Example

```markdown
# JIRA Issue Link Generator

This tool generates pre-filled JIRA issue creation links with all your 
team's standard fields and configurations.

## Getting Started

### Option A: Auto-Loading (Recommended)

Click the link below to open the tool with your team configuration 
pre-loaded:

[Open JIRA Link Generator with Configuration](jira-link-generator.html?config=...)

*Note: Configuration auto-loads on first visit*

### Option B: Manual Setup

1. [Download jira-link-generator.html](jira-link-generator.html)
2. [Download jira-config.json](jira-config.json)
3. Open the HTML file in your browser
4. Click "Import Config" button
5. Select the JSON file you downloaded
6. Done! All fields and dropdowns are configured

## Available Fields

### Standard Fields
- **Summary**: Issue title
- **Description**: Issue description with formatting

### Custom Fields

#### Story Points Selection
- Type: Combobox (Dropdown)
- Options: 0, 1, 2, 3, 5, 8, 13, 21

#### Priority
- Type: Combobox (Dropdown)
- Options: High, Medium, Low

#### Team
- Type: Text
- Enter team name or identifier

## Supported JIRA Servers

| Server | URL |
|--------|-----|
| Production | https://jira.company.com |
| Staging | https://jira-staging.company.com |

## Supported Projects

| Project | ID |
|---------|-----|
| Main Project | PROJ |
| Infrastructure | INFRA |
| Platform | PLAT |

## Usage Example

1. Open the tool (auto-loaded or manually configured)
2. Fill in Base URL, Project ID, Issue Type
3. Add field values (use dropdowns for preconfigured fields)
4. Click "Generate Link"
5. Copy the URL
6. Paste in your browser to create pre-filled JIRA issue

## Quick Tips

✅ **Dropdowns prevent typos**: Use Story Points, Priority dropdowns instead of typing
✅ **Rich formatting**: Use Bold, Italic, Lists in Description
✅ **Save presets**: Save your common combinations as presets
✅ **No account needed**: Tool works entirely in your browser
✅ **Offline capable**: Works without internet after first load

## Admin/Updates

### Updating Configuration

If you need to add/remove fields or update dropdowns:

1. [Download the latest jira-config.json from below](#attachments)
2. Open jira-link-generator.html locally
3. Click "Import Config" → select the JSON file
4. Make your changes
5. Click "Export Config" to download updated file
6. Attach updated file to this page
7. Update the ?config= link above

### Files Attached to This Page

- `jira-link-generator.html` - The application
- `jira-config.json` - The configuration

## Troubleshooting

**Q: Configuration not loading?**
A: Try manually importing the JSON file instead using "Import Config" button

**Q: Missing fields or dropdowns?**
A: Re-download and import the latest jira-config.json file

**Q: Want to add a new field?**
A: Admin should update the configuration and re-upload jira-config.json

## Contact

For issues or feature requests, contact the Platform team.
```

### 2.3 Upload Files

```
1. Click "⋮" (More) → Attachments
2. Upload jira-link-generator.html
3. Upload jira-config.json
4. Click "Link" for each file to get the download URL
```

## Step 3: Create Auto-Loading Link

### Option A: If Using File Attachments

```
Use Confluence's attachment URL pattern:

https://confluence.company.com/download/attachments/12345678/jira-config.json

Full link to HTML:
file:///path/to/jira-link-generator.html?config=https://confluence.company.com/download/attachments/12345678/jira-config.json

Or if HTML is also attached:
jira-link-generator.html?config=https://confluence.company.com/download/attachments/12345678/jira-config.json
```

### Option B: Using GitHub (Better for Version Control)

```
1. Create GitHub repo: your-org/jira-configs
2. Commit jira-config.json
3. Get raw URL:
   https://raw.githubusercontent.com/your-org/jira-configs/main/jira-config.json

4. Full link:
   file:///path/to/jira-link-generator.html?config=https://raw.githubusercontent.com/your-org/jira-configs/main/jira-config.json
```

## Step 4: Update Confluence Page with Link

Edit your Confluence page and add:

```markdown
### Quick Start - Auto-Loading

[Open JIRA Link Generator with Auto-Loaded Configuration](jira-link-generator.html?config=https://confluence.company.com/download/attachments/123456/jira-config.json)

Click above to open with all fields and dropdowns pre-configured.
```

## Maintenance & Updates

### When to Update Configuration

- ✅ New JIRA server added
- ✅ New project created
- ✅ New issue type added
- ✅ New custom field needed
- ✅ Field options changed

### Update Process

1. Download current jira-config.json from Confluence
2. Open jira-link-generator.html locally
3. Click "Import Config" → select the JSON
4. Make changes (add fields, update dropdowns)
5. Click "Export Config" → download new JSON
6. Replace old jira-config.json on Confluence
7. No code changes needed!

## Advanced: Version Control on GitHub

For better management:

```bash
# Create repo
git init jira-configs
git remote add origin https://github.com/your-org/jira-configs.git

# Add config
git add jira-config.json
git commit -m "Initial JIRA config"
git push origin main

# Update in future
# Download, modify, export, commit, push
```

Then users can always get the latest:
```
https://raw.githubusercontent.com/your-org/jira-configs/main/jira-config.json
```

## Security Notes

✅ **Safe to Share**:
- Configuration is just field/dropdown definitions
- No passwords, API keys, or sensitive data
- Users can see it in the JSON file

✅ **No Backend Needed**:
- Everything runs in browser
- No server required
- Data stays on user's computer

## Troubleshooting Confluence Setup

### "Configuration not loading" error
**Cause**: CORS issue or invalid URL

**Solution**:
1. Check URL is accessible in browser
2. If not, use manual import method instead
3. Ask admin to enable CORS if needed

### Files not appearing
**Cause**: Not attached to page

**Solution**:
1. Click "Attachments" section
2. Upload both files
3. Click "Link" to get download URLs

### Link in Confluence not working
**Cause**: Wrong path or missing parameters

**Solution**:
1. Copy full URL with ?config= parameter
2. Test URL in browser first
3. Use full path (https://...) not relative path

## Summary

| Step | What to Do |
|------|-----------|
| 1 | Build config locally |
| 2 | Export to jira-config.json |
| 3 | Create Confluence page |
| 4 | Upload HTML and JSON files |
| 5 | Create auto-loading link |
| 6 | Share with team |
| 7 | Update when needed |

---

**Result**: Team-wide JIRA link generator with centralized, maintainable configuration.

No API. No backend. Just share the link!

