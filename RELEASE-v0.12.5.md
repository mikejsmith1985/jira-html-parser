# Release v0.12.5 - Field Picker Bug Fix

**Release Date:** January 28, 2026

## Bug Fixes

### Fixed Field Picker Bookmarklet Error
Fixed a critical bug in the Field Picker bookmarklet that was causing `TypeError: e.target.matches is not a function` errors when clicking on fields in ServiceNow forms.

**Issue:** The bookmarklet was attempting to call `.matches()` on objects that don't support this method (e.g., text nodes, SVG elements).

**Solution:** Added proper element type validation before calling `.matches()`:
- Check if `e.target.nodeType === 1` (ensures it's an Element)
- Check if `e.target.matches` exists (ensures method is available)
- Applied to all three event handlers: `handleClick`, `handleHover`, `handleHoverOut`

## Important Note

**Users must re-drag the Field Picker bookmarklet** after this update:
1. Refresh `link-generator.html` in your browser (Ctrl+F5)
2. Click the "🎯 Field Picker" button
3. Drag the bookmarklet to your bookmarks bar again (replaces the old version)

The bookmarklet code is generated dynamically, so you need to update it to get the fix.

## Technical Details

**Before:**
```javascript
const field = e.target.matches('input,select,textarea') ? e.target : e.target.closest('input,select,textarea');
```

**After:**
```javascript
let field = null;
if (e.target && e.target.nodeType === 1 && e.target.matches) {
  field = e.target.matches('input,select,textarea') ? e.target : e.target.closest('input,select,textarea');
}
```

This prevents errors when clicking on non-Element nodes in complex ServiceNow forms.

## Files Changed
- `link-generator.html` - Updated Field Picker bookmarklet generator

## Related Issues
- Fixes #16

---

**Full Changelog:** https://github.com/mikejsmith1985/jira-html-parser/compare/v0.12.4...v0.12.5
