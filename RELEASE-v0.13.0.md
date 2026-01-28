# Release v0.13.0 - Bootstrap 5 Enterprise UI Makeover

**Release Date:** January 28, 2026

## 🎨 Major Visual Redesign

Complete enterprise-grade UI transformation using Bootstrap 5 framework. The application now has a professional, modern appearance suitable for enterprise environments.

## New Features

### Bootstrap 5 Integration
- **Framework**: Integrated Bootstrap 5.3.2 via CDN
- **Icons**: Added Bootstrap Icons 1.11.3 for professional iconography
- **Responsive**: Fully responsive design with mobile-first approach
- **Theme**: Custom purple gradient theme with professional color palette

### Professional Navigation
- **Top Navbar**: Clean navigation bar with branding and tagline
- **Platform Selector**: Redesigned with Bootstrap button groups and icons
- **Breadcrumb Visual**: Clear visual hierarchy throughout the app

### Card-Based Layout
- **Sectioned Design**: Each major section in its own card with shadows
- **Visual Hierarchy**: Clear separation between Platform, Toolbar, and Form sections
- **Professional Headers**: Gradient headers on all cards
- **Clean Spacing**: Consistent padding and margins throughout

### Enhanced Toolbar
- **Icon Buttons**: All toolbar buttons now have Bootstrap Icons
- **Color Coding**: Semantic colors (primary, success, danger, warning, secondary)
- **Responsive Wrapping**: Toolbar buttons wrap nicely on smaller screens
- **Tooltips**: Descriptive titles on all action buttons

### Improved Form Controls
- **Bootstrap Inputs**: All dropdowns use `.form-select` class
- **Input Groups**: Manage buttons integrated with dropdowns
- **Badges**: Required fields have red "Required" badges
- **Labels**: Semantic icons on all form labels

### Better Field Management
- **Field Rows**: Cleaner layout with Bootstrap classes
- **Action Buttons**: Manage buttons with gear icon, Remove with trash icon
- **Required Field Indicator**: Visual left border on required fields
- **Dropdown Styling**: Consistent form-select styling

### Professional Buttons
- **Size Variants**: Large buttons for primary actions
- **Icon Integration**: All buttons have meaningful icons
- **Color Semantics**: 
  - Primary (blue): Main actions
  - Success (green): Generate/Export
  - Danger (red): Remove/Delete
  - Warning (yellow): Copy
  - Secondary (gray): Save Preset
- **Hover States**: Smooth transitions on all interactive elements

### Enhanced Output Display
- **Alert Component**: Output shown in Bootstrap success alert
- **Monospace Display**: Generated links in code-style format
- **Copy Button**: Bootstrap warning button with clipboard icon
- **Collapsible**: Clean show/hide behavior

### Visual Polish
- **Gradient Background**: Purple gradient body background
- **Card Shadows**: Subtle shadows for depth
- **Border Radius**: Consistent rounded corners
- **Typography**: Professional system font stack
- **Color Palette**: Cohesive color scheme throughout

## Design Details

### Color Scheme
- **Primary**: #0d6efd (Bootstrap Blue)
- **Secondary**: #6c757d (Gray)
- **Success**: #198754 (Green)
- **Danger**: #dc3545 (Red)
- **Warning**: #ffc107 (Yellow)
- **Gradient**: Purple (667eea → 764ba2)

### Typography
- **Font Stack**: Bootstrap default system fonts
- **Icons**: Bootstrap Icons web font
- **Headings**: Bold gradient text for branding
- **Body**: Consistent 1rem sizing

### Responsive Design
- **Mobile First**: Works perfectly on phones
- **Tablet Optimized**: Adaptive layouts for tablets
- **Desktop Enhanced**: Full features on large screens
- **Breakpoints**: Bootstrap's standard breakpoints

## Technical Changes

### CSS Framework
- Added Bootstrap 5.3.2 CSS (CDN)
- Added Bootstrap Icons 1.11.3 (CDN)
- Added custom CSS variables for theme colors
- Maintained all existing functionality

### JavaScript Updates
- Updated `switchAppType()` to handle Bootstrap button classes
- Added icon updates when switching platforms
- Updated navbar brand text dynamically
- Enhanced button state management

### HTML Structure
- Converted to Bootstrap grid system
- Added semantic card components
- Integrated input groups for combo controls
- Used Bootstrap alert for output display

### Component Updates
- **Buttons**: All buttons use `.btn` classes with variants
- **Forms**: All inputs use `.form-control` or `.form-select`
- **Icons**: All buttons have Bootstrap Icons
- **Layout**: Uses Bootstrap spacing utilities (mb-3, mt-4, etc.)

## Benefits

### User Experience
- **Professional Appearance**: Looks like enterprise SaaS
- **Improved Readability**: Better typography and spacing
- **Clear Actions**: Icons make buttons self-explanatory
- **Visual Feedback**: Hover states and transitions
- **Mobile Friendly**: Works perfectly on phones

### Developer Benefits
- **Maintainable**: Bootstrap classes are standard
- **Consistent**: Framework ensures visual consistency
- **Extensible**: Easy to add new Bootstrap components
- **Documented**: Bootstrap docs available for reference

## No Breaking Changes

**100% Backward Compatible**:
- All existing functionality preserved
- All localStorage keys unchanged
- All APIs remain the same
- All configurations work as before
- No user retraining required

## Files Changed
- `link-generator.html` - Complete Bootstrap 5 makeover
- `package.json` - Version bump to 0.13.0

## Upgrade Notes

Simply download the new `link-generator.html` - all your existing:
- ✅ Configurations are preserved
- ✅ Presets continue to work
- ✅ Saved fields remain intact
- ✅ All functionality is identical

## Screenshots

*New professional appearance with:*
- Purple gradient background
- Clean white cards with shadows
- Icon-rich interface
- Responsive toolbar
- Clear visual hierarchy

---

**Full Changelog:** https://github.com/mikejsmith1985/jira-html-parser/compare/v0.12.7...v0.13.0
