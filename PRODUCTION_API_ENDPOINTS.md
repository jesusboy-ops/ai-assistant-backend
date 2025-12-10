# Production API Endpoints

**Base URL**: `https://ai-assistant-backend-oqpp.onrender.com`

**Status**: ✅ Live and Operational

---

## 📋 Table of Contents

1. [Authentication](#authentication) - 7 endpoints
2. [User Profile](#user-profile) - 5 endpoints
3. [AI Chat](#ai-chat) - 4 endpoints
4. [Email](#email) - 3 endpoints
5. [Calendar](#calendar) - 5 endpoints
6. [Notes](#notes) - 5 endpoints
7. [File Upload](#file-upload) - 3 endpoints
8. [Notifications](#notifications) - 4 endpoints
9. [Voice](#voice) - 3 endpoints

**Total: 39 API Endpoints**

---

## 🔐 Authentication

All protected endpoints require this header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### 1. Register User
```http
POST https://ai-assistant-backend-oqpp.onrender.com/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "email_verified": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login User
```http
POST https://ai-assistant-backend-oqpp.onrender.com/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 3. Google OAuth Login
```http
POST https://ai-assistant-backend-oqpp.onrender.com/api/auth/oauth/google
Content-Type: application/json

{
  "idToken": "google-id-token-here"
}
```

### 4. Request Password Reset
```http
POST https://ai-assistant-backend-oqpp.onrender.com/api/auth/password-reset/request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### 5. Confirm Password Reset
```http
POST https://ai-assistant-backend-oqpp.onrender.com/api/auth/password-reset/confirm
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

### 6. Verify Email
```http
GET https://ai-assistant-backend-oqpp.onrender.com/api/auth/verify-email?token=verification-token
```

### 7. Get Current User
```http
GET https://ai-assistant-backend-oqpp.onrender.com/api/auth/me
Authorization: Bearer YOUR_TOKEN
```

---

## 👤 User Profile

### 1. Get Profile
```http
GET https://ai-assistant-backend-oqpp.onrender.com/api/user/profile
Authorization: Bearer YOUR_TOKEN
```

### 2. Update Profile
```http
PUT https://ai-assistant-backend-oqpp.onrender.com/api/user/profile
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "John Smith",
  "email": "newemail@example.com"
}
```

### 3. Upload Profile Picture
```http
POST https://ai-assistant-backend-oqpp.onrender.com/api/user/profile/picture
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

image: [file]
```

### 4. Change Password
```http
POST https://ai-assistant-backend-oqpp.onrender.com/api/user/change-password
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

### 5. Delete Account
```http
DELETE https://ai-assistant-backend-oqpp.onrender.com/api/user/account
Authorization: Bearer YOUR_TOKEN
```

---

## 🤖 AI Chat

### 1. Send Message to AI
```http
POST https://ai-assistant-backend-oqpp.onrender.com/api/chat/message
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "message": "What is artificial intelligence?",
  "conversationId": "optional-conversation-id"
}
```

**Response:**
```json
{
  "conversationId": "uuid",
  "message": "AI response here...",
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 150,
    "total_tokens": 170
  }
}
```

### 2. Get All Conversations
```http
GET https://ai-assistant-backend-oqpp.onrender.com/api/chat/conversations
Authorization: Bearer YOUR_TOKEN
```

### 3. Get Conversation History
```http
GET https://ai-assistant-backend-oqpp.onrender.com/api/chat/conversations/{conversationId}
Authorization: Bearer YOUR_TOKEN
```

### 4. Delete Conversation
```http
DELETE https://ai-assistant-backend-oqpp.onrender.com/api/chat/conversations/{conversationId}
Authorization: Bearer YOUR_TOKEN
```

---

## 📧 Email

### 1. Generate Email with AI
```http
POST https://ai-assistant-backend-oqpp.onrender.com/api/email/generate
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "prompt": "Write a professional email to request a meeting",
  "tone": "professional"
}
```

**Tone options:** `professional`, `casual`, `formal`, `friendly`

**Response:**
```json
{
  "subject": "Meeting Request",
  "body": "Email content here...",
  "fullContent": "Complete email with subject..."
}
```

### 2. Send Email
```http
POST https://ai-assistant-backend-oqpp.onrender.com/api/email/send
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Meeting Request",
  "body": "<p>Email content here...</p>"
}
```

### 3. Generate and Send Email
```http
POST https://ai-assistant-backend-oqpp.onrender.com/api/email/generate-and-send
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "to": "recipient@example.com",
  "prompt": "Write a thank you email for the interview",
  "tone": "professional"
}
```

---

## 📅 Calendar

### 1. Create Event
```http
POST https://ai-assistant-backend-oqpp.onrender.com/api/calendar/events
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Team Meeting",
  "description": "Weekly team sync",
  "start_time": "2024-12-15T10:00:00Z",
  "end_time": "2024-12-15T11:00:00Z",
  "location": "Conference Room A",
  "reminder": 15
}
```

### 2. Get All Events
```http
GET https://ai-assistant-backend-oqpp.onrender.com/api/calendar/events
Authorization: Bearer YOUR_TOKEN
```

**With date range:**
```http
GET https://ai-assistant-backend-oqpp.onrender.com/api/calendar/events?start=2024-12-01&end=2024-12-31
Authorization: Bearer YOUR_TOKEN
```

### 3. Get Single Event
```http
GET https://ai-assistant-backend-oqpp.onrender.com/api/calendar/events/{eventId}
Authorization: Bearer YOUR_TOKEN
```

### 4. Update Event
```http
PUT https://ai-assistant-backend-oqpp.onrender.com/api/calendar/events/{eventId}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Updated Team Meeting",
  "start_time": "2024-12-15T14:00:00Z"
}
```

### 5. Delete Event
```http
DELETE https://ai-assistant-backend-oqpp.onrender.com/api/calendar/events/{eventId}
Authorization: Bearer YOUR_TOKEN
```

---

## 📝 Notes

### 1. Create Note
```http
POST https://ai-assistant-backend-oqpp.onrender.com/api/notes
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Project Ideas",
  "content": "1. Build an AI assistant\n2. Create a mobile app",
  "tags": ["work", "ideas", "projects"]
}
```

### 2. Get All Notes
```http
GET https://ai-assistant-backend-oqpp.onrender.com/api/notes
Authorization: Bearer YOUR_TOKEN
```

**With search:**
```http
GET https://ai-assistant-backend-oqpp.onrender.com/api/notes?search=project
Authorization: Bearer YOUR_TOKEN
```

**Filter by tag:**
```http
GET https://ai-assistant-backend-oqpp.onrender.com/api/notes?tag=work
Authorization: Bearer YOUR_TOKEN
```

### 3. Get Single Note
```http
GET https://ai-assistant-backend-oqpp.onrender.com/api/notes/{noteId}
Authorization: Bearer YOUR_TOKEN
```

### 4. Update Note
```http
PUT https://ai-assistant-backend-oqpp.onrender.com/api/notes/{noteId}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Updated Project Ideas",
  "content": "New content here",
  "tags": ["work", "updated"]
}
```

### 5. Delete Note
```http
DELETE https://ai-assistant-backend-oqpp.onrender.com/api/notes/{noteId}
Authorization: Bearer YOUR_TOKEN
```

---

## 📁 File Upload

### 1. Upload File
```http
POST https://ai-assistant-backend-oqpp.onrender.com/api/upload
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

