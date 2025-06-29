# Quick Setup Guide for Postman Testing

## Prerequisites
- Your GenAI LMS Backend is running on `http://localhost:3000`
- Postman is installed on your computer

## Setup Instructions

### Option 1: Import Collection and Environment Files
1. Open Postman
2. Click "Import" button (top left)
3. Import these files from your project root:
   - `GenAI-LMS-Backend.postman_collection.json` (API endpoints)
   - `GenAI-LMS-Development.postman_environment.json` (environment variables)
4. Select the "GenAI LMS Development" environment from the dropdown (top right)

### Option 2: Manual Setup
1. Create a new collection in Postman called "GenAI LMS Backend"
2. Set collection variables:
   - `baseUrl`: `http://localhost:3000/api`
   - `accessToken`: (leave empty, will be filled by login)
   - `refreshToken`: (leave empty, will be filled by login)

## Testing Workflow

### 1. Start with Health Check
- **GET** `{{baseUrl}}/health`
- Should return: `{"status":"ok","timestamp":"...","uptime":...}`

### 2. Register a New User
- **POST** `{{baseUrl}}/auth/register`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john.doe@example.com",
  "password": "Test123456!"
}
```

### 3. Login with Registered User
- **POST** `{{baseUrl}}/auth/login`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "email": "john.doe@example.com",
  "password": "Test123456!"
}
```
- **Important**: Copy the `accessToken` from the response!

### 4. Test Protected Route
- **GET** `{{baseUrl}}/auth/profile`
- Headers: 
  - `Authorization: Bearer {paste-your-access-token-here}`
  - `Content-Type: application/json`

## Quick Test Commands (Alternative)

If you prefer command line testing, here are curl commands:

```bash
# Health check
curl -X GET http://localhost:3000/api/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john.doe@example.com","password":"Test123456!"}'

# Login user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"Test123456!"}'

# Get profile (replace YOUR_TOKEN_HERE with actual token)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

## Common Issues and Solutions

### 1. "Cannot connect to server"
- Make sure your backend is running (`npm run start:dev`)
- Check if port 3000 is available

### 2. "User already exists" error
- Change the email in registration request
- Or check if user was created successfully

### 3. "Invalid credentials" on login
- Make sure email and password match registration
- Check for typos in email/password

### 4. "Unauthorized" on protected routes
- Make sure you're using the correct `accessToken`
- Token might be expired, try logging in again
- Check the Authorization header format: `Bearer {token}`

### 5. Email/Password validation errors
- Password must be at least 8 characters
- Must contain uppercase, lowercase, number, and special character
- Email must be valid format

## Expected Response Formats

### Success Response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

## Next Steps
1. Test all authentication endpoints
2. Try error scenarios (wrong password, invalid email, etc.)
3. Test token refresh functionality
4. Test logout functionality
5. Try the OAuth endpoints (requires proper configuration)

## Notes
- Tokens automatically expire (check your JWT configuration)
- Email verification tokens will be logged to console if email is not configured
- For production, make sure to configure proper email service and OAuth credentials
