# Release v0.5.9

## 🐛 Bug Fixes

### ServiceNow Generator
- **Robust Text Formatting**: Implemented a DOM traversal-based formatter to correctly handle text layout.
  - Fixes issues where headers and paragraphs were being concatenated into single lines.
  - Ensures block elements (`div`, `p`, headers, lists) are properly separated by newlines.
  - Preserves plain text structure while removing incompatible HTML tags.

## 💅 Improvements

### UI Improvements
- **Wider Field Selection**: Increased the width of the field selection dropdown (from 150px to 250px) to better accommodate longer field names.
- **Container Sizing**: Adjusted the main container width to `90%` with a maximum of `1200px`. This provides a responsive layout that uses most of the screen while maintaining pleasant side margins ("borders") on larger displays.
