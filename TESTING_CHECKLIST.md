# Testing Checklist

Use this checklist to verify all features are working correctly.

## 🚀 Pre-Testing Setup

- [ ] Dependencies installed (`npm install`)
- [ ] Database schema created in Supabase
- [ ] Storage bucket "files" created in Supabase
- [ ] All environment variables set in `.env`
- [ ] Redis running (or app started without Redis)
- [ ] Server started successfully (`npm run dev`)
- [ ] Health endpoint returns 200 OK

## 1️⃣ Authentication Tests

### Registration
- [ ] Register with valid email/password
- [ ] Receive JWT token
- [ ] User created in database
- [ ] Verification email sent (if SendGrid configured)
- [ ] Cannot register with existing email
- [ ] Validation errors for invalid email
- [ ] Validation errors for short password

### Login
- [ ] Login with correct credentials
- [ ] Receive JWT token
- [ ] Cannot login with wrong password
- [ ] Cannot login with non-existent email
- [ ] Validation errors for invalid input

### Google OAuth
- [ ] Login with Google ID token (if configured)
- [ ] User created/updated in database
- [ ] Receive JWT token
- [ ] Profile picture synced from Google

### Password Reset
- [ ] Request password reset
- [ ] Reset email sent (if SendGrid configured)
- [ ] Reset password with valid token
- [ ] Cannot reset with expired token
- [ ] Cannot reset with invalid token

### Email Verification
- [ ] Verify email with valid token
- [ ] Email_verified status updated
- [ ] Cannot verify with invalid token

### Get Current User
- [ ] Get user info with valid token
- [ ] Cannot access without token
- [ ] Cannot access with invalid token

## 2️⃣ User Profile Tests

### Get Profile
- [ ] Get profile with valid token
- [ ] Profile data returned correctly
- [ ] Cannot access without authentication

### Update Profile
- [ ] Update name successfully
- [ ] Update email successfully
- [ ] Email_verified reset when email changed
- [ ] Cannot use existing email
- [ ] Validation errors for invalid data

### Profile Picture
- [ ] Upload image successfully
- [ ] Image URL returned
- [ ] Profile picture updated in database
- [ ] Cannot upload without file
- [ ] Cannot upload invalid file type
- [ ] Cannot upload file > 10MB

### Change Password
- [ ] Change password with correct current password
- [ ] Cannot change with wrong current password
- [ ] Cannot change for OAuth users
- [ ] New password works for login

### Delete Account
- [ ] Account deleted successfully
- [ ] Related data deleted (cascade)
- [ ] Cannot access after deletion

## 3️⃣ AI Chat Tests

### Send Message
- [ ] Send message to AI
- [ ] Receive AI response
- [ ] Conversation created automatically
- [ ] Message saved to database
- [ ] Token usage tracked
- [ ] Context maintained in conversation

### Continue Conversation
- [ ] Send message to existing conversation
- [ ] AI remembers context
- [ ] Messages added to conversation
- [ ] History maintained

### Get Conversations
- [ ] Get all user conversations
- [ ] Conversations sorted by date
- [ ] Only user's conversations returned

### Get Conversation History
- [ ] Get specific conversation
- [ ] All messages returned
- [ ] Messages in chronological order
- [ ] Cannot access other user's conversations

### Delete Conversation
- [ ] Conversation deleted
- [ ] Messages deleted (cascade)
- [ ] Cannot delete other user's conversations

## 4️⃣ Email Tests

### Generate Email
- [ ] Generate email with prompt
- [ ] Subject extracted correctly
- [ ] Body formatted properly
- [ ] Different tones work (professional, casual, etc.)

### Send Email
- [ ] Email sent via SendGrid (if configured)
- [ ] Recipient receives email
- [ ] HTML formatting preserved
- [ ] Validation errors for invalid email

### Generate and Send
- [ ] Email generated and sent in one request
- [ ] Both operations successful
- [ ] Generated content returned

## 5️⃣ Calendar Tests

### Create Event
- [ ] Event created successfully
- [ ] All fields saved correctly
- [ ] Validation errors for invalid dates
- [ ] Validation errors for missing required fields

### Get Events
- [ ] Get all user events
- [ ] Events sorted chronologically
- [ ] Only user's events returned

### Filter Events
- [ ] Filter by start date
- [ ] Filter by end date
- [ ] Filter by date range
- [ ] Correct events returned

### Get Single Event
- [ ] Get specific event
- [ ] Event details correct
- [ ] Cannot access other user's events

