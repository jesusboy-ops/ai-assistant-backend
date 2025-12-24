# API Examples

Complete examples for testing all API endpoints.

## Base URL
```
Local: http://localhost:5000
Production: https://your-app.onrender.com
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 1. Authentication Endpoints

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123",
    "name": "John Doe"
  }'
```

Response:
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john@example.com",
    "name": "John Doe",
    "email_verified": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

### Google OAuth Login
```bash
curl -X POST http://localhost:5000/api/auth/oauth/google \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "google-id-token-here"
  }'
```

### Request Password Reset
```bash
curl -X POST http://localhost:5000/api/auth/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

### Reset Password
```bash
curl -X POST http://localhost:5000/api/auth/password-reset/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset-token-from-email",
    "newPassword": "newpassword123"
  }'
```

### Verify Email
```bash
curl -X GET "http://localhost:5000/api/auth/verify-email?token=verification-token"
```

### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 2. User Profile Endpoints

### Get Profile
```bash
curl -X GET http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Profile
```bash
curl -X PUT http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "johnsmith@example.com"
  }'
```

### Upload Profile Picture
```bash
curl -X POST http://localhost:5000/api/user/profile/picture \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/photo.jpg"
```

### Change Password
```bash
curl -X POST http://localhost:5000/api/user/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpassword123",
    "newPassword": "newpassword123"
  }'
```

### Delete Account
```bash
curl -X DELETE http://localhost:5000/api/user/account \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 3. AI Chat Endpoints

### Send Message
```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is artificial intelligence?",
    "conversationId": "optional-conversation-id"
  }'
```

Response:
```json
{
  "conversationId": "123e4567-e89b-12d3-a456-426614174000",
  "message": "Artificial intelligence (AI) is...",
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 150,
    "total_tokens": 170
  }
}
```

### Get All Conversations
```bash
curl -X GET http://localhost:5000/api/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Conversation History
```bash
curl -X GET http://localhost:5000/api/chat/conversations/CONVERSATION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Delete Conversation
```bash
curl -X DELETE http://localhost:5000/api/chat/conversations/CONVERSATION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 4. Email Endpoints

### Generate Email with AI
```bash
curl -X POST http://localhost:5000/api/email/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a professional email to request a meeting with my manager",
    "tone": "professional"
  }'
```

Response:
```json
{
  "subject": "Request for Meeting",
  "body": "Dear Manager,\n\nI hope this email finds you well...",
  "fullContent": "Subject: Request for Meeting\n\nDear Manager..."
}
```

### Send Email
```bash
curl -X POST http://localhost:5000/api/email/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Meeting Request",
    "body": "<p>Dear Manager,</p><p>I would like to schedule a meeting...</p>"
  }'
```

### Generate and Send Email
```bash
curl -X POST http://localhost:5000/api/email/generate-and-send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "prompt": "Write a thank you email for the interview",
    "tone": "professional"
  }'
```

---

## 5. Calendar Endpoints

### Create Event
```bash
curl -X POST http://localhost:5000/api/calendar/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Meeting",
    "description": "Weekly team sync",
    "start_time": "2024-12-15T10:00:00Z",
    "end_time": "2024-12-15T11:00:00Z",
    "location": "Conference Room A",
    "reminder": 15
  }'
```

### Get All Events
```bash
curl -X GET http://localhost:5000/api/calendar/events \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Events in Date Range
```bash
curl -X GET "http://localhost:5000/api/calendar/events?start=2024-12-01&end=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Single Event
```bash
curl -X GET http://localhost:5000/api/calendar/events/EVENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Event
```bash
curl -X PUT http://localhost:5000/api/calendar/events/EVENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Team Meeting",
    "start_time": "2024-12-15T14:00:00Z",
    "end_time": "2024-12-15T15:00:00Z"
  }'
```

### Delete Event
```bash
curl -X DELETE http://localhost:5000/api/calendar/events/EVENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 6. Notes Endpoints

### Create Note
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Project Ideas",
    "content": "1. Build an AI assistant\n2. Create a mobile app\n3. Learn React",
    "tags": ["work", "ideas", "projects"]
  }'
```

### Get All Notes
```bash
curl -X GET http://localhost:5000/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Search Notes
```bash
curl -X GET "http://localhost:5000/api/notes?search=project" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Tag
```bash
curl -X GET "http://localhost:5000/api/notes?tag=work" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Single Note
```bash
curl -X GET http://localhost:5000/api/notes/NOTE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Note
```bash
curl -X PUT http://localhost:5000/api/notes/NOTE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Project Ideas",
    "content": "New content here",
    "tags": ["work", "updated"]
  }'
```

### Delete Note
```bash
curl -X DELETE http://localhost:5000/api/notes/NOTE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 7. File Upload Endpoints

### Upload File
```bash
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "provider=supabase" \
  -F "folder=documents"
```

Response:
```json
{
  "id": "file-id",
  "url": "https://storage.url/file.pdf",
  "filename": "document.pdf",
  "size": 102400,
  "mimetype": "application/pdf"
}
```