file: [file]
provider: supabase (or cloudinary)
folder: documents
```

**Supported file types:**
- Images: JPEG, JPG, PNG, GIF
- Documents: PDF, DOC, DOCX, TXT
- Audio: MP3, WAV
- Video: MP4

**Max file size:** 10MB

**Response:**
```json
{
  "id": "file-id",
  "url": "https://storage.url/file.pdf",
  "filename": "document.pdf",
  "size": 102400,
  "mimetype": "application/pdf"
}
```

### 2. Get User Files
```http
GET https://ai-assistant-backend-oqpp.onrender.com/api/upload/files
Authorization: Bearer YOUR_TOKEN
```

**With limit:**
```http
GET https://ai-assistant-backend-oqpp.onrender.com/api/upload/files?limit=10
Authorization: Bearer YOUR_TOKEN
```

### 3. Delete File
```http
DELETE https://ai-assistant-backend-oqpp.onrender.com/api/upload/files/{fileId}
Authorization: Bearer YOUR_TOKEN
```

---

## 🔔 Notifications

### 1. Get VAPID Public Key
```http
GET https://ai-assistant-backend-oqpp.onrender.com/api/notifications/vapid-public-key
```

**No authentication required**

### 2. Subscribe to Notifications
```http
POST https://ai-assistant-backend-oqpp.onrender.com/api/notifications/subscribe
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "key-here",
      "auth": "auth-here"
    }
  }
}
```

### 3. Send Test Notification
```http
POST https://ai-assistant-backend-oqpp.onrender.com/api/notifications/test
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Test Notification",
  "body": "This is a test message"
}
```

### 4. Unsubscribe from Notifications
```http
POST https://ai-assistant-backend-oqpp.onrender.com/api/notifications/unsubscribe
Authorization: Bearer YOUR_TOKEN
```

---

## 🎤 Voice

### 1. Text to Speech
```http
POST https://ai-assistant-backend-oqpp.onrender.com/api/voice/text-to-speech
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "text": "Hello, this is a test of text to speech",
  "voice": "alloy"
}
```

**Available voices:** `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`

**Response:** MP3 audio file

### 2. Speech to Text
```http
POST https://ai-assistant-backend-oqpp.onrender.com/api/voice/speech-to-text
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