### Update Event
- [ ] Update event successfully
- [ ] Changes saved to database
- [ ] Cannot update other user's events
- [ ] Validation works

### Delete Event
- [ ] Event deleted successfully
- [ ] Cannot delete other user's events

## 6️⃣ Notes Tests

### Create Note
- [ ] Note created successfully
- [ ] Title and content saved
- [ ] Tags saved as array
- [ ] Timestamps set correctly

### Get Notes
- [ ] Get all user notes
- [ ] Notes sorted by updated_at
- [ ] Only user's notes returned

### Search Notes
- [ ] Search by title works
- [ ] Search by content works
- [ ] Search is case-insensitive
- [ ] Correct results returned

### Filter by Tag
- [ ] Filter by single tag
- [ ] Correct notes returned
- [ ] Empty result for non-existent tag

### Get Single Note
- [ ] Get specific note
- [ ] Note details correct
- [ ] Cannot access other user's notes

### Update Note
- [ ] Update note successfully
- [ ] Updated_at timestamp updated
- [ ] Cannot update other user's notes
- [ ] Validation works

### Delete Note
- [ ] Note deleted successfully
- [ ] Cannot delete other user's notes

## 7️⃣ File Upload Tests

### Upload File
- [ ] Upload image successfully
- [ ] Upload document successfully
- [ ] File URL returned
- [ ] File metadata saved
- [ ] Cannot upload without file
- [ ] Cannot upload invalid type
- [ ] Cannot upload file > 10MB

### Storage Providers
- [ ] Supabase storage works
- [ ] Cloudinary works (if configured)
- [ ] Provider selection works

### Get Files
- [ ] Get all user files
- [ ] Files sorted by date
- [ ] Only user's files returned
- [ ] Limit parameter works

### Delete File
- [ ] File deleted from storage
- [ ] File record deleted from database
- [ ] Cannot delete other user's files

## 8️⃣ Notification Tests

### Get VAPID Key
- [ ] Public key returned
- [ ] Key is valid
- [ ] No authentication required

### Subscribe
- [ ] Subscription saved
- [ ] Subscription object valid
- [ ] Cannot subscribe without authentication

### Send Test Notification
- [ ] Notification sent successfully
- [ ] Notification received in browser
- [ ] Custom title and body work

### Unsubscribe
- [ ] Subscription removed
- [ ] No more notifications received

## 9️⃣ Voice Tests

### Text-to-Speech
- [ ] Audio generated successfully
- [ ] MP3 file returned
- [ ] Different voices work
- [ ] Audio plays correctly

### Speech-to-Text
- [ ] Audio transcribed successfully
- [ ] Text returned correctly
- [ ] Different audio formats work
- [ ] Temporary file cleaned up

### Get Voices
- [ ] All voices returned
- [ ] Voice descriptions included
- [ ] 6 voices available

## 🔟 Error Handling Tests

### Validation Errors
- [ ] Invalid email format
- [ ] Short password
- [ ] Missing required fields
- [ ] Invalid data types
- [ ] Proper error messages

### Authentication Errors
- [ ] No token provided
- [ ] Invalid token
- [ ] Expired token
- [ ] Proper 401 status codes

### Authorization Errors
- [ ] Cannot access other user's data
- [ ] Cannot modify other user's data
- [ ] Cannot delete other user's data
- [ ] Proper 403/404 status codes

### Not Found Errors
- [ ] Invalid conversation ID
- [ ] Invalid event ID
- [ ] Invalid note ID
- [ ] Invalid file ID
- [ ] Proper 404 status codes

### Server Errors
- [ ] Database errors handled
- [ ] API errors handled
- [ ] Service errors handled
- [ ] Proper error messages

## 1️⃣1️⃣ Performance Tests

### Response Times
- [ ] Health check < 100ms
- [ ] Authentication < 500ms
- [ ] AI chat < 5s (depends on OpenAI)
- [ ] Database queries < 200ms
- [ ] File uploads < 2s

### Concurrent Requests
- [ ] Multiple users can register
- [ ] Multiple users can chat
- [ ] Multiple file uploads
- [ ] No race conditions

### Large Data
- [ ] Long conversation history
- [ ] Many notes (100+)
- [ ] Many events (100+)
- [ ] Large file uploads (up to 10MB)

## 1️⃣2️⃣ Security Tests

### Authentication
- [ ] Cannot access protected routes without token
- [ ] Token expires correctly
- [ ] Password hashed in database
- [ ] JWT secret secure

