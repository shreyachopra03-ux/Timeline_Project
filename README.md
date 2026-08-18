# TimelineApp

A full-stack photo timeline app. Upload photos, browse them on a timeline, auto-generate video clips from your memories, and create shared albums with other people.

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Clerk (auth)
- Axios

**Backend**
- Node.js + Express 5 + TypeScript
- MongoDB + Mongoose
- Clerk (auth, webhooks)
- Cloudinary (media storage)
- Fluent-ffmpeg (clip generation)
- Multer (uploads)

## Project Structure

```
TimelineApp/
├── backend/
│   ├── src/
│   │   ├── app.ts              # Express app entry point
│   │   ├── config/              # DB and Cloudinary config
│   │   ├── controllers/         # Route handlers (media, clips, shared, webhooks)
│   │   ├── middleware/          # Auth guard, multer upload config
│   │   ├── models/               # Mongoose models
│   │   └── routes/               # API route definitions
│   └── apiList.md                # API endpoint reference
└── frontend/
    └── src/
        ├── api/                   # Axios API clients
        ├── components/            # Reusable UI components
        ├── context/               # Auth context
        └── pages/                 # Route-level pages
```

## Features

- **Timeline** - upload photos/videos and browse them chronologically, filterable by date range
- **Clips** - auto-generate, rename, and manage short video clips from your media
- **Shared albums** - create shared collections, invite members, add/remove photos
- **Auth** - Clerk-based authentication with webhook sync to the database

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- Clerk account (publishable + secret keys)
- Cloudinary account (for media storage)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:

```
MONGO_URI=
PORT=
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_CLOUD_NAME=
```

```bash
npm run dev     # start in dev mode (nodemon + ts-node)
npm run build   # compile TypeScript
npm run start   # run compiled build
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/` with:

```
VITE_CLERK_PUBLISHABLE_KEY=
VITE_API_URL=
```

```bash
npm run dev       # start Vite dev server
npm run build     # production build
npm run preview   # preview production build
```

## API Overview

All routes are prefixed with `/api` and (aside from the Clerk webhook) require authentication.

| Resource | Base path |
|---|---|
| Media | `/api/media` |
| Clips | `/api/clips` |
| Shared albums | `/api/shared` |
| Clerk webhook | `/api/webhooks/clerk` |

See [`backend/apiList.md`](backend/apiList.md) for the full endpoint list.

## License

ISC
