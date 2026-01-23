# Release v0.4.0 Summary

## 🎉 Release Information
- **Version**: v0.4.0
- **Date**: December 26, 2024
- **Type**: Minor Release (New Features)
- **Commit**: ece3046

## 🚀 Major Feature: Field Type System

### What's New
Added a comprehensive field type system that allows fields to be configured as either "text" (rich text editor) or "combobox" (dropdown with predefined options).

### Key Features

#### 1. **Field Type Selection**
- Choose between "Text" or "Combobox" when creating/editing fields
- Located in the Manage Fields modal

#### 2. **Text Fields** (Default)
- Rich text editor with full formatting toolbar
- Formatting options: Bold, Italic, Underline, Strikethrough, Bullet List, Numbered List, Clear Formatting
- Toolbar now visible above the editor
- Editor width adjusted to match toolbar width

#### 3. **Combobox Fields** (NEW!)
- Dropdown with predefined options
- Each option has:
  - **Label**: User-friendly text displayed to users
  - **Value**: The actual ID/value sent to JIRA
- Perfect for fields with fixed values (Story Points, Priority, etc.)
- Prevents typos and ensures correct JIRA IDs

#### 4. **Options Management UI**
- Add options with label and value inputs
- Visual list of all options with delete capability
- Options stored with field definition
- Persistent across sessions

### Example Use Case
```
Field: "Story Points Selection"
Type: Combobox
Options:
  - Label: "0 Points" → Value: "104111"
  - Label: "1 Point"  → Value: "54505"
  - Label: "2 Points" → Value: "54506"

User sees: "1 Point"
JIRA receives: "54505"
```

### Technical Details
- Field types and options stored in localStorage
- Backward compatible: existing fields default to "text" type
- Dynamic rendering based on field type
- Comprehensive test suite with 5 passing tests

## 📦 Installation
1. Download `jira-link-generator.html` from the release
2. Open in any modern web browser
3. No installation or server required

## 🔗 Links
- **Release**: https://github.com/mikejsmith1985/jira-html-parser/releases/tag/v0.4.0
- **Documentation**: [FIELD-TYPE-IMPLEMENTATION.md](FIELD-TYPE-IMPLEMENTATION.md)
- **Repository**: https://github.com/mikejsmith1985/jira-html-parser

## ✅ Testing
All tests passing:
- ✅ Add combobox field with options
- ✅ Add text field with rich editor
- ✅ Persist field definitions with types
- ✅ Edit combobox field and update options
- ✅ Default to text type for existing fields

## 🔄 Upgrade Notes
- No breaking changes
- Existing field definitions will work as before
- New features are opt-in
- All existing functionality preserved

## 👏 Credits
Developed with GitHub Copilot CLI

---

**Download**: [jira-link-generator.html](https://github.com/mikejsmith1985/jira-html-parser/releases/download/v0.4.0/jira-link-generator.html)