audio: [audio-file]
```

**Response:**
```json
{
  "text": "Transcribed text from the audio file"
}
```

### 3. Get Available Voices
```http
GET https://ai-assistant-backend-oqpp.onrender.com/api/voice/voices
Authorization: Bearer YOUR_TOKEN
```

**Response:**
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

## 🧪 Testing Examples

### Using cURL

**Health Check:**
```bash
curl https://ai-assistant-backend-oqpp.onrender.com/health
```

**Register:**
```bash
curl -X POST https://ai-assistant-backend-oqpp.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

**Login:**
```bash
curl -X POST https://ai-assistant-backend-oqpp.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**Chat with AI:**
```bash
curl -X POST https://ai-assistant-backend-oqpp.onrender.com/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message":"Hello AI!"}'
```

### Using JavaScript (Fetch)

```javascript
// Register
const response = await fetch('https://ai-assistant-backend-oqpp.onrender.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123',
    name: 'Test User'
  })
});
const data = await response.json();
console.log(data.token);

// Chat with AI
const chatResponse = await fetch('https://ai-assistant-backend-oqpp.onrender.com/api/chat/message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`
  },
  body: JSON.stringify({ message: 'Hello AI!' })
});
const chatData = await chatResponse.json();
console.log(chatData.message);
```

### Using PowerShell

```powershell
# Register
$response = Invoke-RestMethod -Uri "https://ai-assistant-backend-oqpp.onrender.com/api/auth/register" `
  -Method Post -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Chat
$token = $response.token
$headers = @{"Authorization" = "Bearer $token"}
$chat = Invoke-RestMethod -Uri "https://ai-assistant-backend-oqpp.onrender.com/api/chat/message" `
  -Method Post -ContentType "application/json" -Headers $headers `
  -Body '{"message":"Hello AI!"}'
```

---

## 📊 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 404 | Not Found |
| 500 | Internal Server Error |

## 🔒 Error Response Format

```json
{
  "error": "Error message here"
}
```

---

## 💡 Tips

1. **Save your JWT token** after login/register for subsequent requests
2. **Token expires in 7 days** - login again to get a new token
3. **Free tier sleeps after 15 min** - first request may take ~30 seconds
4. **Rate limiting** - Not currently implemented
5. **CORS** - Configured to allow your frontend

---

## 🎉 Your API is Live!

**Base URL**: `https://ai-assistant-backend-oqpp.onrender.com`

**Status**: ✅ Operational

**Total Endpoints**: 39

**Features**:
- ✅ Authentication & Authorization
- ✅ AI Chat (GPT-4)
- ✅ Email Generation
- ✅ Calendar Management
- ✅ Notes System
- ✅ File Uploads
- ✅ Push Notifications
- ✅ Voice Features (TTS/STT)

---

**Need help?** Check the other documentation files:
- `README.md` - Complete documentation
- `API_EXAMPLES.md` - Detailed examples
- `TROUBLESHOOTING.md` - Common issues
- `QUICKSTART.md` - Quick setup guide
