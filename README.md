# Scheduling App

A minimal full-stack scheduling application that supports:
- **Group Polls** - Doodle-style availability polls for finding the best time for group meetings
- **Booking Pages** - Calendly-style one-on-one booking pages

## Tech Stack

### Backend
- Node.js + TypeScript
- Express
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcrypt for password hashing

### Frontend
- React + TypeScript
- Vite
- React Router
- Minimal CSS (no design system)

## Features

### Authentication
- Sign up with email and password
- Login with JWT-based sessions
- Secure password hashing with bcrypt
- Protected routes for authenticated users

### Group Polls
- Create polls with multiple proposed time slots
- Share via public URL (no login required for voting)
- Participants select yes/no for each time slot
- View aggregated results showing yes/no counts per slot
- See detailed responses by participant

### Booking Pages
- Create booking pages with custom duration and timezone
- Define weekly availability rules (e.g., Mon-Fri 9am-5pm)
- Share via public URL
- Public calendar view showing next 14 days
- Automatic conflict detection
- View all upcoming bookings

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd doodle_2.0
```

### 2. Install dependencies

```bash
npm run install:all
```

This will install dependencies for the root, server, and client.

### 3. Set up PostgreSQL

Make sure PostgreSQL is running on your machine. Create a new database:

```bash
# Using psql
psql -U postgres
CREATE DATABASE scheduling_app;
\q
```

### 4. Configure environment variables

Copy the example env file and update it with your database credentials:

```bash
cp .env.example .env
```

Edit `.env` and update the following:

```env
# Server
PORT=3001
NODE_ENV=development

# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/scheduling_app?schema=public"

# Auth - Generate secure random strings for production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
```

### 5. Run database migrations

```bash
npm run db:migrate
```

This will create all the necessary tables in your database using Prisma.

### 6. Start the development servers

```bash
npm run dev
```

This will start both the backend server (port 3001) and frontend dev server (port 5173).

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Project Structure

```
doodle_2.0/
├── server/                 # Backend application
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── src/
│       ├── routes/        # API routes
│       ├── middleware/    # Auth middleware
│       ├── utils/         # Utilities (auth, public ID)
│       └── index.ts       # Server entry point
├── client/                # Frontend application
│   └── src/
│       ├── components/    # React components
│       ├── pages/         # Page components
│       ├── context/       # Auth context
│       ├── utils/         # API utilities
│       ├── types/         # TypeScript types
│       └── App.tsx        # Main app component
└── package.json           # Root package file
```

## Database Schema

### Users
- id, name, email (unique), password_hash, created_at

### Polls
- id, owner_user_id, public_id, title, description, created_at

### Poll Slots
- id, poll_id, start_time, end_time

### Poll Responses
- id, poll_id, slot_id, participant_name, choice (yes/no)

### Booking Pages
- id, owner_user_id, public_id, name, description, duration_minutes, timezone, created_at

### Availability Rules
- id, booking_page_id, day_of_week (0-6), start_time_local, end_time_local

### Bookings
- id, booking_page_id, start_time, end_time, invitee_name, invitee_email, created_at

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/me` - Get current user (requires auth)

### Polls
- `POST /api/polls` - Create a new poll (requires auth)
- `GET /api/polls` - List user's polls (requires auth)
- `GET /api/polls/:id` - Get poll details with results (requires auth)
- `GET /api/polls/public/:publicId` - Get public poll (no auth)
- `POST /api/polls/public/:publicId/responses` - Submit responses (no auth)

### Booking Pages
- `POST /api/booking-pages` - Create booking page (requires auth)
- `GET /api/booking-pages` - List user's booking pages (requires auth)
- `GET /api/booking-pages/:id` - Get booking page with bookings (requires auth)
- `GET /api/booking-pages/public/:publicId` - Get public booking page (no auth)
- `POST /api/booking-pages/public/:publicId/available-slots` - Get available slots (no auth)
- `POST /api/booking-pages/public/:publicId/bookings` - Create booking (no auth)

## Usage

### Creating a Group Poll

1. Sign up or login
2. Go to Dashboard
3. Click "Create New Poll"
4. Enter poll title and description
5. Add time slots with start and end times
6. Click "Create Poll"
7. Share the public URL with participants

### Voting on a Poll

1. Open the public poll URL
2. Enter your name
3. Select Yes or No for each time slot
4. Submit your response

### Creating a Booking Page

1. Sign up or login
2. Go to Dashboard
3. Click "Create New Booking Page"
4. Enter name, description, duration, and timezone
5. Add availability rules (day of week + time range)
6. Click "Create Booking Page"
7. Share the public URL with potential invitees

### Making a Booking

1. Open the public booking URL
2. Browse available time slots in the calendar view
3. Click on a time slot
4. Enter your name and email
5. Confirm booking

## Development Commands

```bash
# Install all dependencies
npm run install:all

# Run dev servers (backend + frontend)
npm run dev

# Run only backend
npm run dev:server

# Run only frontend
npm run dev:client

# Build frontend for production
npm run build

# Run database migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

## Security Notes

- Passwords are hashed using bcrypt with 10 salt rounds
- JWT tokens expire after 7 days
- Always use HTTPS in production
- Change JWT_SECRET and SESSION_SECRET in production
- This is v1 - no email verification or password reset

## Future Enhancements (Not in v1)

- Email notifications for bookings
- Password reset functionality
- Email verification
- Recurring availability patterns
- Buffer times between bookings
- Maximum bookings per day
- Custom branding
- Analytics

## License

MIT
