# Google OAuth Implementation Guide

## Overview

Your backend now has a complete Google OAuth implementation with the following endpoints:

### Endpoints

1. **GET /api/auth/oauth/google/url** - Get OAuth authorization URL
2. **GET /api/auth/oauth/google/callback** - Handle OAuth callback
3. **POST /api/auth/oauth/google** - Direct token authentication (existing)

## OAuth Flow

### 1. Frontend Initiates OAuth
```javascript
// Get the OAuth URL from your backend
const response = await fetch('/api/auth/oauth/google/url');
const { authUrl } = await response.json();

// Redirect user to Google OAuth
window.location.href = authUrl;
```

### 2. User Authorizes on Google
- User is redirected to Google's OAuth consent screen
- User grants permissions
- Google redirects back to your callback URL with authorization code

### 3. Backend Handles Callback
The callback endpoint (`/api/auth/oauth/google/callback`) automatically:
- Receives the authorization code
- Exchanges it for access tokens
- Gets user profile from Google
- Creates/updates user in database
- Generates JWT token
- Redirects back to frontend with token

### 4. Frontend Receives Token
```javascript
// Your frontend should handle this URL pattern:
// http://localhost:3000/auth/callback?token=JWT_TOKEN&user=USER_DATA

// Extract token and user data from URL params
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const userData = JSON.parse(decodeURIComponent(urlParams.get('user')));

// Store token and redirect to dashboard
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(userData));
window.location.href = '/dashboard';
```

## Environment Variables Required

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/oauth/google/callback
CLIENT_URL=http://localhost:3000
```

## Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/oauth/google/callback` (development)
   - `https://yourdomain.com/api/auth/oauth/google/callback` (production)

## Error Handling

The callback endpoint handles various error scenarios:

- **OAuth Error**: Redirects to `${CLIENT_URL}/auth/error?error=oauth_error`
- **Missing Code**: Redirects to `${CLIENT_URL}/auth/error?error=no_code`
- **Authentication Failed**: Redirects to `${CLIENT_URL}/auth/error?error=auth_failed`

## Frontend Error Handling

```javascript
// Handle OAuth errors in your frontend
const urlParams = new URLSearchParams(window.location.search);
const error = urlParams.get('error');

if (error) {
  switch (error) {
    case 'oauth_error':
      showError('OAuth authorization failed');
      break;
    case 'no_code':
      showError('Authorization code not received');
      break;
    case 'auth_failed':
      showError('Authentication failed');
      break;
    default:
      showError('Login failed');
  }
}
```

## User Data Structure

When a user authenticates via Google OAuth, the following user data is returned:

```javascript
{
  user: {
    id: "user-uuid",
    email: "user@gmail.com",
    name: "User Name",
    email_verified: true,
    profile_picture: "https://lh3.googleusercontent.com/..."
  },
  token: "jwt-token-here"
}
```

## Database Schema

The OAuth implementation works with your existing users table and expects these columns:

- `email` (string, unique)
- `name` (string)
- `profile_picture` (string, nullable)
- `google_id` (string, nullable)
- `email_verified` (boolean)
- `password` (string, nullable for OAuth users)

## Testing

Run the OAuth test suite:

```bash
node test-oauth-callback.js
```

This tests:
- OAuth URL generation
- Callback endpoint error handling
- Redirect functionality

## Production Deployment

1. Update `GOOGLE_REDIRECT_URI` to your production domain
2. Update `CLIENT_URL` to your production frontend URL
3. Add production redirect URI to Google Cloud Console
4. Ensure HTTPS is enabled for production

## Security Notes

- OAuth tokens are exchanged server-side for security
- JWT tokens are generated with your secret key
- User data is validated before database insertion
- Existing users are updated with Google profile data if missing
- Email verification is automatically set to true for Google OAuth users

## Integration with Existing Auth

This OAuth implementation integrates seamlessly with your existing authentication system:

- Users can register/login with email/password OR Google OAuth
- Existing users can link their Google account
- OAuth users cannot use password login (they must use Google)
- All users share the same JWT token system