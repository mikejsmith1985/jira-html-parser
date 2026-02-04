# Release v0.15.9 - DEBUG Field Picker

## 🔍 Debug Bookmarklet Added

This release adds a **DEBUG version** of the Field Picker bookmarklet specifically to troubleshoot why fields aren't being captured on ServiceNow.

### What's New

**🔍 DEBUG Field Picker Bookmarklet**
- New RED debug bookmarklet alongside the regular one
- Logs everything to browser console with `[FP]` prefix
- Shows initialization, activation, click events, and field detection
- Helps diagnose ServiceNow-specific issues

### How to Use

1. **On Your Work PC:**
   - Open the Link Generator at: https://mikejsmith1985.github.io/jira-html-parser/link-generator.html
   - Click "🎯 Field Picker" button in the toolbar
   - You'll see TWO bookmarklets:
     - 🎯 **Field Picker** (normal version)
     - 🔍 **DEBUG Version** (diagnostic version)

2. **Drag the DEBUG Version to bookmarks bar**

3. **Go to ServiceNow** and open a form (incident, change, etc.)

4. **Open Browser Console** (F12 → Console tab)

5. **Click the DEBUG bookmarklet**
   - Watch console for `[FP] Bookmarklet loaded`
   - Watch for `[FP] Event listeners attached`

6. **Click "🚀 Activate"** in the panel
   - Watch console for `[FP] ACTIVATING`

7. **Try clicking on a field**
   - Watch console closely!

### What the Logs Tell Us

**If you see:**
- ✅ `[FP] Click event fired!` → Event listener is working
- ✅ `Found field: <element>` → Field detection works
- ✅ `Adding field: {...}` → Field captured successfully

**If you DON'T see:**
- ❌ No `Click event fired!` messages → ServiceNow is blocking our listener
- ❌ `Click event fired!` but `No field found` → ServiceNow uses different HTML structure
- ❌ `Not active` in click log → Activate button not working

### Instructions

**Copy ALL the console messages** (everything with `[FP]`) and send them back. This will show exactly where it's failing.

---

## Technical Details

**Files Changed:**
- `link-generator.html` - Added DEBUG bookmarklet generation
- `bookmarklet-debug.js` - New debug version with extensive logging
- `servicenow-debug.html` - Debug instructions page (for local testing)

**Debug Features:**
- Logs every click event when activated
- Shows target element details (tagName, id, className)
- Tracks state (active/inactive)
- Shows field detection logic
- Displays matched field properties

---

## Known Issues from v0.15.7

User reported Field Picker launches but doesn't capture fields on ServiceNow. The DEBUG version will help identify:
1. If ServiceNow's JavaScript is preventing click events
2. If ServiceNow uses different field HTML structure
3. If there's a timing or initialization issue

**Next steps** depend on what the console logs reveal.
