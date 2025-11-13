# Task Labels - Quick Code Reference

## Database Tables (database.js)

### Labels Table
```javascript
`CREATE TABLE IF NOT EXISTS labels (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`
```

### Task-Labels Junction Table
```javascript
`CREATE TABLE IF NOT EXISTS task_labels (
  taskId TEXT NOT NULL,
  labelId TEXT NOT NULL,
  PRIMARY KEY (taskId, labelId),
  FOREIGN KEY (taskId) REFERENCES tasks (id) ON DELETE CASCADE,
  FOREIGN KEY (labelId) REFERENCES labels (id) ON DELETE CASCADE
)`
```

---

## Demo Seed Data (database.js)

### Demo Labels
```javascript
const demoLabels = [
  { id: '1', name: 'bug', color: '#ef4444' },           // red
  { id: '2', name: 'feature', color: '#3b82f6' },       // blue
  { id: '3', name: 'urgent', color: '#f97316' },        // orange
  { id: '4', name: 'documentation', color: '#8b5cf6' }, // purple
  { id: '5', name: 'enhancement', color: '#10b981' },   // green
  { id: '6', name: 'testing', color: '#f59e0b' },       // amber
  { id: '7', name: 'design', color: '#ec4899' }         // pink
];
```

### Demo Task-Label Associations
```javascript
const demoTaskLabels = [
  { taskId: '1', labelId: '5' }, // UI Design - enhancement
  { taskId: '1', labelId: '7' }, // UI Design - design
  { taskId: '2', labelId: '2' }, // Database - feature
  { taskId: '3', labelId: '6' }, // API Testing - testing
  { taskId: '3', labelId: '3' }, // API Testing - urgent
  { taskId: '4', labelId: '4' }  // Documentation - documentation
];
```

---

## API Endpoints (server/index.js)

### Validation Helper
```javascript
const isValidHexColor = (color) => {
  return /^#[0-9A-F]{6}$/i.test(color);
};
```

### GET /api/labels
```javascript
app.get('/api/labels',
  authenticateToken,
  async (req, res) => {
    try {
      const labels = await db.all('SELECT * FROM labels ORDER BY name');
      res.json(labels);
    } catch (error) {
      console.error('Ошибка получения меток:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);
```

### POST /api/labels
```javascript
app.post('/api/labels',
  authenticateToken,
  [
    body('name').trim().isLength({ min: 2, max: 50 }),
    body('color').custom((value) => {
      if (!isValidHexColor(value)) {
        throw new Error('Цвет должен быть в формате #RRGGBB');
      }
      return true;
    })
  ],
  validate,
  async (req, res) => {
    try {
      const { name, color } = req.body;

      const existingLabel = await db.get('SELECT * FROM labels WHERE name = ?', [name]);
      if (existingLabel) {
        return res.status(400).json({ message: 'Метка с таким именем уже существует' });
      }

      const labelId = uuidv4();
      await db.run(
        'INSERT INTO labels (id, name, color) VALUES (?, ?, ?)',
        [labelId, name, color]
      );

      const newLabel = await db.get('SELECT * FROM labels WHERE id = ?', [labelId]);
      res.status(201).json(newLabel);
    } catch (error) {
      console.error('Ошибка создания метки:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);
```

### PUT /api/labels/:id
```javascript
app.put('/api/labels/:id',
  authenticateToken,
  checkRole(['admin', 'manager']),
  [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('color').optional().custom((value) => {
      if (value && !isValidHexColor(value)) {
        throw new Error('Цвет должен быть в формате #RRGGBB');
      }
      return true;
    })
  ],
  validate,
  async (req, res) => {
    try {
      const label = await db.get('SELECT * FROM labels WHERE id = ?', [req.params.id]);
      if (!label) {
        return res.status(404).json({ message: 'Метка не найдена' });
      }

      const { name, color } = req.body;

      if (name && name !== label.name) {
        const existingLabel = await db.get('SELECT * FROM labels WHERE name = ?', [name]);
        if (existingLabel) {
          return res.status(400).json({ message: 'Метка с таким именем уже существует' });
        }
      }

      await db.run(
        'UPDATE labels SET name = ?, color = ? WHERE id = ?',
        [name || label.name, color || label.color, req.params.id]
      );

      const updatedLabel = await db.get('SELECT * FROM labels WHERE id = ?', [req.params.id]);
      res.json(updatedLabel);
    } catch (error) {
      console.error('Ошибка обновления метки:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);
```

### DELETE /api/labels/:id
```javascript
app.delete('/api/labels/:id',
  authenticateToken,
  checkRole(['admin']),
  [param('id').isUUID()],
  validate,
  async (req, res) => {
    try {
      const label = await db.get('SELECT * FROM labels WHERE id = ?', [req.params.id]);
      if (!label) {
        return res.status(404).json({ message: 'Метка не найдена' });
      }

      await db.run('DELETE FROM task_labels WHERE labelId = ?', [req.params.id]);
      await db.run('DELETE FROM labels WHERE id = ?', [req.params.id]);

      res.json({ message: 'Метка удалена' });
    } catch (error) {
      console.error('Ошибка удаления метки:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);
```

### GET /api/tasks/:taskId/labels
```javascript
app.get('/api/tasks/:taskId/labels',
  authenticateToken,
  [param('taskId').isUUID()],
  validate,
  async (req, res) => {
    try {
      const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.taskId]);
      if (!task) {
        return res.status(404).json({ message: 'Задача не найдена' });
      }

      const labels = await db.all(
        `SELECT l.* FROM labels l
         INNER JOIN task_labels tl ON l.id = tl.labelId
         WHERE tl.taskId = ?
         ORDER BY l.name`,
        [req.params.taskId]
      );

      res.json(labels);
    } catch (error) {
      console.error('Ошибка получения меток задачи:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);
```

### POST /api/tasks/:taskId/labels/:labelId
```javascript
app.post('/api/tasks/:taskId/labels/:labelId',
  authenticateToken,
  [
    param('taskId').isUUID(),
    param('labelId').isUUID()
  ],
  validate,
  async (req, res) => {
    try {
      const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.taskId]);
      if (!task) {
        return res.status(404).json({ message: 'Задача не найдена' });
      }

      const label = await db.get('SELECT * FROM labels WHERE id = ?', [req.params.labelId]);
      if (!label) {
        return res.status(404).json({ message: 'Метка не найдена' });
      }

      const existingRelation = await db.get(
        'SELECT * FROM task_labels WHERE taskId = ? AND labelId = ?',
        [req.params.taskId, req.params.labelId]
      );

      if (existingRelation) {
        return res.status(400).json({ message: 'Метка уже добавлена к этой задаче' });
      }

      await db.run(
        'INSERT INTO task_labels (taskId, labelId) VALUES (?, ?)',
        [req.params.taskId, req.params.labelId]
      );

      res.status(201).json({ message: 'Метка добавлена к задаче', label });
    } catch (error) {
      console.error('Ошибка добавления метки к задаче:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);
```

### DELETE /api/tasks/:taskId/labels/:labelId
```javascript
app.delete('/api/tasks/:taskId/labels/:labelId',
  authenticateToken,
  [
    param('taskId').isUUID(),
    param('labelId').isUUID()
  ],
  validate,
  async (req, res) => {
    try {
      const relation = await db.get(
        'SELECT * FROM task_labels WHERE taskId = ? AND labelId = ?',
        [req.params.taskId, req.params.labelId]
      );

      if (!relation) {
        return res.status(404).json({ message: 'Метка не найдена у этой задачи' });
      }

      await db.run(
        'DELETE FROM task_labels WHERE taskId = ? AND labelId = ?',
        [req.params.taskId, req.params.labelId]
      );

      res.json({ message: 'Метка удалена из задачи' });
    } catch (error) {
      console.error('Ошибка удаления метки из задачи:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);
```

---

## Authorization Matrix

| Endpoint | All Users | Manager | Admin |
|----------|-----------|---------|-------|
| GET /api/labels | ✓ | ✓ | ✓ |
| POST /api/labels | ✓ | ✓ | ✓ |
| PUT /api/labels/:id | ✗ | ✓ | ✓ |
| DELETE /api/labels/:id | ✗ | ✗ | ✓ |
| GET /api/tasks/:taskId/labels | ✓ | ✓ | ✓ |
| POST /api/tasks/:taskId/labels/:labelId | ✓ | ✓ | ✓ |
| DELETE /api/tasks/:taskId/labels/:labelId | ✓ | ✓ | ✓ |

---

## Request/Response Examples

### Create Label
```bash
POST /api/labels
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "critical",
  "color": "#dc2626"
}

# Response: 201 Created
{
  "id": "uuid-here",
  "name": "critical",
  "color": "#dc2626",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Add Label to Task
```bash
POST /api/tasks/{taskId}/labels/{labelId}
Authorization: Bearer <token>

# Response: 201 Created
{
  "message": "Метка добавлена к задаче",
  "label": {
    "id": "uuid",
    "name": "bug",
    "color": "#ef4444",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Task Labels
```bash
GET /api/tasks/{taskId}/labels
Authorization: Bearer <token>

# Response: 200 OK
[
  {
    "id": "uuid-1",
    "name": "bug",
    "color": "#ef4444",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "uuid-2",
    "name": "urgent",
    "color": "#f97316",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```
