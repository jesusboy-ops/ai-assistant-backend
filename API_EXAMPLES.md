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
