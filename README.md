# QuickShow Full Stack Movie Ticket Booking

A full-stack MERN-style movie ticket booking app with React, Vite, Express, MongoDB, Clerk auth, Stripe checkout, and Inngest event workflows.

## Features

- React + Vite frontend with Clerk authentication
- Express server with MongoDB integration
- Movie show listings, booking, and seat selection
- Admin dashboard for shows and bookings
- Stripe checkout and webhook handling
- Email notifications via Nodemailer
- External movie data from TMDB

## Project Structure

- `client/` - React Vite frontend
- `server/` - Express backend API

## Requirements

- Node.js 18+ recommended
- npm
- MongoDB database
- Stripe account and webhook secret
- TMDB API key
- Clerk account for authentication

## Setup

### 1. Server

1. Open terminal in `server/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `server/.env` with the following variables:
   ```env
   MONGODB_URI=<your-mongodb-connection-string>
   STRIPE_SECRET_KEY=<your-stripe-secret-key>
   STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
   TMDB_API_KEY=<your-tmdb-api-key>
   SMTP_USER=<your-smtp-username>
   SMTP_PASS=<your-smtp-password>
   SENDER_EMAIL=<your-sender-email>
   ```
4. Start the server:
   ```bash
   npm run server
   ```

The backend runs on `http://localhost:3000`.

### 2. Client

1. Open terminal in `client/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `client/.env` with the following values:
   ```env
   VITE_BASE_URL=http://localhost:3000
   VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/original
   VITE_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
   VITE_CURRENCY=USD
   ```
4. Start the frontend:
   ```bash
   npm run dev
   ```

The frontend will typically run on `http://localhost:5173`.

## Running Locally

1. Start the server in `server/`
2. Start the client in `client/`
3. Open the Vite app in your browser

## Notes

- The server uses Clerk middleware for auth and requires valid Clerk API configuration.
- The client expects `VITE_BASE_URL` pointing to the backend API.
- The server connects to MongoDB using `MONGODB_URI` and appends `/quickshow`.
- Stripe webhooks require a valid endpoint secret and raw JSON handling.

## Useful Commands

### Server
```bash
npm run server
npm start
```

### Client
```bash
npm run dev
npm run build
npm run preview
```

## License

This project is provided as-is.
