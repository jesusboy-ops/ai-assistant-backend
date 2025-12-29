# Life Admin Manager API Guide

## Overview

The Life Admin Manager is a backend productivity intelligence engine that handles **obligations**, not tasks. It manages real-life responsibilities with deadlines, consequences, and automatic task/reminder generation.

## Core Concepts

### Life Obligations vs Tasks
- **Obligations**: Real-life responsibilities with consequences if missed (renewals, registrations, payments, exams)
- **Tasks**: Simple actionable items without major consequences
- **Automatic Integration**: Obligations generate preparation tasks and reminders automatically

### AI Logic (Non-Chat)
- Detects obligations from user input
- Classifies urgency and consequences  
- Generates structured outputs only (no conversational responses)
- Monitors deadlines and escalates automatically

## API Endpoints

### Base URL
```
/api/life-admin
```

### Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <your_jwt_token>
```

---

## Life Obligations CRUD

### 1. Get All Obligations
```http
GET /api/life-admin/obligations
```

**Query Parameters:**
- `status` (optional): `active`, `completed`, `overdue`
- `category` (optional): `education`, `finance`, `work`, `personal`, `health`, `other`
- `type` (optional): `one_time`, `recurring`
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "obligations": [
    {
      "id": "uuid",
      "title": "Renew Driver License",
      "category": "personal",
      "type": "one_time",
      "due_date": "2024-03-15T00:00:00.000Z",
      "consequence": "Cannot drive legally",
      "status": "active",
      "risk_level": "high",
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### 2. Get Single Obligation
```http
GET /api/life-admin/obligations/:id
```

**Response:**
```json
{
  "obligation": {
    "id": "uuid",
    "title": "Renew Driver License",
    "category": "personal",
    "type": "one_time",
    "due_date": "2024-03-15T00:00:00.000Z",
    "consequence": "Cannot drive legally",
    "status": "active",
    "risk_level": "high"
  }
}
```

### 3. Create New Obligation
```http
POST /api/life-admin/obligations
```

**Request Body:**
```json
{
  "title": "Renew Passport",
  "category": "personal",
  "type": "one_time",
  "due_date": "2024-06-30T00:00:00.000Z",
  "consequence": "Cannot travel internationally",
  "risk_level": "high"
}
```

**Response:**
```json
{
  "obligation": {
    "id": "uuid",
    "title": "Renew Passport",
    "status": "active"
  },
  "message": "Obligation created with automatic tasks and reminders"
}
```

**Automatic Actions:**
- Creates preparation tasks if due date > 3 days away
- Creates reminders based on risk level
- Generates calendar events if needed

### 4. Update Obligation
```http
PUT /api/life-admin/obligations/:id
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "due_date": "2024-07-15T00:00:00.000Z",
  "risk_level": "medium"
}
```

### 5. Delete Obligation
```http
DELETE /api/life-admin/obligations/:id
```

**Response:**
```json
{
  "message": "Obligation deleted successfully"
}
```

### 6. Complete Obligation
```http
POST /api/life-admin/obligations/:id/complete
```

**Response:**
```json
{
  "obligation": {
    "id": "uuid",
    "status": "completed",
    "last_completed_at": "2024-01-15T10:00:00.000Z"
  },
  "message": "Obligation completed successfully"
}
```

**Automatic Actions for Recurring:**
- Generates next cycle obligation
- Creates new tasks and reminders for next cycle

---

## AI Logic Endpoints

### 1. Generate Structured Plan
```http
POST /api/life-admin/generate-plan
```

**Request Body:**
```json
{
  "input": "I need to renew my passport by March 15th and book flight tickets for my trip",
  "context": {
    "urgent": true,
    "category": "travel"
  }
}
```

**Response (Structured JSON Only):**
```json
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

---

## Monitoring & Automation

### 1. Check Deadlines
```http
POST /api/life-admin/check-deadlines
```

**Response:**
```json
{
  "overdue_count": 2,
  "urgent_count": 5,
  "escalated_reminders": 3
}
```

