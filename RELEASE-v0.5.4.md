# Release v0.5.4

## 🐛 Bug Fixes

### ServiceNow Generator
- **Rich Text Formatting**: Switched to a plain-text friendly formatting approach for rich text fields to ensure compatibility with ServiceNow forms.
  - Lists (bulleted and numbered) are now converted to plain text with bullet characters (`•`) and newlines, rather than HTML tags.
  - HTML tags are stripped and converted to clean plain text structure.
- **Removed Unsupported Options**: Removed Bold, Italic, Underline, and Strikethrough buttons from the formatting toolbar as these are not supported in the target ServiceNow fields.

### UI Improvements
- **Responsive Layout**: Updated the container width in both Jira and ServiceNow generators to be dynamic (`95%` width), preventing wide fields from being cut off on smaller or split screens.
