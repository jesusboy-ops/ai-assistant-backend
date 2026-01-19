# 📋 Frontend Data Formats Guide

## Base URL
```
https://ai-assistant-backend-oqpp.onrender.com/api
```

## Authentication
All requests require JWT token:
```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

---

# 📋 **TASKS DATA FORMATS**

## **Create Task**
```http
POST /api/tasks
```

### **Request Format:**
```javascript
{
  "title": "Complete project proposal",           // Required: string, max 255 chars
  "description": "Finish the Q1 project proposal", // Optional: string
  "priority": "medium",                           // Optional: "low" | "medium" | "high" | "urgent"
  "due_date": "2024-12-30T17:00:00.000Z",       // Optional: ISO 8601 date string
  "tags": ["work", "urgent"]                      // Optional: array of strings
}
```

### **Response Format:**
```javascript
{
  "task": {
    "id": "uuid-string",
    "user_id": "uuid-string", 
    "title": "Complete project proposal",
    "description": "Finish the Q1 project proposal",
    "status": "pending",                          // "pending" | "in_progress" | "completed" | "cancelled"
    "priority": "medium",
    "due_date": "2024-12-30T17:00:00.000Z",
    "tags": ["work", "urgent"],
    "ai_generated": false,
    "source_message_id": null,
    "created_at": "2024-12-29T10:00:00.000Z",
    "updated_at": "2024-12-29T10:00:00.000Z"
  }
}
```

## **Update Task**
```http
PUT /api/tasks/:id
```

### **Request Format:**
```javascript
{
  "title": "Updated task title",                  // Optional: string
  "description": "Updated description",           // Optional: string
  "status": "in_progress",                       // Optional: "pending" | "in_progress" | "completed" | "cancelled"
  "priority": "high",                            // Optional: "low" | "medium" | "high" | "urgent"
  "due_date": "2024-12-31T17:00:00.000Z",      // Optional: ISO 8601 date string
  "tags": ["work", "updated"]                    // Optional: array of strings
}
```

## **Get Tasks**
```http
GET /api/tasks?status=pending&priority=high&limit=20&offset=0
```

### **Query Parameters:**
- `status`: "pending" | "in_progress" | "completed" | "cancelled"
- `priority`: "low" | "medium" | "high" | "urgent"  
- `limit`: number (default: 50)
- `offset`: number (default: 0)

### **Response Format:**
```javascript
{
  "tasks": [
    {
      "id": "uuid-string",
      "title": "Task title",
      "description": "Task description", 
      "status": "pending",
      "priority": "medium",
      "due_date": "2024-12-30T17:00:00.000Z",
      "tags": ["tag1", "tag2"],
      "created_at": "2024-12-29T10:00:00.000Z"
    }
  ]
}
```

## **AI Task Creation**
```http
POST /api/tasks/from-message
```

### **Request Format:**
```javascript
{
  "message": "I need to call the bank, schedule a meeting with John, and buy groceries",
  "messageId": "optional-message-id"             // Optional: string
}
```

### **Response Format:**
```javascript
{
  "tasks": [
    {
      "id": "uuid-string",
      "title": "Call the bank",
      "description": "Contact bank regarding account",
      "priority": "medium",
      "ai_generated": true,
      "source_message_id": "optional-message-id"
    }
  ],
  "message": "Created 3 task(s) from your message"
}
```

---

# 🧠 **LIFE ADMIN MANAGER DATA FORMATS**

## **Create Life Obligation**
```http
POST /api/life-admin/obligations
```

### **Request Format:**
```javascript
{
  "title": "Renew Driver License",               // Required: string, max 255 chars
  "category": "personal",                        // Required: "education" | "finance" | "work" | "personal" | "health" | "other"
  "type": "one_time",                           // Required: "one_time" | "recurring"
  "frequency": null,                            // Optional: "daily" | "weekly" | "monthly" | "yearly" (only for recurring)
  "due_date": "2024-06-30T00:00:00.000Z",     // Required: ISO 8601 date string
  "consequence": "Cannot drive legally",         // Optional: string
  "risk_level": "high"                          // Optional: "low" | "medium" | "high" (default: "medium")
}
```

### **Response Format:**
```javascript
{
  "obligation": {
    "id": "uuid-string",
    "user_id": "uuid-string",
    "title": "Renew Driver License",
    "category": "personal",
    "type": "one_time", 
    "frequency": null,
    "due_date": "2024-06-30T00:00:00.000Z",
    "consequence": "Cannot drive legally",
    "status": "active",                         // "active" | "completed" | "overdue"
    "risk_level": "high",
    "last_completed_at": null,
    "created_at": "2024-12-29T10:00:00.000Z",
    "updated_at": "2024-12-29T10:00:00.000Z"
  },
  "message": "Obligation created with automatic tasks and reminders"
}
```

## **Recurring Obligation Example**
```javascript
{
  "title": "Pay Monthly Rent",
  "category": "finance",
  "type": "recurring",
  "frequency": "monthly",                       // Required for recurring
  "due_date": "2024-01-01T00:00:00.000Z",     // First occurrence
  "consequence": "Late fees and eviction risk",
  "risk_level": "high"
}
```

## **Update Life Obligation**
```http
PUT /api/life-admin/obligations/:id
```

### **Request Format:**
```javascript
{
  "title": "Updated obligation title",           // Optional: string
  "category": "finance",                        // Optional: category enum
  "due_date": "2024-07-15T00:00:00.000Z",     // Optional: ISO 8601 date
  "consequence": "Updated consequence",          // Optional: string
  "risk_level": "medium"                        // Optional: risk level enum
}
```

## **Get Life Obligations**
```http
GET /api/life-admin/obligations?status=active&category=finance&type=recurring
```

### **Query Parameters:**
- `status`: "active" | "completed" | "overdue"
- `category`: "education" | "finance" | "work" | "personal" | "health" | "other"
- `type`: "one_time" | "recurring"
- `limit`: number (default: 50)
- `offset`: number (default: 0)

### **Response Format:**
```javascript
{
  "obligations": [
    {
      "id": "uuid-string",
      "title": "Renew Passport",
      "category": "personal",
      "type": "one_time",
      "due_date": "2024-06-30T00:00:00.000Z",
      "consequence": "Cannot travel",
      "status": "active",
      "risk_level": "high",
      "created_at": "2024-12-29T10:00:00.000Z"
    }
  ]
}
```

## **Complete Obligation**
```http
POST /api/life-admin/obligations/:id/complete
```

### **Request Format:**
```javascript
// No body required
```

### **Response Format:**
```javascript
{
  "obligation": {
    "id": "uuid-string",
    "status": "completed",
    "last_completed_at": "2024-12-29T10:00:00.000Z"
  },
  "message": "Obligation completed successfully"
}
```

## **AI Plan Generation**
```http
POST /api/life-admin/generate-plan
```

### **Request Format:**
```javascript
{
  "input": "I need to renew my passport by March 15th and book flight tickets for my trip",
  "context": {                                 // Optional: object
    "urgent": true,
    "category": "travel"
  }
}
```

### **Response Format:**
```javascript
{
  "obligations": [
    {
      "title": "Renew passport by March 15th",
      "category": "personal",
      "type": "one_time",
      "due_date": "2024-03-15T00:00:00.000Z",
      "risk_level": "high"
    }
  ],
  "tasks": [
    {
      "title": "Book flight tickets",
      "priority": "high",
      "ai_generated": true
    }
  ],
  "reminders": [],
  "emails": [],
  "calendar_events": []
}
```

## **Get Statistics**
```http
GET /api/life-admin/stats
```

### **Response Format:**
```javascript
{
  "obligations": {
    "total": 15,
    "active": 10,
    "completed": 3,
    "overdue": 2,
    "high_risk": 5,
    "due_soon": 3
  },
  "tasks": {
    "total": 25,
    "pending": 15,
    "completed": 10,
    "high_priority": 8
  },
  "reminders": {
    "total": 20,
    "active": 15,
    "upcoming": 8,
    "overdue": 2
  }
}
```

---

# 🔍 **VALIDATION RULES**

## **Tasks Validation:**
- `title`: Required, max 255 characters
- `description`: Optional, any length
- `priority`: Must be one of: "low", "medium", "high", "urgent"
- `due_date`: Must be valid ISO 8601 date string
- `tags`: Array of strings

## **Life Obligations Validation:**
- `title`: Required, max 255 characters
- `category`: Required, must be one of: "education", "finance", "work", "personal", "health", "other"
- `type`: Required, must be one of: "one_time", "recurring"
- `frequency`: Required if type is "recurring", must be one of: "daily", "weekly", "monthly", "yearly"
- `due_date`: Required, must be valid ISO 8601 date string
- `risk_level`: Must be one of: "low", "medium", "high"

---

# 🚨 **ERROR RESPONSES**

## **Validation Error (400):**
```javascript
{
  "errors": [
    {
      "field": "due_date",
      "message": "Valid due date is required"
    }
  ]
}
```

## **Authentication Error (401):**
```javascript
{
  "success": false,
  "error": {
    "message": "Authorization header is required",
    "code": "NO_AUTH_HEADER",
    "statusCode": 401
  }
}
```

## **Not Found Error (404):**
```javascript
{
  "error": "Task not found"
}
```

## **Server Error (500):**
```javascript
{
  "error": "Failed to create task"
}
```

---

# 💡 **FRONTEND INTEGRATION EXAMPLES**

## **React/JavaScript Example:**

### **Create Task:**
```javascript
const createTask = async (taskData) => {
  const response = await fetch('https://ai-assistant-backend-oqpp.onrender.com/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority || 'medium',
      due_date: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
      tags: taskData.tags || []
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create task');
  }
  
  return await response.json();
};
```

### **Create Life Obligation:**
```javascript
const createObligation = async (obligationData) => {
  const response = await fetch('https://ai-assistant-backend-oqpp.onrender.com/api/life-admin/obligations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      title: obligationData.title,
      category: obligationData.category,
      type: obligationData.type,
      frequency: obligationData.type === 'recurring' ? obligationData.frequency : null,
      due_date: new Date(obligationData.dueDate).toISOString(),
      consequence: obligationData.consequence,
      risk_level: obligationData.riskLevel || 'medium'
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create obligation');
  }
  
  return await response.json();
};
```

### **Get Tasks with Filtering:**
```javascript
const getTasks = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);
  
  const response = await fetch(`https://ai-assistant-backend-oqpp.onrender.com/api/tasks?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  
  return await response.json();
};
```

This guide provides all the exact data formats your frontend needs to communicate with the backend! 🚀