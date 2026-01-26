# Link Generator

A powerful, client-side tool suite for generating pre-filled issue creation links for **Jira** and **ServiceNow** with custom fields, rich text formatting, and configuration management.

## Available Tools

| File | Description |
|------|-------------|
| **`link-generator.html`** | **🆕 Unified Link Generator** - Single tool for both Jira and ServiceNow with app type selector |
| `jira-link-generator.html` | Jira-specific link generator (legacy) |
| `servicenow-link-generator.html` | ServiceNow-specific link generator (legacy) |

> **Recommended**: Use `link-generator.html` for the best experience. It combines both tools with automatic app type detection and unified configuration.

## Features

✨ **Core Features**
- Generate pre-filled issue links for Jira and ServiceNow
- Base URL, Project ID (Jira), and Issue Type management
- Custom field definitions and persistence
- Configuration presets for quick setup
- Fully customizable configuration item labels
- **Field Extractor**: Extract fields from live pages with base URL and issue type auto-detection

📝 **Flexible Field Types** (v0.4.0+)
- **Text Fields**: Rich text editing with full formatting toolbar (bold, italic, underline, strikethrough, lists)
- **Combobox Fields**: Dropdown with label/value pairs for predefined options
- Configure field type when creating custom fields
- Options management UI for combobox fields
- Perfect for fields with fixed values (Story Points, Priority, etc.)

🔄 **Configuration Export/Import** (v0.4.0+)
- **Export Config**: Download all fields, types, and dropdown values as JSON
- **Import Config**: Upload JSON file to instantly configure the app
- **Auto-Load**: Use URL parameter `?config=<url>` to pre-configure automatically
- **No API Required**: Works with Confluence, GitHub, S3, or any static file host
- **Team Distribution**: Share single configuration file with entire team
- **Easy Updates**: Modify config once, distribute to all users

🎯 **Configuration Items Management** (v0.3.0+)
- Edit labels for Base URL, Project ID, and Issue Type ID
- Delete and restore configuration items
- Full management UI matching custom field interface
- Integration with preset system

💾 **Data Persistence**
- All settings stored in browser localStorage
- No server required
- No data sent to external services
- Presets for team sharing

🚀 **No Installation Required**
- Single HTML file - just open in your browser
- Works offline
- Compatible with all modern browsers

## Quick Start

### Usage

1. **Open the application**
   ```
   Open link-generator.html in your web browser
   ```

2. **Select your app type** (Jira or ServiceNow)
   - Click the Jira or ServiceNow button at the top
   - The UI adapts automatically based on your selection

