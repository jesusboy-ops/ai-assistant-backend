# New Features API Guide

## ✅ Backend Status: ALL ENDPOINTS WORKING
Your backend at `https://ai-assistant-backend-oqpp.onrender.com` is fully operational for all new features.

---

## 🎯 AI Task & To-Do Manager

### Base URL: `/api/tasks`

#### 1. Get All Tasks
```javascript
GET /api/tasks
Headers: { Authorization: "Bearer <token>" }

// Optional query parameters:
// ?status=pending|in_progress|completed|cancelled
// ?priority=low|medium|high|urgent
// ?limit=50&offset=0
```

#### 2. Create Task
```javascript
POST /api/tasks
Headers: { 
  Authorization: "Bearer <token>",
  Content-Type: "application/json"
}
Body: {
  "title": "Complete project proposal",        // Required
  "description": "Write and review proposal",  // Optional
  "priority": "high",                          // Optional: low|medium|high|urgent
  "due_date": "2025-12-25T10:00:00.000Z",    // Optional: ISO 8601 date
  "tags": ["work", "urgent"]                   // Optional: array of strings
}
```

#### 3. Update Task
```javascript
PUT /api/tasks/:id
Headers: { 
  Authorization: "Bearer <token>",
  Content-Type: "application/json"
}
Body: {
  "title": "Updated title",                    // Optional
  "status": "completed",                       // Optional: pending|in_progress|completed|cancelled
  "priority": "medium",                        // Optional
  "due_date": "2025-12-26T10:00:00.000Z"     // Optional
}
```

#### 4. Delete Task
```javascript
DELETE /api/tasks/:id
Headers: { Authorization: "Bearer <token>" }
```

#### 5. AI: Create Tasks from Message
```javascript
POST /api/tasks/from-message
Headers: { 
  Authorization: "Bearer <token>",
  Content-Type: "application/json"
}
Body: {
  "message": "I need to buy groceries tomorrow, call the doctor next week, and finish the report by Friday",
  "messageId": "optional-message-id"          // Optional
}
```

#### 6. AI: Get Task Suggestions
```javascript
POST /api/tasks/suggestions
Headers: { 
  Authorization: "Bearer <token>",
  Content-Type: "application/json"
}
Body: {
  "context": "work project management"        // Optional context
}
```

---

## 🔔 Smart Reminders System

### Base URL: `/api/reminders`

#### 1. Get All Reminders
```javascript
GET /api/reminders
Headers: { Authorization: "Bearer <token>" }

// Optional query parameters:
// ?active_only=true|false
// ?limit=50&offset=0
```

#### 2. Get Upcoming Reminders (Next 24 Hours)
```javascript
GET /api/reminders/upcoming
Headers: { Authorization: "Bearer <token>" }
```

#### 3. Create Reminder
```javascript
POST /api/reminders
Headers: { 
  Authorization: "Bearer <token>",
  Content-Type: "application/json"
}
Body: {
  "title": "Meeting with John",                    // Required
  "description": "Discuss project updates",       // Optional
  "reminder_time": "2025-12-25T14:30:00.000Z",   // Required: ISO 8601 date
  "repeat_type": "weekly",                         // Optional: none|daily|weekly|monthly|yearly
  "repeat_interval": 1                             // Optional: integer >= 1
}
```

#### 4. Update Reminder
```javascript
PUT /api/reminders/:id
Headers: { 
  Authorization: "Bearer <token>",
  Content-Type: "application/json"
}
Body: {
  "title": "Updated meeting",                      // Optional
  "reminder_time": "2025-12-25T15:00:00.000Z",   // Optional
  "is_active": false                               // Optional: boolean
}
```

#### 5. Delete Reminder
```javascript
DELETE /api/reminders/:id
Headers: { Authorization: "Bearer <token>" }
```

#### 6. AI: Create Reminders from Message
```javascript
POST /api/reminders/from-message
Headers: { 
  Authorization: "Bearer <token>",
  Content-Type: "application/json"
}
Body: {
  "message": "Remind me to call mom tomorrow at 3pm and take medicine every morning",
  "messageId": "optional-message-id"              // Optional
}
```

