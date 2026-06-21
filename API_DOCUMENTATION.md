# KORA API Documentation

Base URL: `https://apikora.com/api/v1`

All authenticated endpoints require `Authorization: Bearer <jwt_token>` header.

All responses follow format: `{ success: boolean, message: string, data?: object|array }`

---

## Authentication Required

All endpoints below require a valid Bearer token in the Authorization header.

---

## Users API (`/users.php`)

### POST - Login/Register

**Register:**
```
POST /users.php
Content-Type: application/json

{
  "type": "register",
  "username": "string (min 3 chars)",
  "email": "valid email",
  "password": "string (min 6 chars)",
  "user_type": "pitch_owner|admin" // Ignored; always set to 'player' for self-registration
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Account created successfully! You can now login."
}
```

**Login:**
```
POST /users.php
Content-Type: application/json

{
  "type": "login",
  "email": "string",
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": int, "username": string, "email": string, "user_type": string, ... },
    "token": "jwt_token",
    "refresh_token": "refresh_token_id"
  }
}
```

**Verification Required (403):**
```json
{
  "message": "Verification required [USER_ID:123]"
}
```

**GET - Get User Stats (requires auth)**
```
GET /users.php?stats_for_user_id=123
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User stats retrieved",
  "data": {
    "matches_played": int,
    "total_goals": int,
    "total_assists": int
  }
}
```

**Unauthorized (403):** If requesting stats for another user without admin role.

**GET - Search Users (requires auth)**
```
GET /users.php?search=query
```
Minimum 2 characters required.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved",
  "data": [
    { "id": int, "username": string, "user_type": string }
  ]
}
```

**PUT - Update FCM Token (requires auth)**
```
PUT /users.php
Content-Type: application/json

{
  "type": "update_fcm_token",
  "fcm_token": "string"
}
```

**Success Response (200):**
```json
{ "success": true, "message": "FCM token updated successfully" }
```

**PUT - Switch User Role (admin only)**
```
PUT /users.php
Content-Type: application/json

{
  "id": int,
  "user_type": "player|organizer|pitch_owner|admin"
}
```

**DELETE - Delete Account (requires auth)**
```
DELETE /users.php
```
Deletes user and all related data (GDPR compliance).

---

## Matches API (`/matches.php`)

### GET - List Matches

**Public Matches (no auth):**
```
GET /matches.php
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Matches retrieved",
  "data": [
    {
      "id": int,
      "pitch_id": int,
      "pitch_name": string,
      "creator_id": int,
      "match_type": "public|private",
      "match_size": "5v5|6v6|...",
      "duration": int,
      "match_date": "YYYY-MM-DD HH:MM:SS",
      "status": "scheduled|completed|cancelled",
      "player_count": int,
      "player_stats": "player_id:goals,...|..."
    }
  ]
}
```

**Get All Matches (requires auth):**
```
GET /matches.php?all=true
```

**Get Match by ID:**
```
GET /matches.php?id=123
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Match retrieved",
  "data": {
    "id": int,
    "pitch_id": int,
    "pitch_name": string,
    "creator_id": int,
    "match_type": string,
    "match_size": string,
    "duration": int,
    "match_date": string,
    "status": string,
    "player_count": int,
    "player_stats": string,
    "players": [
      { "id": int, "username": string, "profile_picture_url": string }
    ]
  }
}
```

**Get Upcoming Matches (requires auth):**
```
GET /matches.php?upcoming_for_user_id=123
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Upcoming matches retrieved",
  "data": [
    {
      "id": int,
      "pitch_name": string,
      "match_date": "YYYY-MM-DD HH:MM:SS",
      "match_size": string
    }
  ]
}
```

**Check Availability:**
```
GET /matches.php?check_availability=true&pitch_id=1&date=2024-01-15
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Occupied slots retrieved",
  "data": [
    { "match_date": "2024-01-15 14:00:00", "duration": 90 }
  ]
}
```

### POST - Create Match (requires auth)

```
POST /matches.php
Content-Type: application/json

{
  "pitch_id": int,
  "match_type": "public|private",
  "match_size": "5v5|6v6|7v7|8v8|9v9|11v11",
  "duration": int,
  "match_date": "YYYY-MM-DD HH:MM:SS"
}
```

**Success Response (200):**
```json
{ "success": true, "message": "Match created successfully" }
```

**Validation Error (422):**
```json
{ "message": "Match creation validation failed" }
```

### PATCH - Join Match (requires auth)

```
PATCH /matches.php
Content-Type: application/json

