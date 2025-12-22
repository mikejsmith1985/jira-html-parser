# Visual Guide: Configuration Items Feature

## User Interface Flow

### Step 1: Main Form
```
┌─────────────────────────────────────────────┐
│  Jira Issue Link Generator                  │
├─────────────────────────────────────────────┤
│                                             │
│  Load Preset: [Dropdown] [Manage Presets]  │
│                                             │
│  Base URL                                   │
│  [Input field]                              │
│                                             │
│  Project ID (pid)                           │
│  [Input field]                              │
│                                             │
│  Issue Type ID                              │
│  [Input field]                              │
│                                             │
│  Field 1: [Dropdown] [Manage Fields] [Text] [Remove]
│           ^
│           └─ Click here to open management modal
│
│  [+ Add Field]                              │
│                                             │
│  [Generate Link] [Save as Preset]          │
│                                             │
└─────────────────────────────────────────────┘
```

### Step 2: Manage Fields & Configuration Modal

When user clicks "Manage Fields" button:

```
┌──────────────────────────────────────────────────┐
│ Manage Fields & Configuration              [X]  │
├──────────────────────────────────────────────────┤
│                                                  │
│  Configuration Items                            │
│  ┌──────────────────────────────────────────┐  │
│  │ Base URL                  [Edit] [Delete]│  │
│  │ baseUrl                                  │  │
│  ├──────────────────────────────────────────┤  │
│  │ Project ID                [Edit] [Delete]│  │
│  │ projectId                                │  │
│  ├──────────────────────────────────────────┤  │
│  │ Issue Type ID             [Edit] [Delete]│  │
│  │ issueTypeId                              │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Custom Fields                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ Summary                   [Edit] [Delete] │  │
│  │ summary                                   │  │
│  ├──────────────────────────────────────────┤  │
│  │ (other fields here)                      │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ID Input: [Field ID]  [Label]  [Add]          │
│                                                  │
│                        [Cancel] [Close]         │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Step 3: Edit Configuration Item

When user clicks "Edit" next to Base URL:

```
┌──────────────────────────────────────────────────┐
│ Manage Fields & Configuration              [X]  │
├──────────────────────────────────────────────────┤
│                                                  │
│  Configuration Items                            │
│  ┌──────────────────────────────────────────┐  │
│  │ Base URL                  [Edit] [Delete]│  │
│  │ baseUrl                                  │  │
│  └──────────────────────────────────────────┘  │
│  (other items...)                              │
│                                                  │
│  Custom Fields                                  │
│  (displayed as before)                         │
│                                                  │
│  ID Input: [baseUrl ✗]   Label: [Base URL ↑↓] │
│             ↑ Disabled                         │
│  (User can now edit the label in right input)   │
│                                                  │
│                  [Cancel] [Update] [Close]      │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Step 4: After Update

User changes "Base URL" to "Production Jira URL":

```
ID Input: [baseUrl ✓]   Label: [Production Jira URL]
          ↑ Still disabled (protected)
```

After clicking "Update":
- Label changes in Configuration Items section
- Form input label also changes (optional enhancement)
- Data persisted in localStorage

## Interaction Workflows

### Workflow 1: Edit a Label
```
User clicks [Edit] 
    ↓
Input fields populate with current values
    ↓
ID field becomes disabled
    ↓
User modifies label text
    ↓
User clicks [Update]
    ↓
Changes saved to localStorage
    ↓
Config items list refreshes
    ↓
Modal shows updated label
```

### Workflow 2: Delete an Item
```
User clicks [Delete]
    ↓
Confirmation dialog appears
    ↓
User confirms
    ↓
Item removed from list
    ↓
Changes saved to localStorage
    ↓
List refreshes
    ↓
Item no longer visible in modal
    ↓
(Default reappears on page reload)
```