### Get User Files
```bash
curl -X GET http://localhost:5000/api/upload/files \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Limited Files
```bash
curl -X GET "http://localhost:5000/api/upload/files?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Delete File
```bash
curl -X DELETE http://localhost:5000/api/upload/files/FILE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 8. Notification Endpoints

### Get VAPID Public Key
```bash
curl -X GET http://localhost:5000/api/notifications/vapid-public-key
```

### Subscribe to Notifications
```bash
curl -X POST http://localhost:5000/api/notifications/subscribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subscription": {
      "endpoint": "https://fcm.googleapis.com/fcm/send/...",
      "keys": {
        "p256dh": "key-here",
        "auth": "auth-here"
      }
    }
  }'
```

### Send Test Notification
```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test message"
  }'
```

### Unsubscribe
```bash
curl -X POST http://localhost:5000/api/notifications/unsubscribe \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 9. Voice Endpoints

### Text to Speech
```bash
curl -X POST http://localhost:5000/api/voice/text-to-speech \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test of text to speech",
    "voice": "alloy"
  }' \
  --output speech.mp3
```

### Speech to Text
```bash
curl -X POST http://localhost:5000/api/voice/speech-to-text \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@/path/to/audio.mp3"
```

Response:
```json
{
  "text": "This is the transcribed text from the audio file"
}
```

### Get Available Voices
```bash
curl -X GET http://localhost:5000/api/voice/voices \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "voices": [
    { "id": "alloy", "name": "Alloy", "description": "Neutral and balanced" },
    { "id": "echo", "name": "Echo", "description": "Male voice" },
    { "id": "fable", "name": "Fable", "description": "British accent" },
    { "id": "onyx", "name": "Onyx", "description": "Deep male voice" },
    { "id": "nova", "name": "Nova", "description": "Female voice" },
    { "id": "shimmer", "name": "Shimmer", "description": "Soft female voice" }
  ]
}
```

---

## Testing with JavaScript (Fetch API)

### Register User
```javascript
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  })
});

const data = await response.json();
console.log(data);
```

### Send Chat Message
```javascript
const token = 'your-jwt-token';

const response = await fetch('http://localhost:5000/api/chat/message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: 'Hello AI!'
  })
});

const data = await response.json();
console.log(data.message);
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding rate limiting middleware.

## Pagination

Currently not implemented. All list endpoints return all results. Consider adding pagination for production.

## Tips

1. Save your JWT token after login/register
2. Use environment variables for the base URL
3. Handle errors gracefully in your frontend
4. Test with small files first for uploads
5. Use proper MIME types for file uploads

---

## 10. Tasks Endpoints (AI Task & To-Do Manager)

### Get All Tasks
```bash
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Tasks with Filters
```bash
curl -X GET "http://localhost:5000/api/tasks?status=pending&priority=high&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Single Task
```bash
curl -X GET http://localhost:5000/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project proposal",
    "description": "Write and submit the Q1 project proposal",
    "priority": "high",
    "due_date": "2024-12-20T17:00:00Z",
    "tags": ["work", "urgent", "proposal"]
  }'
```

Response:
```json
{
  "task": {
    "id": "task-id",
    "title": "Complete project proposal",
    "description": "Write and submit the Q1 project proposal",
    "status": "pending",
    "priority": "high",
    "due_date": "2024-12-20T17:00:00Z",
    "tags": ["work", "urgent", "proposal"],
    "ai_generated": false,
    "created_at": "2024-12-15T10:00:00Z"
  }
}
```

### Update Task
```bash
curl -X PUT http://localhost:5000/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "priority": "medium"
  }'
```

### Delete Task
```bash
curl -X DELETE http://localhost:5000/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Tasks from Message (AI Integration)
```bash
curl -X POST http://localhost:5000/api/tasks/from-message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I need to call the client tomorrow at 2pm, finish the report by Friday, and schedule a team meeting next week",
    "messageId": "optional-message-id"
  }'
```

Response:
```json
{
  "tasks": [
    {
      "id": "task-1",
      "title": "Call the client",
      "description": "Contact client as discussed",
      "priority": "medium",
      "due_date": "2024-12-16T14:00:00Z",
      "ai_generated": true
    },
    {
      "id": "task-2", 
      "title": "Finish the report",
      "priority": "high",
      "due_date": "2024-12-20T17:00:00Z",
      "ai_generated": true
    }
  ],
  "message": "Created 2 task(s) from your message"
}
```

### Get AI Task Suggestions
```bash
curl -X POST http://localhost:5000/api/tasks/suggestions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "context": "I have been working on a web development project and need to prepare for client presentation"
  }'
```

Response:
```json
{
  "suggestions": [
    {
      "title": "Prepare presentation slides",
      "description": "Create slides for client presentation",
      "priority": "high",
      "tags": ["presentation", "client"],
      "reason": "Based on your upcoming client presentation"
    },
    {
      "title": "Test application thoroughly",
      "description": "Perform end-to-end testing before demo",
      "priority": "high",
      "tags": ["testing", "demo"],
      "reason": "Ensure smooth demo experience"
    }
  ]
}
```