{
  "match_id": int,
  "player_id": int  // Must match authenticated user or be admin
}
```

**Success Response (200):**
```json
{ "success": true, "message": "Player joined match successfully" }
```

**Sabotage Prevention Error:**
```json
{ "message": "You can only be joined to 3 upcoming matches at once." }
```

### DELETE - Leave Match (requires auth)

```
DELETE /matches.php
Content-Type: application/json

{
  "match_id": int,
  "player_id": int  // Must match authenticated user or be admin
}
```

**Success Response (200):**
```json
{ "success": true, "message": "Player left match successfully" }
```

**Delete Match Entirely:**
Same endpoint without `player_id`:
```json
{ "success": true, "message": "Match deleted successfully" }
```

---

## Pitches API (`/pitches.php`)

### GET - List Pitches (no auth required)

```
GET /pitches.php
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Pitches retrieved",
  "data": [
    {
      "id": int,
      "name": string,
      "location": string,
      "owner_id": int,
      "status": "pending|approved|denied",
      "price_per_hour": int,
      "opening_hours": string
    }
  ]
}
```

### GET - Get Pitch by ID

```
GET /pitches.php?id=123
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Pitch retrieved",
  "data": {
    "id": int,
    "name": string,
    "location": string,
    "owner_id": int,
    "status": string,
    "price_per_hour": int,
    "opening_hours": string,
    "created_at": "YYYY-MM-DD HH:MM:SS"
    // Note: contact_number excluded unless admin
  }
}
```

### GET - Recent Pitches

```
GET /pitches.php?recent=true&limit=5
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Recent pitches retrieved",
  "data": [ ... ]
}
```

### POST - Create Pitch (requires admin or pitch_owner)

```
POST /pitches.php
Content-Type: application/json

{
  "name": string,
  "location": string,
  "price_per_hour": int,
  "contact_number": string,
  "opening_hours": string
}
```

**Success Response (200):**
```json
{ "success": true, "message": "Pitch created successfully" }
```

### PUT - Update Pitch (requires admin or owner)

```
PUT /pitches.php
Content-Type: application/json

{
  "id": int,
  "name": string,
  "location": string,
  "price_per_hour": int,
  "status": "pending|approved|denied"
}
```

**Success Response (200):**
```json
{ "success": true, "message": "Pitch updated successfully" }
```

---

## Friends API (`/friends.php`)

### GET - Get Friends List (requires auth)

```
GET /friends.php
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Friends retrieved",
  "data": [
    {
      "id": int,
      "username": string,
      "user_type": string,
      "profile_picture_url": string
    }
  ]
}
```

### GET - Get Pending Requests (requires auth)

```
GET /friends.php?pending=true
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Pending requests retrieved",
  "data": [
    {
      "id": int,
      "username": string,
      "created_at": "YYYY-MM-DD HH:MM:SS"
    }
  ]
}
```

### POST - Send Friend Request (requires auth)

```
POST /friends.php
Content-Type: application/json

{
  "friend_id": int
}
```

**Success Response (200):**
```json
{ "success": true, "message": "Friend request sent" }
```

**Note:** Only users who are already friends can send match invitations.

### PATCH - Accept/Decline Request (requires auth)

```
PATCH /friends.php
Content-Type: application/json

{
  "friend_id": int,
  "action": "accept" | "decline"
}
```

**Success Response (200):**
```json
{ "success": true, "message": "Friend request accepted" }
```

---

## Invitations API (`/invitations.php`)

### GET - Get Match Invitations

```
GET /invitations.php?match_id=123    # Match-specific (requires participant/admin)
GET /invitations.php                 # User's invitations (requires auth)
GET /invitations.php?user_id=123      # Specific user (requires own data or admin)
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Invitations retrieved",
  "data": [
    {
      "id": int,
      "match_id": int,
      "inviter_id": int,
      "invitee_id": int,
      "status": "pending|accepted|declined",
      "match_date": "YYYY-MM-DD HH:MM:SS",
      "pitch_name": string,
      "inviter_name": string
    }
  ]
}
```

### POST - Send Invitation (requires auth, must be friends)

```
POST /invitations.php
Content-Type: application/json

