# REST & WebSocket API Specification 📡

Base URL: `http://localhost:5000/api` (Development)

All authenticated requests must include the HTTP header:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new author or reader account.

**Request Body:**
```json
{
  "email": "chala@example.com",
  "username": "chala_g",
  "name": "Chala Gemechu",
  "password": "strongPassword123"
}
```

**Response (`201 Created`):**
```json
{
  "message": "Nagaan dhuftan! Galmeen keessan milkaa'eera.",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "cm...uuid",
    "email": "chala@example.com",
    "username": "chala_g",
    "name": "Chala Gemechu",
    "role": "USER",
    "avatarUrl": null,
    "createdAt": "2026-08-20T12:00:00.000Z"
  }
}
```

---

### `POST /api/auth/login`
Authenticates existing credentials.

**Request Body:**
```json
{
  "email": "chala@example.com",
  "password": "strongPassword123"
}
```

**Response (`200 OK`):**
```json
{
  "message": "Baga nagaan deebitan!",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "cm...uuid",
    "email": "chala@example.com",
    "username": "chala_g",
    "name": "Chala Gemechu",
    "role": "USER"
  }
}
```

---

### `GET /api/auth/me`
Retrieves current authenticated profile.

**Headers:** `Authorization: Bearer <token>`

**Response (`200 OK`):**
```json
{
  "id": "cm...uuid",
  "email": "chala@example.com",
  "username": "chala_g",
  "name": "Chala Gemechu",
  "role": "USER",
  "bio": "Barreessaa fi qorataa seenaa.",
  "avatarUrl": "https://res.cloudinary.com/..."
}
```

---

## 2. Articles Endpoints

### `GET /api/articles`
Queries published articles with pagination, sorting, and filters.

**Query Parameters:**
- `page`: Page number (default: `1`)
- `limit`: Number of items per page (default: `10`)
- `category`: Filter by literary category (`ODUU`, `MAMMAAKSA`, `SEENAA`, `WALALOO`, `DURDURII`, `ASOOSAMA`, `OOLMAA`, `SAGALEE`)
- `tag`: Filter by tag slug
- `author`: Filter by author username
- `sort`: `latest`, `top`, or `relevant`
- `search`: Keyword searching title, excerpt, and author name

**Response (`200 OK`):**
```json
{
  "articles": [
    {
      "id": "art_123",
      "slug": "seenaa-oromoo-bareedaa",
      "title": "Seenaa Oromoo Bareedaa",
      "excerpt": "Barruun kun seenaa bal'aa fi ajaa'ibsiisaa qabata...",
      "coverImageUrl": "https://example.com/cover.png",
      "category": "SEENAA",
      "readingTime": 4,
      "viewCount": 152,
      "createdAt": "2026-08-20T12:00:00.000Z",
      "author": {
        "id": "u_1",
        "name": "Chala Gemechu",
        "username": "chala_g",
        "avatarUrl": null
      },
      "tags": [
        { "tag": { "id": "t_1", "name": "Seenaa", "slug": "seenaa" } }
      ],
      "_count": { "reactions": 24, "comments": 8 },
      "reactionCounts": { "likes": 20, "unicorns": 4 }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

### `POST /api/articles`
Publishes a new literary work.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Asoosama Gabaabaa: Gadaa",
  "content": "<p>Qabiyyee asoosamaa bareedaa...</p>",
  "category": "ASOOSAMA",
  "tags": ["asoosama", "oromiyaa"],
  "coverImageUrl": "https://example.com/cover.png",
  "published": true
}
```

**Response (`201 Created`):**
```json
{
  "id": "art_456",
  "slug": "asoosama-gabaabaa-gadaa",
  "title": "Asoosama Gabaabaa: Gadaa",
  "readingTime": 5,
  "published": true
}
```

---

### `POST /api/articles/:id/react`
Toggles an article reaction.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "LIKE" // or "UNICORN"
}
```

**Response (`200 OK`):**
```json
{
  "action": "ADDED", // or "REMOVED"
  "reaction": { "id": "rx_1", "type": "LIKE", "userId": "...", "articleId": "..." }
}
```

---

## 3. Notifications & Real-Time Endpoints

### `GET /api/notifications`
Retrieves latest 20 notifications for the authenticated user.

**Response (`200 OK`):**
```json
[
  {
    "id": "notif_1",
    "type": "LIKE",
    "message": "liked your article.",
    "link": "/article/seenaa-oromoo-bareedaa",
    "isRead": false,
    "createdAt": "2026-08-20T14:30:00.000Z",
    "actor": {
      "name": "Tolasa",
      "username": "tolasa_b",
      "avatarUrl": null
    }
  }
]
```

### `GET /api/notifications/unread-count`
Retrieves total count of unread notifications.

**Response (`200 OK`):**
```json
{
  "count": 3
}
```

### `PATCH /api/notifications/mark-all-read`
Marks all user notifications as read.

**Response (`200 OK`):**
```json
{
  "message": "All notifications marked as read"
}
```

---

## 4. WebSocket Events (Socket.IO)

- **Connection**: Connects to server root URL (e.g. `http://localhost:5000`).
- **Client Emit `join`**: Sends authenticated user ID to join private room:
  ```js
  socket.emit('join', user.id);
  ```
- **Server Broadcast `new_notification`**: Emitted directly to `socket.to(userId)` when actions occur:
  ```json
  {
    "id": "notif_uuid",
    "type": "FOLLOW",
    "message": "started following you.",
    "link": "/user/username",
    "isRead": false
  }
  ```