**Automatic Actions:**
- Marks overdue obligations
- Creates escalated reminders for high-risk items
- Sends push notifications for urgent items

### 2. Renew Recurring Obligations
```http
POST /api/life-admin/renew-recurring
```

**Response:**
```json
{
  "renewed_count": 4,
  "message": "4 recurring obligations renewed"
}
```

**Automatic Actions:**
- Generates next cycle for completed recurring obligations
- Creates new preparation tasks and reminders

---

## Statistics

### Get Comprehensive Stats
```http
GET /api/life-admin/stats
```

**Response:**
```json
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

## Integration Features

### Email Generation
When AI detects email needs, it returns structured email data:

```json
{
  "emails": [
    {
      "to": "recipient@example.com",
      "subject": "Follow-up Required",
      "body": "Email content here",
      "draft": true
    }
  ]
}
```

**Email Actions:**
- Save as draft
- Send with confirmation
- Create follow-up reminder after sending

### Task Integration
Generated tasks automatically integrate with existing task system:

```json
{
  "tasks": [
    {
      "title": "Gather documents for passport renewal",
      "description": "Collect birth certificate, photos, and current passport",
      "priority": "high",
      "ai_generated": true
    }
  ]
}
```

**Task Features:**
- Auto-split large tasks into subtasks
- Prevent more than 3 high-priority tasks per day
- Suggest rescheduling if overloaded

### Reminder Integration
Reminders are created based on obligation risk level:

- **High Risk**: Reminders at 14, 7, 3, 1 days before
- **Medium Risk**: Reminders at 7, 3, 1 days before  
- **Low Risk**: Reminders at 3, 1 days before

---

## Cron Jobs (Automatic Background Processing)

### Daily Jobs (9 AM)
- Check for overdue obligations
- Mark status as overdue
- Create escalated reminders for high-risk items

### Hourly Jobs
- Check urgent deadlines (within 24 hours)
- Send push notifications for critical items

### Daily Renewal (8 AM)
- Process completed recurring obligations
- Generate next cycle obligations
- Create new tasks and reminders

---

## Error Responses

### Validation Errors
```json
{
  "errors": [
    {
      "field": "due_date",
      "message": "Valid due date is required"
    }
  ]
}
```

### Not Found
```json
{
  "error": "Obligation not found"
}
```

### Server Error
```json
{
  "error": "Failed to create obligation"
}
```

---

## Usage Examples

### Creating a High-Risk Obligation
```javascript
const obligation = await fetch('/api/life-admin/obligations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Submit Tax Returns',
    category: 'finance',
    type: 'one_time',
    due_date: '2024-04-15T00:00:00.000Z',
    consequence: 'Late fees and penalties from IRS',
    risk_level: 'high'
  })
});
```

### AI Plan Generation
```javascript
const plan = await fetch('/api/life-admin/generate-plan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    input: "Need to register for fall semester classes by July 1st, also need to apply for financial aid",
    context: { category: 'education' }
  })
});
```

### Monitoring Dashboard
```javascript
const stats = await fetch('/api/life-admin/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const deadlineCheck = await fetch('/api/life-admin/check-deadlines', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Key Features Summary

✅ **Obligation Management**: Create, update, complete real-life responsibilities  
✅ **Automatic Task Generation**: Creates preparation tasks based on category and timeline  
✅ **Smart Reminders**: Risk-based reminder scheduling  
✅ **Recurring Obligations**: Automatic renewal and regeneration  
✅ **Deadline Monitoring**: Background jobs for overdue detection  
✅ **AI Plan Generation**: Structured output from natural language input  
✅ **Email Integration**: Draft generation and follow-up reminders  
✅ **Task Overload Prevention**: Smart scheduling and rescheduling  
✅ **Notes Analysis**: Extract actions and deadlines from notes  
✅ **Push Notifications**: Critical deadline alerts  

The Life Admin Manager operates as a quiet, intelligent operations engine focused on execution, prevention, and follow-through - not conversation.