{
  "match_id": int,
  "invitee_id": int  // inviter_id auto-set from auth token
}
```

**Success Response (200):**
```json
{ "success": true, "message": "Invitation sent successfully" }
```

**Failure:** Returns error if users are not friends.

### PATCH - Respond to Invitation (requires auth)

```
PATCH /invitations.php
Content-Type: application/json

{
  "id": int,
  "status": "accepted" | "declined"
}
```

**Success Response (200):**
```json
{ "success": true, "message": "Invitation status updated" }
```

---

## Notifications API (`/notifications.php`)

### GET - Get Notifications (requires auth)

```
GET /notifications.php?user_id=123    # Optional (defaults to auth user)
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Notifications retrieved",
  "data": [
    {
      "id": int,
      "user_id": int,
      "message": string,
      "is_read": boolean,
      "created_at": "YYYY-MM-DD HH:MM:SS"
    }
  ]
}
```

### PATCH - Mark as Read (requires auth)

```
PATCH /notifications.php
Content-Type: application/json

{ "id": int }
```

**Success Response (200):**
```json
{ "success": true, "message": "Notification marked as read" }
```

---

## Reviews API (`/reviews.php`)

### GET - Get Pitch Reviews

```
GET /reviews.php?pitch_id=123
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Reviews retrieved",
  "data": [
    {
      "id": int,
      "pitch_id": int,
      "player_id": int,
      "rating": int,
      "comment": string,
      "created_at": "YYYY-MM-DD HH:MM:SS",
      "username": string
    }
  ]
}
```

### POST - Submit Review (requires auth)

```
POST /reviews.php
Content-Type: application/json

{
  "pitch_id": int,
  "player_id": int,  // Must match auth user or be admin
  "rating": int (1-5),
  "comment": string
}
```

**Success Response (200):**
```json
{ "success": true, "message": "Review added successfully" }
```

**Failure:** User must have completed a match at the pitch.

---

## Token Refresh API (`/refresh.php`)

### POST - Refresh JWT Token (no auth required, uses refresh token in body)

```
POST /refresh.php
Content-Type: application/json

{ "refresh_token": "string" }
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "new_jwt_token",
    "refresh_token": "new_refresh_token_id"
  }
}
```

**Failure (401):**
```json
{ "message": "Invalid or expired refresh token" }
```

---

## Verify OTP API (`/verify.php`)

### POST - Verify Email (no auth required)

```
POST /verify.php
Content-Type: application/json

{
  "user_id": int,
  "code": "000000"  // 6-digit OTP
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": { "id": int, "username": string, ... },
    "token": "jwt_token",
    "refresh_token": "refresh_token_id"
  }
}
```

**Failure (400):**
```json
{ "message": "Invalid or expired verification code" }
```

---

## Health Check API (`/health.php`)

### GET - Service Health (no auth)

```
GET /health.php
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "ok",
    "timestamp": int,
    "environment": "development|production",
    "services": { "database": "ok" }
  }
}
```

**Failure (503):**
```json
{ "message": "Service unhealthy" }
```

---

## User Profile API (`/me.php`) - Requires Auth

### GET - Get Current User

```
GET /me.php
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User profile retrieved",
  "data": { "user": { ... } }  // password excluded
}
```

---

## Warnings API (`/warnings.php`) - Requires Auth

### GET - Get Player Warnings

```
GET /warnings.php?player_id=123
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Warnings retrieved",
  "data": [
    {
      "id": int,
      "admin_id": int,
      "player_id": int,
      "reason": string,
      "created_at": "YYYY-MM-DD HH:MM:SS"
    }
  ]
}
```

### POST - Add Warning (admin only)

```
POST /warnings.php
Content-Type: application/json

{
  "player_id": int,
  "reason": string
}
```

---

## Admin Suspicious Activity API (`/admin/suspicious.php`) - Requires Admin

### GET - Suspicious Users List

```
GET /admin/suspicious.php
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Suspicious users list retrieved",
  "data": [
    {
      "id": int,
      "user_id": int,
      "type": string,
      "details": string,
      "timestamp": "YYYY-MM-DD HH:MM:SS"
    }
  ]
}
```

### GET - User Suspicious Activity

```
GET /admin/suspicious.php?user_id=123
```

---

## Error Response Format

All errors return: `{ "message": "error description" }`

Common HTTP codes:
- 400: Bad request
- 401: Missing/invalid token
- 403: Unauthorized (not admin/owner)
- 404: Resource not found
- 405: Method not allowed
- 422: Validation error
- 429: Rate limit exceeded
- 500: Server error
- 503: Service unavailable