# Task Labels/Tags Feature - React Components

## Overview

This package provides three React components for managing and displaying task labels (tags) in the PM Tool application.

## Components

### 1. LabelBadge.js

A small badge component to display a label with color-coded background.

**Features:**
- Color-coded display with automatic text color contrast
- Three sizes: small, medium, large
- Optional remove button
- Hover effects
- Tooltip support

**Props:**
```javascript
{
  label: {
    id: string|number,        // Unique identifier (REQUIRED)
    name: string,             // Display name (REQUIRED)
    color: string,            // Hex color code (e.g., "#007bff")
    description: string       // Optional description (shown in tooltip)
  },
  size: 'small'|'medium'|'large',  // Default: 'medium'
  removable: boolean,               // Show remove button, default: false
  onRemove: function(labelId),      // Callback when removed
  className: string                 // Additional CSS classes
}
```

**Usage Example:**
```jsx
import LabelBadge from './components/LabelBadge';

<LabelBadge
  label={{ id: 1, name: 'Bug', color: '#dc3545' }}
  size="medium"
  removable={true}
  onRemove={(labelId) => handleRemoveLabel(labelId)}
/>
```

---

### 2. LabelPicker.js

Multi-select dropdown component for selecting task labels.

**Features:**
- Multi-select with checkboxes
- Search/filter functionality
- Visual color indicators
- Clear all button
- Dropdown with keyboard support
- Click outside to close
- Display selected labels as badges

**Props:**
```javascript
{
  labels: Array<{                   // All available labels (REQUIRED)
    id: string|number,
    name: string,
    color: string,
    description: string
  }>,
  selectedLabels: Array<string|number>,  // Selected label IDs, default: []
  onChange: function(labelIds),          // Callback with new selection (REQUIRED)
  placeholder: string,                   // Default: 'Выберите метки'
  maxHeight: number,                     // Dropdown max height, default: 300
  disabled: boolean                      // Disable picker, default: false
}
```

**Usage Example:**
```jsx
import LabelPicker from './components/LabelPicker';

const [labels, setLabels] = useState([]);
const [selectedLabels, setSelectedLabels] = useState([]);

<LabelPicker
  labels={labels}
  selectedLabels={selectedLabels}
  onChange={(newLabelIds) => setSelectedLabels(newLabelIds)}
  placeholder="Выберите метки задачи"
/>
```

---

### 3. LabelManager.js

Complete label management interface with CRUD operations.

**Features:**
- View all labels with usage statistics
- Create new labels with name, color, and description
- Edit existing labels
- Delete labels (with confirmation)
- Color picker with 20 preset colors
- Live preview of label appearance
- Responsive grid layout
- Beautiful card-based UI

**Usage:**
```jsx
import LabelManager from './components/LabelManager';

// Use as a standalone page
<LabelManager />
```

**No props required** - Component manages its own state and API calls.

---

## Backend API Requirements

These components expect the following REST API endpoints:

### GET /api/labels
Fetch all labels