### Authorization
- [ ] Users isolated from each other
- [ ] RLS policies working
- [ ] Cannot access other user's data
- [ ] Cannot modify other user's data

### Input Validation
- [ ] SQL injection prevented
- [ ] XSS prevented
- [ ] File upload restrictions work
- [ ] Request size limits work

### CORS
- [ ] CORS headers set correctly
- [ ] Only allowed origins accepted
- [ ] Credentials handled properly

## 1️⃣3️⃣ Integration Tests

### Supabase
- [ ] Database connection works
- [ ] Queries execute correctly
- [ ] Storage uploads work
- [ ] RLS policies enforced

### OpenAI
- [ ] Chat completions work
- [ ] Email generation works
- [ ] TTS works
- [ ] STT works
- [ ] Token usage tracked

### Redis
- [ ] Connection established
- [ ] Caching works (if implemented)
- [ ] Job queue works
- [ ] Graceful fallback without Redis

### SendGrid
- [ ] Emails sent successfully
- [ ] Templates render correctly
- [ ] Delivery confirmed
- [ ] Graceful fallback without SendGrid

### Cloudinary
- [ ] Image uploads work
- [ ] Transformations applied
- [ ] URLs generated
- [ ] Fallback to Supabase works

## 1️⃣4️⃣ Edge Cases

### Empty Data
- [ ] Empty conversation list
- [ ] Empty notes list
- [ ] Empty events list
- [ ] Empty file list

### Special Characters
- [ ] Names with special characters
- [ ] Emails with special characters
- [ ] Content with emojis
- [ ] Content with HTML

### Boundary Values
- [ ] Minimum password length (6)
- [ ] Maximum file size (10MB)
- [ ] Long text content
- [ ] Many tags on note

### Network Issues
- [ ] Database timeout handling
- [ ] API timeout handling
- [ ] Retry logic works
- [ ] Error messages clear

## 1️⃣5️⃣ Documentation Tests

### Code Documentation
- [ ] All functions commented
- [ ] Parameters documented
- [ ] Return values documented
- [ ] Examples provided

### API Documentation
- [ ] All endpoints documented
- [ ] Request examples provided
- [ ] Response examples provided
- [ ] Error cases documented

### Setup Documentation
- [ ] Installation steps clear
- [ ] Configuration steps clear
- [ ] Deployment steps clear
- [ ] Troubleshooting helpful

## ✅ Final Checklist

### Before Deployment
- [ ] All tests passed
- [ ] No console errors
- [ ] No console warnings
- [ ] Environment variables set
- [ ] Database schema up to date
- [ ] Storage configured
- [ ] Services connected

### Production Readiness
- [ ] NODE_ENV=production
- [ ] Secrets rotated
- [ ] CORS configured
- [ ] Error handling tested
- [ ] Monitoring set up
- [ ] Backups configured

### Post-Deployment
- [ ] Health check passes
- [ ] Can register user
- [ ] Can login
- [ ] Can chat with AI
- [ ] All features work
- [ ] No errors in logs

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Environment: [ ] Local [ ] Staging [ ] Production

Authentication: [ ] Pass [ ] Fail
User Profile: [ ] Pass [ ] Fail
AI Chat: [ ] Pass [ ] Fail
Email: [ ] Pass [ ] Fail
Calendar: [ ] Pass [ ] Fail
Notes: [ ] Pass [ ] Fail
File Upload: [ ] Pass [ ] Fail
Notifications: [ ] Pass [ ] Fail
Voice: [ ] Pass [ ] Fail
Error Handling: [ ] Pass [ ] Fail
Security: [ ] Pass [ ] Fail

Issues Found:
1. ___________
2. ___________
3. ___________

Overall Status: [ ] Ready [ ] Needs Work
```

## 🎯 Quick Test Script

Run these commands to quickly test the API:

```bash
# Health check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Chat (replace TOKEN)
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"message":"Hello!"}'
```

## 💡 Testing Tips

1. **Use Postman or Thunder Client** for easier testing
2. **Save tokens** after login for subsequent requests
3. **Test error cases** not just happy paths
4. **Check database** after operations
5. **Monitor logs** during testing
6. **Test with different users** to verify isolation
7. **Test edge cases** and boundary values
8. **Verify cleanup** after deletions
9. **Check performance** under load
10. **Document issues** as you find them

## 🎉 Success!

When all tests pass, you're ready to deploy! 🚀
