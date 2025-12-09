# Smart AI Personal Assistant - Backend

A professional, production-ready backend for an AI-powered personal assistant (like JARVIS) built with Node.js, Express, Supabase, OpenAI GPT, Redis, and more.

## Features

- **Authentication & Authorization**
  - Email/Password registration and login
  - Google OAuth integration
  - JWT-based authentication
  - Email verification
  - Password reset functionality

- **AI Chat Assistant**
  - GPT-4 powered conversations
  - Conversation history management
  - Context-aware responses

- **AI Email Generator**
  - Generate professional emails using AI
  - Multiple tone options (professional, casual, formal, friendly)
  - Send emails via SendGrid

- **Calendar Management**
  - Create, read, update, delete events
  - Event reminders
  - Date range filtering

- **Notes System**
  - Create and manage notes
  - Tag-based organization
  - Full-text search

- **File Uploads**
  - Support for Supabase Storage and Cloudinary
  - Profile picture uploads
  - File management

- **Push Notifications**
  - Web Push notifications using VAPID
  - Redis-based job queue
  - Subscription management

- **Voice Features**
  - Text-to-Speech using OpenAI TTS
  - Speech-to-Text transcription
  - Multiple voice options

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT, Google OAuth
- **AI**: OpenAI GPT-4
- **Caching/Queue**: Redis, Bull
- **Email**: SendGrid
- **Storage**: Supabase Storage, Cloudinary (optional)
- **Push Notifications**: web-push

## Project Structure

```
├── src/
│   ├── config/           # Configuration files
│   │   ├── supabase.js
│   │   ├── redis.js
│   │   ├── openai.js
│   │   ├── cloudinary.js
│   │   └── sendgrid.js
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── routes/           # API routes
│   ├── middlewares/      # Custom middleware
│   ├── utils/            # Utility functions
│   └── index.js          # Application entry point
├── database/
│   └── schema.sql        # Database schema
├── .env.example          # Environment variables template
├── package.json
└── README.md
```

## Installation

### Prerequisites

- Node.js >= 18.0.0
- Supabase account
- OpenAI API key
- Redis instance (local or cloud)
- SendGrid account (optional, for emails)
- Cloudinary account (optional, for image uploads)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-assistant-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your credentials:
   - Supabase URL and Service Key
   - OpenAI API Key
   - Redis URL
   - JWT Secret (generate a random string)
   - SendGrid API Key (optional)
   - Google OAuth credentials (optional)
   - Cloudinary credentials (optional)

4. **Set up Supabase database**
   - Go to your Supabase project
   - Navigate to SQL Editor
   - Copy and paste the contents of `database/schema.sql`
   - Run the SQL script
   - Go to Storage and create a bucket named "files" (set as public)

5. **Generate VAPID keys** (optional - auto-generated on first run)
   ```bash
   npm run generate-vapid
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   Or for production:
   ```bash
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/oauth/google` - Google OAuth login
- `POST /api/auth/password-reset/request` - Request password reset
- `POST /api/auth/password-reset/confirm` - Confirm password reset
- `GET /api/auth/verify-email` - Verify email
- `GET /api/auth/me` - Get current user

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/profile/picture` - Upload profile picture
- `POST /api/user/change-password` - Change password
- `DELETE /api/user/account` - Delete account

### AI Chat
- `POST /api/chat/message` - Send message to AI
- `GET /api/chat/conversations` - Get all conversations
- `GET /api/chat/conversations/:id` - Get conversation history
- `DELETE /api/chat/conversations/:id` - Delete conversation

### Email
- `POST /api/email/generate` - Generate email with AI
- `POST /api/email/send` - Send email via SendGrid
- `POST /api/email/generate-and-send` - Generate and send email

### Calendar
- `POST /api/calendar/events` - Create event
- `GET /api/calendar/events` - Get all events
- `GET /api/calendar/events/:id` - Get single event
- `PUT /api/calendar/events/:id` - Update event
- `DELETE /api/calendar/events/:id` - Delete event

### Notes
- `POST /api/notes` - Create note
- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get single note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### File Upload
- `POST /api/upload` - Upload file
- `GET /api/upload/files` - Get user files
- `DELETE /api/upload/files/:id` - Delete file

### Notifications
- `GET /api/notifications/vapid-public-key` - Get VAPID public key
- `POST /api/notifications/subscribe` - Subscribe to notifications
- `POST /api/notifications/unsubscribe` - Unsubscribe
- `POST /api/notifications/test` - Send test notification

### Voice
- `POST /api/voice/text-to-speech` - Convert text to speech
- `POST /api/voice/speech-to-text` - Transcribe audio
- `GET /api/voice/voices` - Get available voices

## Deployment on Render

1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Select "Node" as the environment

2. **Configure Build & Start Commands**
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Add Environment Variables**
   - Go to Environment tab
   - Add all variables from your `.env` file
   - Make sure to set `NODE_ENV=production`

4. **Add Redis**
   - Create a Redis instance on Render or use external service
   - Update `REDIS_URL` environment variable

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your application

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment (development/production) | No |
| `CLIENT_URL` | Frontend URL for CORS | No |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | No (default: 7d) |
| `REDIS_URL` | Redis connection URL | Yes |
| `SENDGRID_API_KEY` | SendGrid API key | No |
| `EMAIL_FROM` | Sender email address | No |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `GOOGLE_REDIRECT_URI` | Google OAuth redirect URI | No |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | No |
| `CLOUDINARY_API_KEY` | Cloudinary API key | No |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | No |
| `VAPID_PUBLIC_KEY` | VAPID public key (auto-generated) | No |
| `VAPID_PRIVATE_KEY` | VAPID private key (auto-generated) | No |

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Input validation with express-validator
- Row Level Security (RLS) in Supabase
- CORS protection
- File upload restrictions
- Error handling middleware

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message here"
}
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Generate VAPID Keys
```bash
npm run generate-vapid
```

## Testing

Test the API using tools like:
- Postman
- Thunder Client (VS Code extension)
- cURL

Example request:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

## Support

For issues or questions, please open an issue in the repository.

## License

ISC
