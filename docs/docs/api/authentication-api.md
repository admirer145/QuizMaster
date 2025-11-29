---
sidebar_position: 1
title: Authentication API
---

# Authentication API

The Authentication API handles user registration and login.

## Base URL

```
http://localhost:3001/api/auth
```

## Endpoints

### Sign Up

Create a new user account.

**Endpoint:** `POST /api/auth/signup`

**Request Body:**

```json
{
  "username": "string (3-50 characters, required)",
  "password": "string (min 6 characters, required)",
  "acceptedTerms": "boolean (required, must be true)"
}
```

**Success Response:**

```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Status Code:** `201 Created`

**Error Responses:**

| Status Code | Error | Description |
|-------------|-------|-------------|
| `400` | Validation Error | Invalid input data |
| `409` | Conflict | Username already exists |
| `400` | Terms Not Accepted | User must accept terms |

**Example Error:**

```json
{
  "error": "Username already exists"
}
```

**Example Request:**

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepassword123",
    "acceptedTerms": true
  }'
```

---

### Login

Authenticate an existing user.

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Success Response:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Status Code:** `200 OK`

**Error Responses:**

| Status Code | Error | Description |
|-------------|-------|-------------|
| `400` | Validation Error | Missing username or password |
| `401` | Unauthorized | Invalid credentials |

**Example Error:**

```json
{
  "error": "Invalid credentials"
}
```

**Example Request:**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepassword123"
  }'
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database
    
    Client->>API: POST /api/auth/signup
    API->>API: Validate input
    API->>API: Hash password (bcrypt)
    API->>Database: Create user
    Database-->>API: User created
    API->>API: Generate JWT token
    API-->>Client: Token + user data
    
    Note over Client: Store token in localStorage
    
    Client->>API: POST /api/auth/login
    API->>Database: Find user by username
    Database-->>API: User data
    API->>API: Verify password (bcrypt)
    API->>API: Generate JWT token
    API-->>Client: Token + user data
```

## Using the JWT Token

After successful login or signup, include the JWT token in subsequent requests:

**Header:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example:**

```bash
curl -X GET http://localhost:3001/api/quizzes/my-library \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Features

### Password Hashing

- Passwords are hashed using **bcrypt** with salt rounds
- Original passwords are never stored
- Hashing is one-way (cannot be reversed)

### JWT Token

- Tokens are signed with a secret key
- Tokens include:
  - User ID
  - Username
  - Issued at timestamp
  - Expiration time
- Tokens are validated on protected routes

### Rate Limiting

Authentication endpoints are rate-limited:

- **5 requests per 15 minutes** per IP address
- Prevents brute force attacks
- Returns `429 Too Many Requests` when exceeded

## Frontend Integration

### React Example

```javascript
// Signup
const signup = async (username, password) => {
  const response = await fetch('http://localhost:3001/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
      acceptedTerms: true,
    }),
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Store token
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } else {
    throw new Error(data.error);
  }
};

// Login
const login = async (username, password) => {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  
  const data = await response.json();
  
  if (response.ok) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } else {
    throw new Error(data.error);
  }
};

// Logout
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
```

## Testing

### Using cURL

**Signup:**

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123","acceptedTerms":true}'
```

**Login:**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'
```

### Using Postman

1. Create a new POST request
2. Set URL to `http://localhost:3001/api/auth/signup` or `/login`
3. Set Headers: `Content-Type: application/json`
4. Set Body (raw JSON):
   ```json
   {
     "username": "testuser",
     "password": "testpass123",
     "acceptedTerms": true
   }
   ```
5. Send request

## Related Endpoints

- [Quizzes API](./quizzes-api.md) - Quiz management endpoints
- [Results API](./results-api.md) - Quiz results and analytics
- [Legal API](./legal-api.md) - GDPR compliance endpoints