3. **Fill in configuration**
   - **Base URL**: Your server URL (e.g., https://jira.example.com or https://instance.service-now.com)
   - **Project ID** (Jira only): Target project (e.g., 10001)
   - **Issue Type**: Type of issue (e.g., Bug, incident, change_request)

3. **Add fields**
   - Click "+ Add Field" to add custom fields
   - Select field from dropdown or manage fields to add new ones
   - Enter field values with optional formatting

4. **Generate link**
   - Click "Generate Link"
   - Copy the generated URL
   - Paste in browser to create pre-filled Jira issue

### Manage Custom Fields

Click "Manage Fields" button to access:

**Configuration Items Section**
- Edit labels (e.g., "Base URL" → "Production Jira URL")
- Delete items (defaults restore on reload)
- All changes persist in localStorage

**Custom Fields Section**
- Add/edit/delete custom field definitions
- Choose field type: Text or Combobox
  - **Text**: Rich text editor with formatting toolbar
  - **Combobox**: Dropdown with label/value pairs
- Field IDs and labels customizable
- Shared with preset system

#### Creating a Text Field
1. Click "Manage Fields"
2. Enter Field ID (e.g., `custom_field_123`)
3. Enter Field Label (e.g., `Description`)
4. Select Field Type: **Text (Rich Editor)**
5. Click "Add"

#### Creating a Combobox Field
1. Click "Manage Fields"
2. Enter Field ID (e.g., `customfield_10001`)
3. Enter Field Label (e.g., `Story Points`)
4. Select Field Type: **Combobox (Dropdown)**
5. Add options:
   - Enter Label (user-friendly text, e.g., "High")
   - Enter Value (JIRA ID, e.g., "1")
   - Click "Add Option"
6. Repeat for all options needed
7. Click "Add" to save field

#### Using a Combobox Field
When you select a combobox field in a field row:
- A dropdown appears with your options
- User sees the friendly label (e.g., "High")
- JIRA receives the actual value (e.g., "1")
- No typos - only valid options available

### Example: Story Points Combobox
```
Field ID: customfield_10001
Field Label: Story Points Selection
Type: Combobox

Options:
  Label: "0 Points"  → Value: "104111"
  Label: "1 Point"   → Value: "54505"
  Label: "2 Points"  → Value: "54506"
  Label: "3 Points"  → Value: "54507"
  Label: "5 Points"  → Value: "54508"
```

When generating a link, if user selects "3 Points", 
JIRA receives: `customfield_10001=54507`

### Configuration Export/Import

#### Export Your Configuration

1. Build your custom fields and dropdown values in the app
2. Click the green **"Export Config"** button
3. A JSON file downloads: `jira-config-YYYY-MM-DD.json`
4. Share this file with your team or attach to Confluence

**What's exported**:
- Custom field definitions (with types and combobox options)
- Configuration item labels
- Base URLs, Project IDs, and Issue Type ID values

#### Import Configuration

**Option A: Manual Import**
1. Click the orange **"Import Config"** button
2. Select a previously exported JSON file
3. Application reloads with all configurations loaded
4. Ready to use!

**Option B: Auto-Load from URL**
Add a query parameter to the HTML link:
```
jira-link-generator.html?config=https://confluence.example.com/download/attachments/123456/jira-config.json
```

Users click the link → Configuration auto-loads → No setup needed

#### Team Setup on Confluence

1. Create Confluence page: "JIRA Issue Link Generator"
2. Upload both `jira-link-generator.html` and `jira-config.json`
3. Create link with auto-load parameter:
   ```
   [Open JIRA Link Generator](jira-link-generator.html?config=https://confluence.../jira-config.json)
   ```
4. Share with team → Configuration auto-loads when users open the link

#### Updating Configuration

When you need to add fields or update dropdown values:
1. Download current `jira-config.json` from Confluence
2. Open `jira-link-generator.html`
3. Click "Import Config" and select the file
4. Make your changes
5. Click "Export Config" to download the updated file
6. Replace the file on Confluence
7. Users auto-load the new configuration on next visit

### Save Presets

1. Fill in form with your desired values
2. Click "Save as Preset"
3. Enter preset name
4. Optionally lock Base URL, Project ID, or Issue Type ID
5. Load preset anytime from dropdown

## Configuration Items Management

### Edit a Label

1. Click "Manage Fields" in any field row
2. Find item in "Configuration Items" section
3. Click "Edit"
4. Change label text
5. Click "Update"

Example: Change "Base URL" to "Primary Jira Server"

### Delete an Item

1. Click "Delete" next to item
2. Confirm deletion
3. Item is removed from list
4. Reload page to restore defaults

### Add to Presets

When saving a preset, you can lock configuration values:
- ☑ Lock Base URL to: https://jira.example.com
- ☑ Lock Project ID to: 12345
- ☐ Lock Issue Type to: (unchecked)

Load preset later to auto-populate locked values.

## Test Suite

Run comprehensive tests:

```bash
# Run all tests
npm test

# Run field type tests
npm run test:field-types

# Run specific test suite
npm run test:config      # Config items tests
npm run test:integration # Integration tests
npm run test:workflows   # End-to-end workflows
npm run test:validate    # HTML structure validation
```

**Test Coverage: 71 tests, 100% passing**
- 5 field type tests (combobox, text, options, persistence)
- 66 configuration and integration tests
- Full coverage of new features

## Documentation

- **[EXPORT-IMPORT-QUICK-START.md](EXPORT-IMPORT-QUICK-START.md)** - Quick start guide for export/import (v0.4.0+)
- **[CONFLUENCE-SETUP-GUIDE.md](CONFLUENCE-SETUP-GUIDE.md)** - Step-by-step Confluence integration guide (v0.4.0+)
- **[CONFIGURATION-EXPORT-IMPORT.md](CONFIGURATION-EXPORT-IMPORT.md)** - Technical documentation for export/import (v0.4.0+)
- **[EXPORT-IMPORT-IMPLEMENTATION.md](EXPORT-IMPORT-IMPLEMENTATION.md)** - Complete implementation details (v0.4.0+)
- **[FIELD-TYPE-IMPLEMENTATION.md](FIELD-TYPE-IMPLEMENTATION.md)** - Field type system technical details (v0.4.0)
- **[RELEASE-v0.4.0.md](RELEASE-v0.4.0.md)** - Latest release notes
- **[CONFIG_ITEMS_USAGE_GUIDE.md](CONFIG_ITEMS_USAGE_GUIDE.md)** - Detailed user guide with examples
- **[CONFIG_ITEMS_ENHANCEMENT.md](CONFIG_ITEMS_ENHANCEMENT.md)** - Technical implementation details
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick start guide
- **[VISUAL_GUIDE.md](VISUAL_GUIDE.md)** - UI/UX walkthrough
- **[DELIVERABLES.md](DELIVERABLES.md)** - Complete feature summary

## Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✓ Full |
| Firefox | 88+ | ✓ Full |
| Safari | 14+ | ✓ Full |
| Edge | 90+ | ✓ Full |
| Opera | 76+ | ✓ Full |

## Version History

### v0.4.0 (Current)
- ✨ **Field Type System**
  - Text fields with rich text editor and formatting toolbar
  - Combobox fields with label/value pairs for JIRA IDs
  - Options management UI for combobox configuration
  - Dynamic rendering based on field type
- 🔄 **Configuration Export/Import**
  - One-click export of all configurations to JSON
  - One-click import to load configurations from JSON
  - URL parameter support for auto-loading (`?config=<url>`)
  - No API required - works with Confluence, GitHub, S3, etc.
  - Perfect for team distribution and centralized configuration
  - CORS-compatible with graceful fallback
- 📊 5 new comprehensive tests for field types (100% passing)
- 📖 4 new comprehensive guides for export/import
- 🎨 Improved formatting toolbar visibility and sizing

### v0.3.0
- ✨ Configuration Items Management
  - Full management UI for Base URL, Project ID, Issue Type ID
  - Edit labels, delete/restore items
  - Integrated with presets
- 📊 66 comprehensive tests (100% passing)
- 📖 Enhanced documentation
- 🔄 Automatic GitHub Actions release workflow
- 🔍 HTML validation

### v0.2.x
- Field definitions persistence
- Custom field management
- Preset system
- Rich text editing

### v0.1.x
- Initial release
- Basic link generation

## Architecture

### Core Components

**Persistence Layer**
- `loadConfigurationItems()` - Load config items
- `saveConfigurationItems()` - Persist config items
- `loadFieldDefinitions()` - Load field definitions
- `saveFieldDefinitions()` - Persist fields

**Management UI**
- `openFieldManager()` - Open modal
- `refreshConfigItemsList()` - Render config items
- `refreshFieldsList()` - Render custom fields
- `editConfigurationItem()` - Edit mode
- `deleteConfigurationItem()` - Delete item

**Presets**
- `saveCurrentAsPreset()` - Save configuration
- `loadPresetFromDropdown()` - Load saved preset
- `editConfigurationPreset()` - Modify preset

### Data Storage

All data stored in browser localStorage:
- `jiraGenState` - Current form state
- `jiraConfigItems` - Configuration items
- `jiraFieldDefinitions` - Custom field definitions
- `jiraConfigurationPresets` - Saved presets

## Security

✅ **Client-side only** - No external API calls  
✅ **XSS protection** - HTML escaping on all inputs  
✅ **No authentication** - Local browser storage only  
✅ **No sensitive data** - User controls what's stored  

## Performance

- ⚡ Single HTML file (< 100KB)
- 📴 Works offline
- 🚀 Instant loading
- 💾 Minimal localStorage usage

## Troubleshooting

### Changes not saving
1. Ensure "Close" button is clicked (not X)
2. Check browser localStorage quota
3. Try clearing localStorage and restarting

### Can't find items
1. Check localStorage via DevTools (F12)
2. Look for keys: `jiraConfigItems`, `jiraFieldDefinitions`
3. Reload page to verify defaults appear

### Preset not loading
1. Verify preset was saved (check dropdown)
2. Try editing and re-saving preset
3. Check browser console for errors (F12)

### Link generation issues
1. Verify all required fields filled
2. Check URL format is valid
3. Ensure Jira server is accessible
4. Test with simple field values first

## Contributing

### Development

1. Clone repository
2. Make changes to `jira-link-generator.html`
3. Run test suite: `npm test`
4. Commit with conventional commit message
5. Push to master branch
6. Automatic release created!

### Commit Message Format

```
feat: Add new feature           → Minor version bump
feat!: Breaking change          → Major version bump
fix: Bug fix                    → Patch version bump
chore: Non-functional change    → Patch version bump
docs: Documentation             → No version bump
test: Add tests                 → No version bump
```

## Release Process

### Automatic Releases (GitHub Actions)

On every push to master:

1. Tests run automatically
2. Version bumped based on commit type
3. `package.json` updated
4. Git tag created (e.g., v0.3.0)
5. GitHub Release created with notes
6. Release notes auto-generated

No manual steps needed!

### Version Bumping Rules

- `feat:` → Minor version (0.3.0 → 0.4.0)
- `feat!:` → Major version (0.3.0 → 1.0.0)
- `fix:`, `chore:`, other → Patch (0.3.0 → 0.3.1)

## License

MIT License - See LICENSE file for details

## Support

- 📖 Read documentation files
- 🐛 Check existing issues on GitHub
- 💬 Create new issue for bugs/features
- 📧 See CONTRIBUTING.md for guidelines

## Roadmap

Planned enhancements:
- [ ] Cloud sync across devices
- [ ] Team configuration sharing
- [ ] Admin settings for config items
- [ ] Export/import functionality
- [ ] Input validation (URL format, numeric IDs)
- [ ] Dark mode support
- [ ] Keyboard shortcuts

## Credits

Created by Mike Smith  
Contributions welcome!

---

**Status: ✓ Production Ready**  
**Last Updated**: December 26, 2025  
**Current Version**: 0.4.0
