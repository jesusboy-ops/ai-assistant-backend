# Production API Endpoints

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 Tasks Management

### Get Tasks
```http
GET /api/tasks
```
**Query Parameters:**
- `status` - pending, in_progress, completed, cancelled
- `priority` - low, medium, high, urgent
- `limit` - number of results (default: 50)
- `offset` - pagination offset (default: 0)

### Create Task
```http
POST /api/tasks
```
**Body:**
```json
{
  "title": "Task title",
  "description": "Task description",
  "priority": "medium",
  "due_date": "2024-12-30T00:00:00.000Z",
  "tags": ["work", "urgent"]
}
```

### Update Task
```http
PUT /api/tasks/:id
```

### Delete Task
```http
DELETE /api/tasks/:id
```

### AI Task Creation
```http
POST /api/tasks/from-message
```
**Body:**
```json
{
  "message": "I need to call the bank and schedule a meeting",
  "messageId": "optional-message-id"
}
```

### Task Enhancements
```http
POST /api/tasks/split/:id
POST /api/tasks/check-overload
POST /api/tasks/suggest-reschedule
POST /api/tasks/auto-reschedule
```

---

## 🧠 Life Admin Manager

### Get Life Obligations
```http
GET /api/life-admin/obligations
```
**Query Parameters:**
- `status` - active, completed, overdue
- `category` - education, finance, work, personal, health, other
- `type` - one_time, recurring

### Create Life Obligation
```http
POST /api/life-admin/obligations
```
**Body:**
```json
{
  "title": "Renew Driver License",
  "category": "personal",
  "type": "one_time",
  "due_date": "2024-06-30T00:00:00.000Z",
  "consequence": "Cannot drive legally",
  "risk_level": "high"
}
```

### Complete Obligation
```http
POST /api/life-admin/obligations/:id/complete
```

### AI Plan Generation
```http
POST /api/life-admin/generate-plan
```
**Body:**
```json
{
  "input": "I need to renew my passport and book flight tickets",
  "context": {}
}
```

### Check Deadlines
```http
POST /api/life-admin/check-deadlines
```

### Get Statistics
```http
GET /api/life-admin/stats
```

---

## 🔔 Reminders

### Get Reminders
```http
GET /api/reminders
```

### Create Reminder
```http
POST /api/reminders
```
**Body:**
```json
{
  "title": "Meeting reminder",
  "description": "Team standup meeting",
  "reminder_time": "2024-12-30T09:00:00.000Z",
  "repeat_type": "weekly"
}
```

---

## 📧 Email

### Generate Email
```http
POST /api/email/generate
```
**Body:**
```json
{
  "prompt": "Write a follow-up email to client",
  "tone": "professional"
}
```

### Send Email
```http
POST /api/email/send
```
**Body:**
```json
{
  "to": "client@example.com",
  "subject": "Project Update",
  "body": "Email content here"
}
```

---

## 📝 Notes

### Get Notes
```http
GET /api/notes
```

### Create Note
```http
POST /api/notes
```
**Body:**
```json
{
  "title": "Meeting Notes",
  "content": "Discussion points and action items",
  "tags": ["meeting", "project"]
}
```

### Analyze Note
```http
POST /api/notes/analyze
```
**Body:**
```json
{
  "content": "Need to submit report by Friday and call client"
}
```

---

## 📅 Calendar

### Get Events
```http
GET /api/calendar/events
```

### Create Event
```http
POST /api/calendar/events
```
**Body:**
```json
{
  "title": "Team Meeting",
  "description": "Weekly standup",
  "start_time": "2024-12-30T10:00:00.000Z",
  "end_time": "2024-12-30T11:00:00.000Z",
  "location": "Conference Room A"
}
```

---

## 🔍 Health Check

### Server Health
```http
GET /health
```

### API Status
```http
GET /api/status
```

---

## 🚀 Production Notes

### Database Requirements
- ✅ All tables must exist in Supabase
- ✅ Row Level Security enabled
- ✅ Proper indexes created

### Environment Variables
```env
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
OPENAI_API_KEY=your-openai-key
JWT_SECRET=your-jwt-secret
```

### No Mock Data
- ✅ All services use real database
- ✅ No mock services in production
- ✅ Proper error handling for missing data

### Setup Command
```bash
npm run setup-production
```

This will verify all tables exist and configuration is correct.