### Workflow 3: Add Custom Field
```
User types Field ID: customfield_10001
    ↓
User types Label: Priority Level
    ↓
User clicks [Add]
    ↓
Field added to Custom Fields section
    ↓
Changes saved to localStorage
    ↓
Field now available in field dropdowns
```

## Data Structure

### Configuration Items (Stored)
```json
{
  "jiraConfigItems": [
    {
      "id": "baseUrl",
      "label": "Base URL",
      "category": "config"
    },
    {
      "id": "projectId",
      "label": "Project ID",
      "category": "config"
    },
    {
      "id": "issueTypeId",
      "label": "Issue Type ID",
      "category": "config"
    }
  ]
}
```

### After User Edits
```json
{
  "jiraConfigItems": [
    {
      "id": "baseUrl",
      "label": "Production Jira URL",    ← Changed
      "category": "config"
    },
    ...
  ]
}
```

## Color Scheme

- **Blue Buttons** (#3498db) - Primary actions (Edit, Add, Manage)
- **Red Buttons** (#e74c3c) - Destructive actions (Delete, Remove)
- **Green Buttons** (#27ae60) - Update/Save actions
- **Gray Buttons** (#95a5a6) - Secondary actions (Close, Cancel)
- **Light Gray Background** (#f9f9f9) - Content areas

## Responsive Design

### Desktop (600px+)
```
┌─────────────────────────────────┐
│ Manage Fields & Configuration   │
├─────────────────────────────────┤
│ Config Items [scrollable section]
│ ┌──────────────────────────────┐
│ │ Item 1  [Edit] [Delete]     │
│ │ Item 2  [Edit] [Delete]     │
│ │ Item 3  [Edit] [Delete]     │
│ └──────────────────────────────┘
│                                 │
│ Custom Fields [scrollable]       
│ ┌──────────────────────────────┐
│ │ Field 1 [Edit] [Delete]     │
│ │ ...                          │
│ └──────────────────────────────┘
│                                 │
│ [ID Input] [Label] [Add]        │
│                                 │
│              [Cancel] [Update]  │
│              [Close]            │
└─────────────────────────────────┘
```

### Mobile (< 600px)
```
┌──────────────────────┐
│ Manage Fields        │
├──────────────────────┤
│ Config Items         │
│ [scrollable]         │
│                      │
│ Custom Fields        │
│ [scrollable]         │
│                      │
│ [ID Input]           │
│ [Label Input]        │
│ [Add Button]         │
│                      │
│ [Cancel] [Update]    │
│ [Close]              │
└──────────────────────┘
```

## State Indicators

### Normal State
- Configuration Items section visible
- All items show [Edit] [Delete] buttons
- Inputs empty
- All buttons enabled

### Edit State
- Clicked item highlighted (subtle change)
- ID input disabled (grayed out)
- Label input focused
- [Update] button visible
- [Cancel] button visible

### After Update
- Item list refreshes
- New label displays
- Inputs clear
- Buttons return to normal

## Tooltips (Optional Enhancement)

```
Hover on Item ID:
  "This ID is used internally and cannot be changed"

Hover on Edit Button:
  "Edit this item's display label"

Hover on Delete Button:
  "Remove this item from the list (defaults restore on reload)"

Hover on Disabled ID Input:
  "Item IDs are protected and cannot be edited"
```

## Success/Error Messages

### Success
```
✓ Configuration item updated successfully
✓ Custom field added successfully
✓ Item deleted (click Close to dismiss)
```

### Error
```
✗ Please enter both ID and Label
✗ Error updating configuration item: [details]
✗ localStorage full - cannot save changes
```

## Keyboard Navigation (Optional)

| Key | Action |
|-----|--------|
| Tab | Move between inputs/buttons |
| Shift+Tab | Move backward |
| Enter | Click focused button |
| Escape | Close modal |
| Alt+E | Click Edit (first item) |
| Alt+D | Click Delete (first item) |

---

This visual guide shows the feature in action and helps users understand the interface.