**Response:**
```json
[
  {
    "id": 1,
    "name": "Bug",
    "color": "#dc3545",
    "description": "Software defects and issues",
    "usageCount": 15,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

### POST /api/labels
Create a new label

**Request Body:**
```json
{
  "name": "Feature",
  "color": "#28a745",
  "description": "New feature development"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Feature",
  "color": "#28a745",
  "description": "New feature development",
  "usageCount": 0,
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

### PUT /api/labels/:id
Update an existing label

**Request Body:**
```json
{
  "name": "Critical Bug",
  "color": "#dc3545",
  "description": "High priority issues"
}
```

### DELETE /api/labels/:id
Delete a label

**Response:**
```json
{
  "message": "Label deleted successfully"
}
```

---

## Database Schema

Suggested database schema for labels:

```sql
-- Labels table
CREATE TABLE labels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7) NOT NULL DEFAULT '#007bff',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task-Label relationship (many-to-many)
CREATE TABLE task_labels (
  task_id INTEGER NOT NULL,
  label_id INTEGER NOT NULL,
  PRIMARY KEY (task_id, label_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
);

-- Index for faster lookups
CREATE INDEX idx_task_labels_task ON task_labels(task_id);
CREATE INDEX idx_task_labels_label ON task_labels(label_id);
```

---

## Integration with Tasks Component

### Step 1: Update Tasks Database Schema

Add labelIds to tasks or use the task_labels junction table.

### Step 2: Fetch Labels in Tasks Component

```jsx
import LabelPicker from './LabelPicker';
import LabelBadge from './LabelBadge';

const Tasks = () => {
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    const data = await get('/api/labels');
    setLabels(data);
  };

  // ... rest of component
};
```

### Step 3: Add Label Picker to Task Form

```jsx
// In your task modal form
<div className="form-group">
  <label>Метки</label>
  <LabelPicker
    labels={labels}
    selectedLabels={formData.labelIds || []}
    onChange={(labelIds) => setFormData({...formData, labelIds})}
  />
</div>
```

### Step 4: Display Labels in Task List

```jsx
// In your task card
{task.labelIds && task.labelIds.length > 0 && (
  <div className="task-labels" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
    {getTaskLabels(task.labelIds).map(label => (
      <LabelBadge
        key={label.id}
        label={label}
        size="small"
      />
    ))}
  </div>
)}
```

### Step 5: Add Label Filter

```jsx
const [labelFilter, setLabelFilter] = useState([]);

// Filter tasks
const filteredTasks = tasks.filter(task => {
  // ... other filters
  const labelMatch = labelFilter.length === 0 ||
    task.labelIds?.some(id => labelFilter.includes(id));
  return statusMatch && projectMatch && labelMatch;
});

// Filter UI
<div className="form-group">
  <label>Метки</label>
  <LabelPicker
    labels={labels}
    selectedLabels={labelFilter}
    onChange={setLabelFilter}
    placeholder="Фильтр по меткам"
  />
</div>
```

---

## Adding Label Management to Navigation

In `App.js`, add the labels route:

```jsx
import LabelManager from './components/LabelManager';

// In navigation array
const navigation = [
  // ... existing items
  { id: 'labels', label: 'Метки', icon: Tag, path: '/labels' }
];

// In Routes
<Route path="/labels" element={<LabelManager />} />
```

---

## Styling

All components use inline JSX styles and follow the existing PM Tool design patterns:

- Colors match the app's color scheme
- Consistent with existing badge styles
- Responsive design
- Smooth transitions and hover effects
- Accessible with proper ARIA labels

---

## Example Server Routes (Express.js)

```javascript
const express = require('express');
const router = express.Router();

// Get all labels
router.get('/api/labels', async (req, res) => {
  try {
    const labels = await db.all(`
      SELECT l.*,
        (SELECT COUNT(*) FROM task_labels WHERE label_id = l.id) as usageCount
      FROM labels l
      ORDER BY l.name
    `);
    res.json(labels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create label
router.post('/api/labels', async (req, res) => {
  try {
    const { name, color, description } = req.body;
    const result = await db.run(
      'INSERT INTO labels (name, color, description) VALUES (?, ?, ?)',
      [name, color || '#007bff', description || '']
    );
    const label = await db.get('SELECT * FROM labels WHERE id = ?', result.lastID);
    res.status(201).json(label);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update label
router.put('/api/labels/:id', async (req, res) => {
  try {
    const { name, color, description } = req.body;
    await db.run(
      'UPDATE labels SET name = ?, color = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, color, description, req.params.id]
    );
    const label = await db.get('SELECT * FROM labels WHERE id = ?', req.params.id);
    res.json(label);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete label
router.delete('/api/labels/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM labels WHERE id = ?', req.params.id);
    res.json({ message: 'Label deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get task labels
router.get('/api/tasks/:taskId/labels', async (req, res) => {
  try {
    const labels = await db.all(`
      SELECT l.* FROM labels l
      INNER JOIN task_labels tl ON l.id = tl.label_id
      WHERE tl.task_id = ?
    `, req.params.taskId);
    res.json(labels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task labels
router.put('/api/tasks/:taskId/labels', async (req, res) => {
  try {
    const { labelIds } = req.body;

    // Remove existing labels
    await db.run('DELETE FROM task_labels WHERE task_id = ?', req.params.taskId);

    // Add new labels
    for (const labelId of labelIds) {
      await db.run(
        'INSERT INTO task_labels (task_id, label_id) VALUES (?, ?)',
        [req.params.taskId, labelId]
      );
    }

    res.json({ message: 'Task labels updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

---

## Testing

### Manual Testing Checklist

**LabelBadge:**
- [ ] Displays label name correctly
- [ ] Shows correct background color
- [ ] Text color has good contrast
- [ ] Sizes (small/medium/large) work correctly
- [ ] Remove button appears when removable=true
- [ ] onRemove callback is called
- [ ] Hover effects work

**LabelPicker:**
- [ ] Opens dropdown on click
- [ ] Closes on click outside
- [ ] Search filters labels
- [ ] Multiple labels can be selected
- [ ] Selected labels show as badges
- [ ] Clear all button works
- [ ] onChange callback receives correct data
- [ ] Disabled state works

**LabelManager:**
- [ ] Loads labels from API
- [ ] Create modal opens
- [ ] Color picker works
- [ ] Preset colors are selectable
- [ ] Form validation works
- [ ] Label is created successfully
- [ ] Edit modal opens with correct data
- [ ] Label is updated successfully
- [ ] Delete confirmation appears
- [ ] Label is deleted successfully
- [ ] Usage count is displayed

---

## Dependencies

All required dependencies are already in the project:

- `react`: ^18.2.0
- `react-dom`: ^18.2.0
- `lucide-react`: ^0.294.0 (for icons)

**No additional dependencies needed!**

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Accessibility

All components include:
- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader friendly
- Sufficient color contrast

---

## Performance

- Optimized with React hooks
- Minimal re-renders
- Efficient event handling
- Lightweight (< 10KB combined)

---

## Troubleshooting

### Labels not showing up
- Check that `/api/labels` endpoint returns data
- Verify labels array is passed to components
- Check browser console for errors

### Colors not displaying
- Ensure color values are valid hex codes (e.g., "#007bff")
- Check inline styles are not being overridden

### Dropdown not closing
- Verify click outside handler is not interfered with
- Check z-index conflicts with other components

---

## Future Enhancements

- Label categories/groups
- Label templates
- Import/export labels
- Label analytics
- Keyboard shortcuts
- Drag and drop label ordering
- Label color themes

---

## License

Part of PM Tool - Project Management System

---

## Support

For issues or questions, refer to the main PM Tool documentation.
