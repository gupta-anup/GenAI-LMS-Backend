# API Testing Guide - GenAI LMS Backend

## Base URL
```
http://localhost:3000/api
```

## 1. Health Check
**GET** `/health`
- No authentication required
- Returns service status and uptime

## 2. User Registration
**POST** `/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Test123456!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isEmailVerified": false,
      "isActive": true
    }
  }
}
```

## 3. User Login
**POST** `/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "john.doe@example.com",
  "password": "Test123456!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token"
    }
  }
}
```

## 4. Get User Profile (Protected Route)
**GET** `/auth/profile`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isEmailVerified": false,
      "isActive": true
    }
  }
}
```

## 5. Email Verification
**POST** `/auth/verify-email`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "token": "email-verification-token"
}
```

## 6. Resend Email Verification
**POST** `/auth/resend-verification`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "john.doe@example.com"
}
```

## 7. Forgot Password
**POST** `/auth/forgot-password`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "john.doe@example.com"
}
```

## 8. Reset Password
**POST** `/auth/reset-password`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "token": "password-reset-token",
  "newPassword": "NewTest123456!"
}
```

## 9. Change Password (Protected Route)
**PATCH** `/auth/change-password`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "currentPassword": "Test123456!",
  "newPassword": "NewTest123456!"
}
```

## 10. Refresh Token
**POST** `/auth/refresh`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

## 11. Logout (Protected Route)
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

## 12. OAuth Routes
**GET** `/auth/google` - Redirects to Google OAuth
**GET** `/auth/google/callback` - Google OAuth callback
**GET** `/auth/github` - Redirects to GitHub OAuth  
**GET** `/auth/github/callback` - GitHub OAuth callback

## Testing Workflow

### Step 1: Test Registration
1. Use the registration endpoint to create a new user
2. Check the response for success message
3. Note: Email verification will be sent (check server logs for the token if email is not configured)

### Step 2: Test Login
1. Use the login endpoint with the registered user credentials
2. Copy the `accessToken` and `refreshToken` from the response
3. You'll use the `accessToken` for protected routes

### Step 3: Test Protected Routes
1. Use the `accessToken` in the Authorization header as `Bearer {token}`
2. Test the profile endpoint to verify JWT authentication works

### Step 4: Test Token Refresh
1. Use the `refreshToken` to get new tokens
2. Update your `accessToken` with the new one

### Step 5: Test Other Features
1. Test password change functionality
2. Test logout functionality
3. Test forgot/reset password flow

## Common HTTP Status Codes
- `200` - Success
- `201` - Created (successful registration)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials or missing token)
- `403` - Forbidden (valid token but insufficient permissions)
- `404` - Not Found
- `409` - Conflict (user already exists)
- `422` - Unprocessable Entity (validation errors)
- `500` - Internal Server Error

## Sample Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

## Notes
- Replace `{accessToken}` and `{refreshToken}` with actual tokens from login response
- Email tokens (verification, password reset) will be logged to console if email service is not configured
- All passwords must meet the security requirements (8+ chars, uppercase, lowercase, number, special char)
- OAuth routes require proper client IDs and secrets to be configured in environment variables
