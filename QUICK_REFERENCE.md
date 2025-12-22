# Quick Reference: Configuration Items

## Feature: Manage Base URL, Project ID, and Issue Type ID

### Quick Start

1. **Open Management Modal**
   - Click the "Manage Fields" button in any field row
   - Modal shows "Configuration Items" section at top

2. **Edit a Configuration Item**
   - Find item (Base URL, Project ID, or Issue Type ID)
   - Click "Edit"
   - Change the label text
   - Click "Update"

3. **Delete a Configuration Item**
   - Click "Delete" next to the item
   - Confirm deletion
   - Item is removed from list

### Configuration Items

| Item | ID | Purpose |
|------|----|----|
| Base URL | `baseUrl` | Jira server URL |
| Project ID | `projectId` | Target project identifier |
| Issue Type ID | `issueTypeId` | Type of issue to create |

### Key Points

✓ **Edit** labels to customize for your team  
✓ **IDs remain locked** (can't change baseUrl, projectId, issueTypeId)  
✓ **Delete** items temporarily (defaults reload on page refresh)  
✓ **Works with Presets** - lock items in saved presets  
✓ **Separate from Fields** - doesn't affect custom fields  

### Storage

- **Browser Storage:** localStorage
- **Key:** `jiraConfigItems`
- **Clear:** Delete "jiraConfigItems" from DevTools → Application → Local Storage

### Shortcuts

| Action | Steps |
|--------|-------|
| Edit Label | Click Edit → modify → Click Update |
| Delete Item | Click Delete → confirm |
| Restore Defaults | Clear localStorage → Reload page |
| View Storage | F12 → Application → Local Storage → jiraConfigItems |

### Examples

#### Change "Base URL" to "Jira Server"
1. Click Edit on Base URL
2. Change label from "Base URL" to "Jira Server"
3. Click Update
4. Form now shows "Jira Server" label

#### Delete and Restore
1. Click Delete on Project ID
2. Item removed from list
3. Reload page OR clear localStorage
4. Default items reappear

#### Create Preset with Locked Items
1. Fill in form with your values
2. Click "Save as Preset"
3. Check "Lock Base URL to: ..."
4. Click "Save Preset"
5. Next load: preset auto-fills values

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Changes not saving | Close modal with Close button (not X) |
| Items not showing | F12 → Console, check for errors |
| Want defaults back | Clear localStorage or delete jiraConfigItems |
| Can't edit ID field | This is normal - IDs are protected |

### Related Operations

- **Add Custom Field** → Uses same modal
- **Manage Presets** → Can lock config items
- **Generate Link** → Uses Base URL + Project ID + Issue Type ID
- **Save Preset** → Remembers labeled items

### Visual Cues

- **Blue Button** = Edit or Add action
- **Red Button** = Delete action  
- **Green Button** = Update/Save action
- **Gray Button** = Close/Cancel action
- **Disabled Field** = Cannot edit (protected)
- **Scrollable Section** = More items available

### Browser Support

✓ Chrome/Edge  
✓ Firefox  
✓ Safari  
✓ Any modern browser with localStorage support

### Performance

- Instant label updates
- No server calls
- All data stored locally
- Lightweight (< 50KB)

### Security

- No data sent to servers
- No authentication required
- Data stays in browser
- HTML escape protection for XSS

### Tips & Tricks

1. **Use Descriptive Labels**
   - Instead of: "url" → Better: "Production Jira URL"

2. **Multiple Environments**
   - Create presets for Dev/Staging/Prod
   - Lock different URLs in each preset

3. **Team Consistency**
   - Share custom label names with team
   - Document in project wiki

4. **Backup Presets**
   - Write down important preset names
   - Presets are browser-local only

### What Changed?

**Before:** Base URL, Project ID, Issue Type ID were basic input fields  
**After:** Full management UI like custom fields

### What's the Same?

✓ Form still works the same  
✓ Link generation unchanged  
✓ Presets still function  
✓ All existing features preserved  

---

**Need More Help?** See CONFIG_ITEMS_USAGE_GUIDE.md for detailed instructions and examples.
