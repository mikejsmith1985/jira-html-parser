# Release v0.12.7 - Field Picker UI Improvements

**Release Date:** January 28, 2026

## Enhancements

### Completely Redesigned Field Picker Modal UI
Dramatically improved the Field Picker modal with a professional, modern design focused on readability and usability.

**Visual Improvements:**
- **Larger, readable fonts**: 14-16px body text (was 12-13px), 24px heading (was 18px)
- **Better spacing**: 32px modal padding, 20px section padding, generous margins between elements
- **Organized card layout**: Sections now have background cards with subtle borders
- **Clear visual hierarchy**: Section labels in uppercase gray with proper letter-spacing
- **Professional typography**: System font stack for native look on all platforms
- **Improved color contrast**: Better text visibility on all backgrounds

**Layout Improvements:**
- **Wider modal**: 600px max-width (was 500px) for better content display
- **Grid layout**: Type and Required fields side-by-side for efficient space use
- **Better code display**: Monospace font with borders and proper padding for field IDs
- **Enhanced options list**: Redesigned with better spacing, borders, and formatting
- **Improved info boxes**: Large dropdown warning now has icon, colored background, and clearer message

**Interactive Improvements:**
- **Hover effects**: All buttons have smooth color transitions on hover
- **Better button styling**: Shadows and hover animations for depth
- **Larger touch targets**: Buttons easier to click/tap on mobile devices
- **Visual feedback**: "Copied!" state lasts 1.5 seconds (was 1 second) with class tracking

**Before & After:**
- Old: Cramped text, small fonts, hard to read IDs, plain layout
- New: Spacious, organized, easy to scan, professional appearance

## Technical Details

**Modal Dimensions:**
- Max width: 600px (↑ from 500px)
- Padding: 32px (↑ from 24px)
- Max height: 85vh (↑ from 80vh)
- Line height: 1.6 for better readability

**Typography:**
- System font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif`
- Heading: 24px, 600 weight
- Body: 14-16px
- Labels: 13px uppercase with letter-spacing
- Code: Monaco, Consolas, monospace

**Colors:**
- Background cards: `#f8f9fa`
- Section labels: `#7f8c8d`
- Borders: `#e1e4e8`
- Warning box: `#fff3cd` with `#ffc107` accent

## Important Note

**Users must re-drag the Field Picker bookmarklet** to get the new UI:
1. Refresh `link-generator.html` (Ctrl+F5)
2. Click the "🎯 Field Picker" button
3. Drag the bookmarklet to your bookmarks bar again

## Files Changed
- `link-generator.html` - Completely redesigned Field Picker modal UI

## Related Issues
- Fixes #16 (UI readability issues)

---

**Full Changelog:** https://github.com/mikejsmith1985/jira-html-parser/compare/v0.12.6...v0.12.7