---

## 11. Reminders Endpoints (Smart Reminders System)

### Get All Reminders
```bash
curl -X GET http://localhost:5000/api/reminders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Upcoming Reminders (Next 24 Hours)
```bash
curl -X GET http://localhost:5000/api/reminders/upcoming \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Single Reminder
```bash
curl -X GET http://localhost:5000/api/reminders/REMINDER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Reminder
```bash
curl -X POST http://localhost:5000/api/reminders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Take medication",
    "description": "Take daily vitamins",
    "reminder_time": "2024-12-16T08:00:00Z",
    "repeat_type": "daily",
    "repeat_interval": 1
  }'
```

Response:
```json
{
  "reminder": {
    "id": "reminder-id",
    "title": "Take medication",
    "description": "Take daily vitamins",
    "reminder_time": "2024-12-16T08:00:00Z",
    "repeat_type": "daily",
    "repeat_interval": 1,
    "is_active": true,
    "ai_generated": false,
    "created_at": "2024-12-15T10:00:00Z"
  }
}
```

### Update Reminder
```bash
curl -X PUT http://localhost:5000/api/reminders/REMINDER_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reminder_time": "2024-12-16T09:00:00Z",
    "is_active": false
  }'
```

### Delete Reminder
```bash
curl -X DELETE http://localhost:5000/api/reminders/REMINDER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Reminders from Message (AI Integration)
```bash
curl -X POST http://localhost:5000/api/reminders/from-message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Remind me to call mom tomorrow at 3pm and to pay bills on Friday",
    "messageId": "optional-message-id"
  }'
```

Response:
```json
{
  "reminders": [
    {
      "id": "reminder-1",
      "title": "Call mom",
      "reminder_time": "2024-12-16T15:00:00Z",
      "ai_generated": true
    },
    {
      "id": "reminder-2",
      "title": "Pay bills", 
      "reminder_time": "2024-12-20T09:00:00Z",
      "ai_generated": true
    }
  ],
  "message": "Created 2 reminder(s) from your message"
}
```

---

## 12. Document Summarizer Endpoints

### Summarize Document
```bash
curl -X POST http://localhost:5000/api/documents/summarize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/document.pdf"
```

Response:
```json
{
  "summary": {
    "id": "summary-id",
    "filename": "document.pdf",
    "summary": "This document discusses the quarterly financial results...",
    "key_points": [
      "Revenue increased by 15% compared to last quarter",
      "New product launch scheduled for Q2",
      "Cost reduction initiatives implemented"
    ],
    "word_count": 1250,
    "file_type": "application/pdf",
    "processing_status": "completed",
    "created_at": "2024-12-15T10:00:00Z"
  },
  "message": "Document summarized successfully"
}
```

### Get All Document Summaries
```bash
curl -X GET http://localhost:5000/api/documents/summaries \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Single Document Summary
```bash
curl -X GET http://localhost:5000/api/documents/summaries/SUMMARY_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Delete Document Summary
```bash
curl -X DELETE http://localhost:5000/api/documents/summaries/SUMMARY_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Extract Key Points from Text
```bash
curl -X POST http://localhost:5000/api/documents/key-points \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Long text content to extract key points from..."
  }'
```

### Extract Key Points from Existing Document
```bash
curl -X POST http://localhost:5000/api/documents/key-points \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": "existing-summary-id"
  }'
```

Response:
```json
{
  "key_points": [
    "Main point 1 extracted from the text",
    "Important insight 2",
    "Critical conclusion 3",
    "Actionable item 4"
  ]
}
```

## New Features Summary

The three new features have been successfully implemented:

### ✅ AI Task & To-Do Manager
- **Endpoints**: GET/POST/PUT/DELETE `/api/tasks`, POST `/api/tasks/from-message`, POST `/api/tasks/suggestions`
- **Features**: Task CRUD operations, AI task extraction from messages, intelligent task suggestions
- **Database**: New `tasks` table with status tracking, priorities, due dates, and AI integration

### ✅ Smart Reminders System  
- **Endpoints**: GET/POST/PUT/DELETE `/api/reminders`, POST `/api/reminders/from-message`, GET `/api/reminders/upcoming`
- **Features**: Reminder CRUD operations, AI reminder extraction, recurring reminders, upcoming reminders view
- **Database**: New `reminders` table with repeat patterns and activation status

### ✅ File & Document Summarizer
- **Endpoints**: POST `/api/documents/summarize`, GET `/api/documents/summaries`, POST `/api/documents/key-points`
- **Features**: Document upload and AI summarization, key point extraction, summary storage and retrieval
- **Database**: New `document_summaries` table with file metadata and AI-generated content

All features include proper authentication, validation, error handling, and AI integration using OpenAI GPT models.