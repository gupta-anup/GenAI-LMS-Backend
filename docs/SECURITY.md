# Security Documentation

## Overview

This application implements a comprehensive security system with JWT authentication, OAuth integration (Google & GitHub), email verification, and various security features to protect user accounts and data.

## Features

### 🔐 Authentication Methods

1. **Email/Password Authentication**
   - Secure password hashing with bcrypt
   - Email verification required
   - Account lockout after failed attempts

2. **OAuth Integration**
   - Google OAuth 2.0
   - GitHub OAuth 2.0
   - Automatic account linking

3. **JWT Token System**
   - Access tokens (short-lived)
   - Refresh tokens (long-lived)
   - Secure token rotation

### 📧 Email-Based Security

1. **Email Verification**
   - Required for account activation
   - Secure token-based verification
   - Resend verification capability

2. **Password Recovery**
   - Secure password reset via email
   - Time-limited reset tokens
   - Password change notifications

### 🔒 Security Features

1. **Account Protection**
   - Account lockout after 5 failed login attempts
   - 2-hour lockout duration
   - Automatic unlock after expiration

2. **Password Security**
   - Strong password requirements
   - Secure hashing with configurable rounds
   - Password change tracking

3. **Session Management**
   - Secure JWT implementation
   - Token invalidation on logout
   - Refresh token rotation

## API Endpoints

### Authentication Endpoints

```
POST /auth/register          - Register new user
POST /auth/login            - Login with email/password
POST /auth/logout           - Logout (invalidate tokens)
POST /auth/refresh          - Refresh access token
```

### Email Verification

```
POST /auth/verify-email     - Verify email with token
POST /auth/resend-verification - Resend verification email
```

### Password Management

```
POST /auth/forgot-password  - Request password reset
POST /auth/reset-password   - Reset password with token
PATCH /auth/change-password - Change password (authenticated)
```

### OAuth Endpoints

```
GET /auth/google           - Initiate Google OAuth
GET /auth/google/callback  - Google OAuth callback
GET /auth/github           - Initiate GitHub OAuth  
GET /auth/github/callback  - GitHub OAuth callback
```

### User Profile

```
GET /auth/profile          - Get current user profile
```

## Usage Examples

### Register New User

```typescript
POST /auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "phone": "+1234567890"
}
```

### Login

```typescript
POST /auth/login
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": [],
    "isEmailVerified": true
  },
  "tokens": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

### Verify Email

```typescript
POST /auth/verify-email
{
  "token": "verification-token-from-email"
}
```

### Password Reset

```typescript
// Request reset
POST /auth/forgot-password
{
  "email": "john.doe@example.com"
}

// Reset with token
POST /auth/reset-password
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

### Using Protected Routes

```typescript
// Add Authorization header
Authorization: Bearer your-jwt-access-token

GET /auth/profile
```

## Security Configurations

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key
JWT_REFRESH_EXPIRES_IN=7d

# Password Security
BCRYPT_ROUNDS=12

# OAuth Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# OAuth GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
```

### Password Requirements

- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character

### Security Features

1. **Account Lockout**
   - 5 failed attempts trigger lockout
   - 2-hour lockout duration
   - Automatic reset on successful login

2. **Token Security**
   - Short-lived access tokens (24h default)
   - Long-lived refresh tokens (7d default)
   - Secure token invalidation

3. **Email Security**
   - Time-limited verification tokens (24h)
   - Time-limited reset tokens (1h)
   - Secure token generation with UUID

## OAuth Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)

### GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `http://localhost:3000/auth/github/callback` (development)
   - `https://yourdomain.com/auth/github/callback` (production)

## Frontend Integration

### OAuth Flow

```typescript
// Redirect to OAuth provider
window.location.href = 'http://localhost:3000/auth/google';

// Handle callback (parse tokens from URL)
const urlParams = new URLSearchParams(window.location.search);
const accessToken = urlParams.get('token');
const refreshToken = urlParams.get('refresh');

// Store tokens securely
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
```

### API Requests

```typescript
// Add token to requests
const token = localStorage.getItem('accessToken');
const response = await fetch('/api/protected-route', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Handle token refresh
if (response.status === 401) {
  const refreshToken = localStorage.getItem('refreshToken');
  const refreshResponse = await fetch('/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  if (refreshResponse.ok) {
    const { accessToken } = await refreshResponse.json();
    localStorage.setItem('accessToken', accessToken);
    // Retry original request
  } else {
    // Redirect to login
    window.location.href = '/login';
  }
}
```

## Security Best Practices

### Production Checklist

- [ ] Use strong JWT secrets (at least 256 bits)
- [ ] Set secure CORS origins
- [ ] Use HTTPS in production
- [ ] Configure proper email SMTP settings
- [ ] Set up proper OAuth redirect URLs
- [ ] Enable rate limiting
- [ ] Use environment variables for all secrets
- [ ] Set up monitoring and logging
- [ ] Configure database security
- [ ] Use secure password policies

### Token Management

- Store tokens securely (HttpOnly cookies in production)
- Implement token refresh logic
- Handle token expiration gracefully
- Clear tokens on logout
- Validate tokens on each request

### Error Handling

- Don't expose sensitive information in errors
- Log security events for monitoring
- Use generic error messages for authentication failures
- Implement proper error boundaries

## Monitoring and Alerts

The system logs the following security events:

- User registration attempts
- Login success/failure
- Account lockouts
- Password changes
- Email verification
- OAuth logins
- Token refresh attempts

Monitor these logs for suspicious activity and set up alerts for:

- Multiple failed login attempts from same IP
- Unusual OAuth activity
- Password reset abuse
- Token refresh anomalies

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check SMTP configuration
   - Verify email credentials
   - Check firewall settings

2. **OAuth not working**
   - Verify OAuth app configuration
   - Check redirect URLs
   - Confirm client ID/secret

3. **Token validation failing**
   - Check JWT secret configuration
   - Verify token expiration settings
   - Confirm token format

4. **Account lockout issues**
   - Check lockout duration settings
   - Verify database timestamps
   - Monitor failed login attempts
