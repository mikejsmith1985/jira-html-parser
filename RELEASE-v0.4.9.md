# Release v0.4.9

## 🐛 Bug Fixes

### Configuration Import
- Fixed an issue where imported configurations (Base URLs, Project IDs, Issue Types) were not being correctly loaded into the application due to storage key mismatches.
- Updated import logic to use consistent storage keys (`jiraSavedBaseUrls`, `jiraSavedProjectIds`, `jiraSavedIssueTypes`).

### Rich Text Formatting
- Fixed an issue where list items and lines in the rich text editor were concatenated without newlines in the generated Jira link description.
- Improved `htmlToJiraMarkup` conversion to forcefully insert newlines around block elements (`div`, `p`, `ul`, `ol`, `li`), ensuring proper separation of content.

## 💅 Improvements

### UI/UX
- **Sorted Dropdowns**: All dropdown menus (Field Selection, Base URL, Project ID, Issue Type ID) are now automatically sorted alphabetically for better usability.
  - Field selection sorted by label.
  - Configuration items sorted by alias.

## 🧪 Testing
- Added regression tests for config import/export.
- Added verification tests for dropdown sorting.
- Added reproduction and fix verification tests for rich text formatting.
