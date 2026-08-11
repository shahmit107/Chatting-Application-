# 📣 Echo — Real-Time Multi-Room Chat Application

A full-stack real-time chat application built with the **MERN stack** (MongoDB, Express, React, Node.js) and **WebSockets**. Echo supports multi-room messaging, dual-mode authentication (Password & OTP), OTP rate-limiting with timed lockouts, and rich media sharing (images, videos, audio, documents) powered by Cloudinary.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Database Schemas](#-database-schemas)
- [API Reference](#-api-reference)
- [WebSocket Protocol](#-websocket-protocol)
- [Authentication Flow](#-authentication-flow)
- [Media Upload Flow](#-media-upload-flow)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [License](#-license)

---

## ✨ Features

### Authentication & Security
- **Dual Login Modes** — Log in using a traditional email + password, or via a 6-digit Email OTP.
- **OTP Rate-Limiting** — After 5 failed OTP attempts, the user is blocked for 3 minutes. A live countdown timer is shown on the frontend.
- **Automatic OTP Cleanup** — A MongoDB TTL index on the `expiresAt` field automatically deletes expired OTP documents.
- **JWT Token Pair** — Short-lived Access Tokens (default 15m) for API authorization, plus long-lived Refresh Tokens (default 7d) stored as HTTP-only cookies.
- **Secure Token Rotation** — Refresh tokens are bcrypt-hashed before being stored in the database. On each refresh, a new token pair is issued.
- **Account Deletion** — Users can permanently delete their account from the sidebar.

### Real-Time Chat
- **WebSocket Protocol** — Uses the `ws` library for bidirectional, low-latency messaging.
- **Multi-Room Support** — Create/join any room by name. Switch between rooms without disconnecting.
- **Room History** — On joining a room, the server sends all previously saved messages for that room.
- **Online Users** — Each room broadcasts a live list of online users. The Topbar shows the count with a hover tooltip listing all names.
- **System Notifications** — Join/leave events are shown as system messages in the chat stream.
- **Auto-Reconnection** — The frontend WebSocket hook automatically reconnects after disconnection with a 2-second retry delay, and re-joins the last active room.
- **Session Persistence** — The last active room is saved to `localStorage` and restored on page reload.

### Rich Media Sharing
All media is uploaded to **Cloudinary** via protected REST endpoints, then the resulting URL is broadcast through WebSocket:

| Media Type | Upload Endpoint | Max Size | Accepted Formats | Chat Rendering |
|:---|:---|:---|:---|:---|
| **Image** | `POST /api/media/upload/image` | 5 MB | JPEG, PNG, WebP | Embedded `<img>` with hover download button |
| **Video** | `POST /api/media/upload/video` | 50 MB | MP4, WebM, QuickTime | Native `<video>` player with controls |
| **Audio** | `POST /api/media/upload/audio` | 10 MB | MP3, WAV, OGG, WebM, M4A | Inline `<audio>` player with controls |
| **Document** | `POST /api/media/upload/document` | 10 MB | PDF, DOC, DOCX | Styled file card with name, size (MB), and open-in-new-tab link |

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|:---|:---|
| Node.js (ES Modules) | Runtime environment |
| Express 5 | HTTP server and REST API framework |
| `ws` | WebSocket server library |
| MongoDB + Mongoose | Database and ODM |
| `bcryptjs` | Password and token hashing |
| `jsonwebtoken` | JWT generation and verification |
| `multer` | Multipart file upload parsing (memory storage) |
| `cloudinary` | Cloud-based media file storage |
| `nodemailer` | Transactional email delivery (Gmail SMTP) |
| `cookie-parser` | HTTP cookie parsing for refresh tokens |
| `cors` | Cross-origin resource sharing configuration |
| `dotenv` | Environment variable loading |

## 📁 Project Structure

```
Echo/
├── Backend/
│   ├── server.js                          # Entry point — HTTP + WebSocket server
│   ├── .env                               # Environment variables (not committed)
│   ├── package.json
│   └── src/
│       ├── app.js                         # WebSocket connection handler & message router
│       ├── config/
│       │   └── config.js                  # Env var validation & export
│       ├── controllers/
│       │   ├── auth.controller.js         # Register, login, OTP, refresh, logout, delete
│       │   └── media.controller.js        # Image, video, audio, document upload handlers
│       ├── db/
│       │   └── db.js                      # MongoDB connection via Mongoose
│       ├── handlers/
│       │   ├── handlers.join.js           # Room join logic + history fetch
│       │   ├── handlers.chat.js           # Message save + broadcast
│       │   ├── handlers.switchRoom.js     # Room switch with leave/join transitions
│       │   └── handlers.disconnect.js     # Cleanup on WebSocket close
│       ├── MIddlewares/
│       │   ├── auth.middleware.js         # JWT verification + user lookup
│       │   └── upload.middleware.js       # Multer configs with file type/size limits
│       ├── model/
│       │   ├── model.user.js              # User schema (userName, email, password, rooms)
│       │   ├── model.otp.js               # OTP schema with TTL index
│       │   └── model.message.js           # Message schema (text + media fields)
│       ├── routes/
│       │   ├── auth.routes.js             # Auth REST endpoints
│       │   └── media.routes.js            # Media upload REST endpoints
│       ├── services/
│       │   └── email.service.js           # Nodemailer transporter + sendEmail()
│       └── utils/
│           ├── utils.generateTokens.js    # JWT access/refresh token generators
│           ├── utils.completeLogin.js     # Token pair creation + cookie setting
│           ├── utils.verifyAccessToken.js # JWT verification + user fetch
│           ├── utils.broadcastToRoom.js   # Broadcast JSON to all clients in a room
│           ├── utils.online_users.js      # Collect online usernames in a room
│           ├── utils.sendError.js         # WebSocket error message helper
│           ├── utils.otpGenerator.js      # OTP generation + HTML email template
│           └── utils.cloudinaryUpload.js  # Cloudinary configuration + buffer upload
│
└── Frontend/
    ├── index.html                         # SPA entry point (title: "Echo")
    ├── package.json
    ├── vite.config.js                     # Vite + React plugin config
    ├── public/
    │   ├── echo_logo.png                  # Echo brand logo
    │   ├── favicon.svg                    # Animated SVG favicon
    │   └── icons.svg                      # SVG sprite sheet
    └── src/
        ├── main.jsx                       # React root render
        ├── App.jsx                        # Root component — auth gate + chat shell
        ├── App.css                        # Minimal app-level styles
        ├── index.css                      # Global resets + dark theme base
        ├── components/
        │   ├── AuthPage.jsx               # Auth wrapper (logo + login/register toggle)
        │   ├── Login.jsx                  # Login form (password mode + OTP mode)
        │   ├── Register.jsx               # Registration form
        │   ├── Sidebar.jsx                # Room list + logout/delete buttons
        │   ├── RoomList.jsx               # Scrollable joined rooms navigation
        │   ├── Topbar.jsx                 # Room title + online count + join button
        │   ├── MessagePane.jsx            # Message stream with media rendering
        │   ├── Composer.jsx               # Text input + 4 media upload buttons
        │   ├── JoinRoomModal.jsx          # Modal dialog for joining rooms
        │   └── OnlineUsers.jsx            # Online users list (currently unused)
        ├── hooks/
        │   ├── useAuth.js                 # Auth state, token refresh, login/logout
        │   ├── useWebSocket.js            # Low-level WebSocket with auto-reconnect
        │   └── useChatSocket.js           # High-level chat state + media upload
        ├── utils/
        │   └── messages.js                # Message normalization + formatting
        ├── styles/
        │   ├── Auth.css                   # Authentication page styles (402 lines)
        │   └── Chat.css                   # Chat interface styles (650+ lines)
        └── constants/                     # (Reserved for future use)
```

---

## 🗄️ Database Schemas

### User (`users`)
```javascript
{
  userName:     { type: String,   required: true, unique: true },
  email:        { type: String,   required: true, unique: true },
  password:     { type: String },                                // bcrypt hash
  isVerified:   { type: Boolean,  default: false },
  refreshToken: { type: String },                                // bcrypt-hashed refresh token
  joinedRooms:  { type: [String], default: [] }                  // room IDs user has joined
}
```

### OTP (`otps`)
```javascript
{
  email:        { type: String,   required: true, unique: true },
  user:         { type: ObjectId, ref: "users", required: true },
  otpHash:      { type: String,   required: true },              // bcrypt hash of 6-digit OTP
  expiresAt:    { type: Date,     required: true,                // TTL index — auto-deleted
                  index: { expires: 0 } },
  attempts:     { type: Number },                                // failed verification count
  blockedUntil: { type: Date }                                   // rate-limit block expiry
}
```

### Message (`messages`)
```javascript
{
  roomId:              { type: String, required: true },
  userName:            { type: String, required: true },
  message:             { type: String },                         // text content
  messageType:         { type: String, enum: ["text", "image", "video", "audio", "document"],
                         default: "text" },
  mediaUrl:            { type: String },                         // Cloudinary URL
  cloudinaryPublicId:  { type: String },                         // for deletion/management
  fileName:            { type: String },                         // original filename
  mimeType:            { type: String },                         // e.g. "image/png"
  fileSize:            { type: Number },                         // bytes
  createdAt:           { type: Date,   default: Date.now }
}
```

---

## 📡 API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|:---|:---|:---|:---|
| `POST` | `/register` | ❌ | Create a new user. Body: `{ userName, email, password }` |
| `POST` | `/login` | ❌ | Password login. Body: `{ email, password }`. Returns `accessToken` + sets `refreshToken` cookie |
| `POST` | `/sendOtp` | ❌ | Send 6-digit OTP to email. Body: `{ email }`. Rate-limited: 5 attempts max, then 3-min block |
| `POST` | `/verifyOtp` | ❌ | Verify OTP and login. Body: `{ email, otp }`. Returns `accessToken` + sets `refreshToken` cookie |
| `GET` | `/me` | ✅ Bearer | Get current user profile. Returns `{ userName, email, joinedRooms }` |
| `POST` | `/refresh` | Cookie | Exchange refresh token cookie for new access token pair |
| `POST` | `/logout` | Cookie | Clear refresh token from DB and cookie |
| `DELETE` | `/deleteAccount` | ✅ Bearer | Permanently delete the authenticated user's account |

### Media Upload — `/api/media/upload`

All routes require `Authorization: Bearer <accessToken>`. Send files as `multipart/form-data`.

| Method | Endpoint | Field Name | Max Size | Accepted MIME Types |
|:---|:---|:---|:---|:---|
| `POST` | `/image` | `image` | 5 MB | `image/jpeg`, `image/png`, `image/webp` |
| `POST` | `/video` | `video` | 50 MB | `video/mp4`, `video/webm`, `video/quicktime` |
| `POST` | `/audio` | `audio` | 10 MB | `audio/mpeg`, `audio/wav`, `audio/ogg`, `audio/webm`, `audio/mp4`, `audio/x-m4a` |
| `POST` | `/document` | `file` | 10 MB | `application/pdf`, `application/msword`, `.docx` |

**Success Response** (all upload routes):
```json
{
  "type": "success",
  "payload": {
    "message": "Uploaded successfully",
    "mediaUrl": "https://res.cloudinary.com/...",
    "cloudinaryPublicId": "echo/images/abc123",
    "fileName": "photo.jpg",
    "mimeType": "image/jpeg",
    "fileSize": 204800,
    "messageType": "image"
  }
}
```

---

## 🔌 WebSocket Protocol

### Connection
```
ws://localhost:8080/?token=<accessToken>
```
The server verifies the JWT token on connection. Invalid or missing tokens cause immediate disconnection.

### Client → Server Messages

| Type | Payload | Description |
|:---|:---|:---|
| `join` | `{ roomId, userName }` | Join a chat room. Server sends room history + broadcasts join notification |
| `chat` | `{ messageType: "text", message }` | Send a text message |
| `chat` | `{ messageType, mediaUrl, cloudinaryPublicId, fileName, mimeType, fileSize }` | Send a media message (after HTTP upload) |
| `switch_Room` | `{ roomId }` | Switch to a different room. Leaves current room, joins new one |

### Server → Client Messages

| Type | Payload | Description |
|:---|:---|:---|
| `chat` | `{ roomId, userName, message, messageType, mediaUrl, ... , time }` | Chat message (text or media) broadcast to room |
| `system` | `{ message, roomId }` | System notification (e.g. "Alice joined the room") |
| `room-history` | `{ oldMessages: [...] }` | Array of historical messages for a room |
| `onlineUsers` | `{ message: ["Alice", "Bob"] }` | Updated list of online users in the room |
| `joined_rooms` | `{ message: ["room1", "room2"] }` | List of rooms the user has joined |
| `error` | `{ message }` | Error notification |

---

## 🔐 Authentication Flow

### Password Login
```
1. User submits email + password
2. POST /api/auth/login
3. Server verifies credentials (bcrypt compare)
4. Server generates access token (JWT, 15m) + refresh token (JWT, 7d)
5. Refresh token is bcrypt-hashed and stored in user document
6. Response: { accessToken } + Set-Cookie: refreshToken (httpOnly)
7. Frontend stores accessToken in localStorage
8. Frontend calls GET /api/auth/me to fetch user profile
9. User is redirected to chat interface
```

### OTP Login
```
1. User enters email → POST /api/auth/sendOtp
2. Server generates 6-digit OTP, bcrypt-hashes it
3. Server upserts OTP document (email, otpHash, expiresAt: 5 min)
4. Server sends branded HTML email via Nodemailer
5. User enters OTP → POST /api/auth/verifyOtp
6. Server checks: block status → attempts count → bcrypt compare
7. If valid: deletes OTP document, completes login (same as step 4-9 above)
8. If invalid: increments attempts. After 5 failures → blocked for 3 minutes
```

### Token Refresh
```
1. Frontend sets up periodic refresh (every ACCESS_TOKEN_EXPIRY - 30s)
2. POST /api/auth/refresh (sends refreshToken cookie)
3. Server verifies JWT, compares bcrypt hash with stored token
4. Server issues new access + refresh token pair
5. Frontend updates stored accessToken
```

---

## 🖼️ Media Upload Flow

```
1. User clicks image/video/audio/document button in Composer
2. Browser file picker opens (filtered by accepted MIME types)
3. User selects file → handleMediaSend(event, mediaType) fires
4. Frontend creates FormData, appends file with correct field name:
   - image → "image"
   - video → "video"  
   - audio → "audio"
   - document → "file"
5. POST to /api/media/upload/{mediaType} with Bearer token
6. Backend multer middleware validates file type and size
7. Backend uploads file buffer to Cloudinary
8. Backend returns { mediaUrl, cloudinaryPublicId, fileName, ... }
9. Frontend sends WebSocket message:
   { type: "chat", payload: { messageType, mediaUrl, ... } }
10. Backend saves message to MongoDB, broadcasts to room
11. All clients render media inline based on messageType
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** — Local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **Cloudinary** account — [Sign up free](https://cloudinary.com/)
- **Gmail App Password** — For OTP email delivery. [Generate one here](https://myaccount.google.com/apppasswords)

---

## ⚙️ Environment Variables

Create a `.env` file inside the `Backend/` directory:

```env
# Server
WS_PORT=8080

# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/echo

# Security
SALT_ROUNDS=10
ACCESS_TOKEN_SECRET=your_strong_random_secret_1
REFRESH_TOKEN_SECRET=your_strong_random_secret_2
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Email (Gmail SMTP)
GOOGLE_USER=yourname@gmail.com
EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token

# Cloudinary
CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

> **Note**: The `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN` fields are validated at startup. If you are only using Gmail App Password authentication (not OAuth), you can set these to any non-empty placeholder value.

---

## 💻 Running the Application

### 1. Backend

```bash
cd Backend
npm install
node server.js
```

The server starts on `http://localhost:8080` (serves both HTTP REST API and WebSocket connections).

**Expected console output:**
```
SERVER IS RUNNING ON 8080
Email server is ready to send messages
Connected to database successfully!
```

### 2. Frontend

```bash
cd Frontend
npm install
npm run dev
```

The Vite dev server starts on `http://localhost:5173`.

### 3. Open in Browser

Navigate to `http://localhost:5173`. You'll see the Echo login page. Register a new account, then log in to start chatting!

To test real-time messaging, open a second browser tab, log in with a different account, and join the same room.

---
