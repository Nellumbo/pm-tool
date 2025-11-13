# Task Labels/Tags Feature - Backend Implementation

## Overview
Successfully implemented a comprehensive Task Labels/Tags system for the PM Tool backend with database tables, API endpoints, validation, security, and demo data.

---

## 1. Database Changes (`/home/user/pm-tool/server/database.js`)

### New Tables

#### `labels` Table
```sql
CREATE TABLE IF NOT EXISTS labels (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```
- **id**: UUID primary key
- **name**: Unique label name (2-50 characters)
- **color**: Hex color code (#RRGGBB format)
- **createdAt**: Timestamp of creation

#### `task_labels` Junction Table (Many-to-Many)
```sql
CREATE TABLE IF NOT EXISTS task_labels (
  taskId TEXT NOT NULL,
  labelId TEXT NOT NULL,
  PRIMARY KEY (taskId, labelId),
  FOREIGN KEY (taskId) REFERENCES tasks (id) ON DELETE CASCADE,
  FOREIGN KEY (labelId) REFERENCES labels (id) ON DELETE CASCADE
)
```
- **taskId**: Reference to task
- **labelId**: Reference to label
- **Composite Primary Key**: Ensures unique task-label combinations
- **CASCADE DELETE**: Automatic cleanup when tasks or labels are deleted

### Demo Seed Data

#### 7 Pre-configured Labels:
1. **bug** - `#ef4444` (red)
2. **feature** - `#3b82f6` (blue)
3. **urgent** - `#f97316` (orange)
4. **documentation** - `#8b5cf6` (purple)
5. **enhancement** - `#10b981` (green)
6. **testing** - `#f59e0b` (amber)
7. **design** - `#ec4899` (pink)

#### Demo Task-Label Associations:
- Task 1 (UI Design): enhancement, design
- Task 2 (Database Setup): feature
- Task 3 (API Testing): testing, urgent
- Task 4 (API Documentation): documentation

---

## 2. API Endpoints (`/home/user/pm-tool/server/index.js`)

### Label Management Endpoints

#### GET `/api/labels`
**Get all labels**
- **Authentication**: Required (JWT token)
- **Authorization**: All authenticated users
- **Response**: Array of all labels, ordered by name
- **Success**: 200 OK

```json
[
  {
    "id": "uuid",
    "name": "bug",
    "color": "#ef4444",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

#### POST `/api/labels`
**Create a new label**
- **Authentication**: Required (JWT token)
- **Authorization**: All authenticated users
- **Validation**:
  - `name`: 2-50 characters (trimmed, unique)
  - `color`: Valid hex color (#RRGGBB format)
- **Response**: Created label object
- **Success**: 201 Created
- **Errors**:
  - 400: Label name already exists
  - 400: Validation error

```json
// Request
{
  "name": "critical",
  "color": "#dc2626"
}

// Response
{
  "id": "new-uuid",
  "name": "critical",
  "color": "#dc2626",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### PUT `/api/labels/:id`
**Update an existing label**
- **Authentication**: Required (JWT token)
- **Authorization**: Admin or Manager only
- **Validation**:
  - `name`: 2-50 characters (optional, unique)
  - `color`: Valid hex color (optional)
- **Response**: Updated label object
- **Success**: 200 OK
- **Errors**:
  - 403: Insufficient permissions
  - 404: Label not found
  - 400: Label name already exists

```json
// Request
{
  "name": "critical-bug",
  "color": "#991b1b"
}

// Response
{
  "id": "uuid",
  "name": "critical-bug",
  "color": "#991b1b",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### DELETE `/api/labels/:id`
**Delete a label**
- **Authentication**: Required (JWT token)
- **Authorization**: Admin only
- **Behavior**: Removes label and all task associations
- **Success**: 200 OK
- **Errors**:
  - 403: Insufficient permissions (not admin)
  - 404: Label not found

```json
// Response
{
  "message": "Метка удалена"
}
```

---

### Task-Label Association Endpoints

#### GET `/api/tasks/:taskId/labels`
**Get all labels for a specific task**
- **Authentication**: Required (JWT token)
- **Authorization**: All authenticated users
- **Response**: Array of labels attached to the task
- **Success**: 200 OK
- **Errors**:
  - 404: Task not found

```json
[
  {
    "id": "label-uuid-1",
    "name": "bug",
    "color": "#ef4444",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "label-uuid-2",
    "name": "urgent",
    "color": "#f97316",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

#### POST `/api/tasks/:taskId/labels/:labelId`
**Add a label to a task**
- **Authentication**: Required (JWT token)
- **Authorization**: All authenticated users
- **Validation**: Both task and label must exist
- **Success**: 201 Created
- **Errors**:
  - 404: Task or label not found
  - 400: Label already attached to task

```json
// Response
{
  "message": "Метка добавлена к задаче",
  "label": {
    "id": "label-uuid",
    "name": "bug",
    "color": "#ef4444",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### DELETE `/api/tasks/:taskId/labels/:labelId`
**Remove a label from a task**
- **Authentication**: Required (JWT token)
- **Authorization**: All authenticated users
- **Success**: 200 OK
- **Errors**:
  - 404: Task-label association not found

```json
// Response
{
  "message": "Метка удалена из задачи"
}
```

---

## 3. Validation Rules

### Label Name
- **Length**: 2-50 characters
- **Format**: Trimmed whitespace
- **Uniqueness**: Must be unique across all labels
- **Required**: Yes

### Label Color
- **Format**: Hex color code (#RRGGBB)
- **Pattern**: `/^#[0-9A-F]{6}$/i`
- **Examples**:
  - Valid: `#ef4444`, `#3B82F6`, `#10b981`
  - Invalid: `#fff`, `red`, `#12345`, `rgb(255,0,0)`
- **Required**: Yes

### Task/Label IDs
- **Format**: Valid UUID v4
- **Validation**: Automatic via express-validator
- **Required**: Yes (in route parameters)

---

## 4. Security Features

### Authentication
- All endpoints require valid JWT token
- Token verification via `authenticateToken` middleware
- 401 Unauthorized if token missing/invalid

### Authorization (Role-Based Access Control)

| Endpoint | All Users | Manager | Admin |
|----------|-----------|---------|-------|
| GET /api/labels | ✓ | ✓ | ✓ |
| POST /api/labels | ✓ | ✓ | ✓ |
| PUT /api/labels/:id | ✗ | ✓ | ✓ |
| DELETE /api/labels/:id | ✗ | ✗ | ✓ |
| GET /api/tasks/:taskId/labels | ✓ | ✓ | ✓ |
| POST /api/tasks/:taskId/labels/:labelId | ✓ | ✓ | ✓ |
| DELETE /api/tasks/:taskId/labels/:labelId | ✓ | ✓ | ✓ |

### Data Integrity
- Unique constraint on label names
- Foreign key constraints with CASCADE DELETE
- Composite primary key prevents duplicate task-label pairs
- Validation before database operations

### Input Sanitization
- All text inputs trimmed
- SQL injection prevention via parameterized queries
- XSS protection through express-validator

---

## 5. Error Handling

### HTTP Status Codes
- **200 OK**: Successful GET/DELETE
- **201 Created**: Successful POST (resource created)
- **400 Bad Request**: Validation errors, duplicates
- **401 Unauthorized**: Missing/invalid JWT token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Database or server errors

### Error Response Format
```json
{
  "message": "Human-readable error message",
  "errors": [
    {
      "field": "name",
      "message": "Label name must be 2-50 characters"
    }
  ]
}
```

---

## 6. Database Relationships

```
tasks (1) ←→ (M) task_labels (M) ←→ (1) labels

- One task can have many labels
- One label can be on many tasks
- Many-to-many relationship via junction table
- Cascade delete ensures referential integrity
```

---

## 7. Testing the Implementation

### Prerequisites
```bash
# Start the server
cd /home/user/pm-tool
npm install
node server/index.js
```

### Test Scenarios

#### 1. Get All Labels
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/labels
```

#### 2. Create New Label
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"performance","color":"#06b6d4"}' \
  http://localhost:5000/api/labels
```

#### 3. Update Label (Admin/Manager only)
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"high-priority","color":"#dc2626"}' \
  http://localhost:5000/api/labels/LABEL_ID
```

#### 4. Get Task Labels
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/tasks/TASK_ID/labels
```

#### 5. Add Label to Task
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/tasks/TASK_ID/labels/LABEL_ID
```

#### 6. Remove Label from Task
```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/tasks/TASK_ID/labels/LABEL_ID
```

#### 7. Delete Label (Admin only)
```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/labels/LABEL_ID
```

---

## 8. Implementation Files

### Modified Files
1. **`/home/user/pm-tool/server/database.js`**
   - Added `labels` table schema
   - Added `task_labels` junction table schema
   - Added demo labels seed data (7 labels)
   - Added demo task-label associations (6 associations)

2. **`/home/user/pm-tool/server/index.js`**
   - Added `isValidHexColor()` validation function
   - Added 7 new API endpoints for labels
   - Updated task deletion to clean up label associations
   - Added comprehensive validation and security checks

---

## 9. Next Steps for Frontend Integration

### Required Frontend Components
1. **Label Badge Component** - Display label with color
2. **Label Selector** - Multi-select dropdown for adding labels
3. **Label Manager** - Admin interface for CRUD operations
4. **Task Card Enhancement** - Show labels on task cards
5. **Label Filter** - Filter tasks by labels

### API Usage Example (React)
```javascript
// Fetch all labels
const labels = await fetch('/api/labels', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// Add label to task
await fetch(`/api/tasks/${taskId}/labels/${labelId}`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

// Get task labels
const taskLabels = await fetch(`/api/tasks/${taskId}/labels`, {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());
```

---

## 10. Summary

### What Was Implemented
✓ Database tables for labels and task-label associations
✓ 7 comprehensive API endpoints with full CRUD operations
✓ Role-based access control (Admin, Manager, All Users)
✓ Input validation (name length, color format, UUID)
✓ Unique constraints and referential integrity
✓ Cascade delete for data cleanup
✓ Demo seed data with 7 common labels
✓ Demo task-label associations for testing
✓ Proper error handling and HTTP status codes
✓ Security through JWT authentication

### Key Features
- Many-to-many relationship between tasks and labels
- Unique label names prevent duplicates
- Hex color validation ensures proper UI rendering
- Cascade deletes maintain database integrity
- Role-based permissions for administrative operations
- Comprehensive validation and error messages

---

## Files Modified
- `/home/user/pm-tool/server/database.js`
- `/home/user/pm-tool/server/index.js`

The backend implementation is complete and ready for frontend integration!
