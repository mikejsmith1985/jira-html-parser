# Release v0.5.20

## Improvements
- **Append on Import**: Importing a configuration file now **appends** to your existing settings instead of overwriting them.
    - New items (Base URLs, Fields, etc.) are added.
    - Existing items (with matching IDs) are updated.
    - This allows you to safely import shared configurations without losing your personal settings.