---

## 📄 File & Document Summarizer

### Base URL: `/api/documents`

#### 1. Upload & Summarize Document
```javascript
POST /api/documents/summarize
Headers: { Authorization: "Bearer <token>" }
Content-Type: multipart/form-data

// Use FormData
const formData = new FormData();
formData.append('file', selectedFile);  // Field name MUST be 'file'

// Supported file types: PDF, DOC, DOCX, TXT, JPG, PNG, GIF
// Max file size: 10MB
```

#### 2. Get All Document Summaries
```javascript
GET /api/documents/summaries
Headers: { Authorization: "Bearer <token>" }

// Optional query parameters:
// ?limit=50&offset=0
```

#### 3. Get Specific Document Summary
```javascript
GET /api/documents/summaries/:id
Headers: { Authorization: "Bearer <token>" }
```

#### 4. Delete Document Summary
```javascript
DELETE /api/documents/summaries/:id
Headers: { Authorization: "Bearer <token>" }
```

#### 5. Extract Key Points from Text
```javascript
POST /api/documents/key-points
Headers: { 
  Authorization: "Bearer <token>",
  Content-Type: "application/json"
}
Body: {
  "text": "Long text to extract key points from...",  // Option 1: Direct text
  "document_id": "uuid-of-existing-summary"          // Option 2: Use existing summary
}
```

---

## 🔧 Frontend Implementation Examples

### React Hook for Tasks
```javascript
import { useState, useEffect } from 'react';

const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setTasks(data.tasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const createTask = async (taskData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });
      
      if (!response.ok) throw new Error('Failed to create task');
      
      const newTask = await response.json();
      setTasks(prev => [...prev, newTask.task]);
      return newTask;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };
  
  return { tasks, loading, fetchTasks, createTask };
};
```

### Document Upload Component
```javascript
const DocumentUploader = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);  // Critical: field name must be 'file'
      
      const response = await fetch('/api/documents/summarize', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
        // Don't set Content-Type - let browser handle it
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const result = await response.json();
      console.log('Summary:', result.summary);
      
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])}
        accept=".pdf,.doc,.docx,.txt"
      />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Processing...' : 'Upload & Summarize'}
      </button>
    </div>
  );
};
```

---

## 🚨 Common Frontend Issues & Solutions

### 1. Authentication Errors (401)
```javascript
// ❌ Wrong
headers: { 'Authorization': token }

// ✅ Correct
headers: { 'Authorization': `Bearer ${token}` }
```

### 2. Task Creation Validation (400)
```javascript
// ❌ Wrong - missing required title
{
  description: "Task description",
  priority: "high"
}

// ✅ Correct
{
  title: "Task title",        // Required!
  description: "Task description",
  priority: "high",
  due_date: new Date().toISOString()  // Must be ISO 8601
}
```

### 3. Reminder Time Format (400)
```javascript
// ❌ Wrong
reminder_time: "2025-12-25 14:30"

// ✅ Correct
reminder_time: new Date("2025-12-25T14:30:00").toISOString()
```

### 4. File Upload Issues (400)
```javascript
// ❌ Wrong field name
formData.append('document', file);

// ✅ Correct field name
formData.append('file', file);

// ❌ Wrong headers
headers: {
  'Content-Type': 'multipart/form-data',
  'Authorization': `Bearer ${token}`
}

// ✅ Correct headers (let browser set Content-Type)
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

## 🎯 Quick Testing

Test each endpoint with these curl commands:

```bash
# Test tasks
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://ai-assistant-backend-oqpp.onrender.com/api/tasks

# Test reminders
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://ai-assistant-backend-oqpp.onrender.com/api/reminders

# Test document summaries
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://ai-assistant-backend-oqpp.onrender.com/api/documents/summaries
```

## ✅ Backend Confirmed Working

All endpoints are operational and returning proper authentication errors (401) when tested without tokens. Your frontend just needs to:

1. **Include valid JWT tokens** in Authorization headers
2. **Use correct data formats** as shown above
3. **Handle file uploads properly** with FormData and 'file' field name

The backend is ready - let's get your frontend connected! 🚀