# API Testing Guide

## Quick Start Testing

This guide provides examples for testing the authentication system using curl or any HTTP client.

### Prerequisites

1. Make sure the application is running
2. Have a PostgreSQL database running (or configure another database)
3. Set up environment variables

### Base URL

```
http://localhost:3000/api
```

## Authentication Flow Testing

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!",
    "phone": "+1234567890"
  }'
```

Expected Response:
```json
{
  "message": "Registration successful. Please check your email to verify your account."
}
```

### 2. Verify Email (Use token from email)

```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-verification-token-from-email"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

Expected Response:
```json
{
  "user": {
    "id": "uuid-here",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": [],
    "isEmailVerified": true
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. Access Protected Route

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Test Protected Health Check

```bash
curl -X GET http://localhost:3000/api/health/auth \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Password Management Testing

### Forgot Password

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

### Reset Password (Use token from email)

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset-token-from-email",
    "password": "NewSecurePass123!",
    "confirmPassword": "NewSecurePass123!"
  }'
```

### Change Password (Authenticated)

```bash
curl -X PATCH http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "NewSecurePass123!",
    "newPassword": "AnotherSecurePass123!",
    "confirmPassword": "AnotherSecurePass123!"
  }'
```

## Token Management Testing

### Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## OAuth Testing

### Google OAuth

1. Open browser and go to:
   ```
   http://localhost:3000/api/auth/google
   ```

2. Complete Google OAuth flow

3. You'll be redirected to frontend with tokens in URL parameters

### GitHub OAuth

1. Open browser and go to:
   ```
   http://localhost:3000/api/auth/github
   ```

2. Complete GitHub OAuth flow

3. You'll be redirected to frontend with tokens in URL parameters

## Health Check Testing

### Basic Health Check

```bash
curl -X GET http://localhost:3000/api/health
```

Expected Response:
```json
{
  "status": "ok",
  "timestamp": "2025-06-29T14:45:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

### Authenticated Health Check

```bash
curl -X GET http://localhost:3000/api/health/auth \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Error Testing

### Invalid Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@example.com",
    "password": "wrongpassword"
  }'
```

Expected Response:
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### Expired Token

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer EXPIRED_TOKEN"
```

Expected Response:
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

### Invalid Registration Data

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "J",
    "lastName": "D",
    "email": "invalid-email",
    "password": "weak",
    "confirmPassword": "different"
  }'
```

Expected Response:
```json
{
  "statusCode": 400,
  "message": [
    "firstName must be longer than or equal to 2 characters",
    "lastName must be longer than or equal to 2 characters",
    "email must be an email",
    "password must be longer than or equal to 8 characters",
    "password must contain at least one lowercase letter, one uppercase letter, one number and one special character"
  ],
  "error": "Bad Request"
}
```

## Postman Collection

You can import this collection into Postman for easier testing:

```json
{
  "info": {
    "name": "GenAI LMS Backend Auth",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api"
    },
    {
      "key": "accessToken",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"firstName\": \"John\",\n  \"lastName\": \"Doe\",\n  \"email\": \"john.doe@example.com\",\n  \"password\": \"SecurePass123!\",\n  \"confirmPassword\": \"SecurePass123!\"\n}"
        },
        "url": "{{baseUrl}}/auth/register"
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"john.doe@example.com\",\n  \"password\": \"SecurePass123!\"\n}"
        },
        "url": "{{baseUrl}}/auth/login"
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "if (pm.response.code === 200) {",
              "    const response = pm.response.json();",
              "    pm.globals.set('accessToken', response.tokens.accessToken);",
              "}"
            ]
          }
        }
      ]
    },
    {
      "name": "Get Profile",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{accessToken}}"
          }
        ],
        "url": "{{baseUrl}}/auth/profile"
      }
    }
  ]
}
```

## Testing Checklist

- [ ] User registration with valid data
- [ ] User registration with invalid data (validation testing)
- [ ] Email verification flow
- [ ] Login with verified account
- [ ] Login with unverified account (should fail)
- [ ] Access protected routes with valid token
- [ ] Access protected routes with invalid token
- [ ] Password reset flow
- [ ] Password change flow
- [ ] Token refresh flow
- [ ] Logout functionality
- [ ] OAuth flows (Google & GitHub)
- [ ] Account lockout after failed attempts
- [ ] Error handling and responses

## Common Issues and Solutions

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database configuration in .env
- Verify database exists and user has permissions

### Email Not Sending
- Check SMTP configuration
- Verify email service credentials
- Test with a different email provider

### OAuth Not Working
- Verify OAuth app configuration
- Check redirect URLs match exactly
- Confirm client ID and secret are correct

### Token Issues
- Check JWT secret configuration
- Verify token expiration settings
- Ensure tokens are being passed correctly in headers
