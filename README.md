# QuickShow — Manual & Agentic Movie Ticket Booking Platform

QuickShow is a full-stack movie ticket booking platform that supports **two booking modes**:

* **Manual Booking** — users browse movies, select shows, choose seats, and complete payment through the conventional booking flow.
* **Agentic Booking** — users interact with an AI-powered booking agent using natural language. The agent interprets the request, finds relevant movies and shows, and orchestrates the booking workflow.

The project combines a traditional MERN-style architecture with **Agentic AI, event-driven workflows, authentication, payments, and external movie APIs**.

---

## Key Features

### Manual Booking

* Browse available movies and shows
* Search and discover movies
* View show timings
* Interactive seat selection
* Booking management
* Secure checkout using Stripe
* Booking confirmation and email notifications

### Agentic Booking

Users can interact with the system using natural-language requests such as:

> "Find an action movie tonight and help me book two seats."

The agent can interpret the user's intent and use the application's movie and show data to assist with the booking workflow.

The agentic mode is designed to reduce the number of manual steps required to discover and book a movie.

### Authentication

* Clerk-based authentication
* Protected user functionality
* User-specific booking information

### Payments

* Stripe Checkout integration
* Stripe webhook handling
* Payment verification
* Booking confirmation after successful payment

### Admin Dashboard

* Manage movie shows
* View bookings
* Manage show information
* Monitor booking activity

### Notifications

* Automated booking emails
* Nodemailer-based email delivery

### Movie Data

* TMDB API integration
* Movie metadata and images
* Dynamic movie discovery

### Event-Driven Workflows

* Inngest-based background/event workflows
* Automated processing of application events
* Decoupled workflow execution

---

## Manual vs Agentic Booking

QuickShow provides two different ways to complete a booking.

### Manual Mode

```text
User
 ↓
Browse Movies
 ↓
Select Movie
 ↓
Select Show
 ↓
Select Seats
 ↓
Checkout
 ↓
Payment
 ↓
Booking Confirmation
```

### Agentic Mode

```text
User
 ↓
Natural-Language Request
 ↓
AI Agent
 ↓
Understand User Intent
 ↓
Search Movies / Shows
 ↓
Recommend Matching Options
 ↓
Booking Workflow
 ↓
Payment
 ↓
Booking Confirmation
```

The goal is to combine the reliability of a conventional booking system with the flexibility of an **AI-driven conversational booking experience**.

---

## Architecture

```text
                 ┌──────────────────────┐
                 │      React + Vite    │
                 │      Frontend        │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │    Express Backend   │
                 │      REST APIs       │
                 └──────────┬───────────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
       ┌──────────┐   ┌───────────┐  ┌───────────┐
       │ MongoDB  │   │ TMDB API  │  │  Stripe   │
       └──────────┘   └───────────┘  └───────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ Agentic Mode │
                    │   AI Agent   │
                    └──────────────┘
                            │
                            ▼
                    Booking Workflow
                            │
                            ▼
                       Inngest
                            │
                            ▼
                  Notifications / Events
```

---

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* HTML/CSS

### Backend

* Node.js
* Express.js
* REST APIs

### Database

* MongoDB

### Authentication

* Clerk

### Payments

* Stripe

### AI / Agentic System

* AI-powered natural-language booking workflow
* Agent-based orchestration
* Tool/API-driven movie and show discovery

### External APIs

* TMDB API

### Event Processing

* Inngest

### Email

* Nodemailer

---

## Project Structure

```text
QuickShow-FullStack/
│
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── configs/
│   ├── inngest/
│   ├── middleware/
│   ├── package.json
│   └── ...
│
├── README.md
└── ...
```

---

## Requirements

Before running the project, make sure you have:

* Node.js 18+
* npm
* MongoDB
* Clerk account
* Stripe account
* TMDB API key
* SMTP/email credentials
* Required AI/agent configuration (OpenRouter / Gemini)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/KISHOR-glitch/Movie_ticket_book.git
cd Movie_ticket_book
```

---

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

Create a `.env` file (refer to `.env.example`):

```env
MONGODB_URI=<your-mongodb-connection-string>

CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
CLERK_SECRET_KEY=<your-clerk-secret-key>

STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>

TMDB_API_KEY=<your-tmdb-api-key>

SMTP_USER=<your-smtp-username>
SMTP_PASS=<your-smtp-password>
SENDER_EMAIL=<your-sender-email>

OPENROUTER_API_KEY=<your-openrouter-api-key>
OPENROUTER_MODEL=openrouter/free
```

Start the backend:

```bash
npm run server
```

Backend runs on: `http://localhost:3000`

---

### 3. Install Frontend Dependencies

Open another terminal:

```bash
cd client
npm install
```

Create `client/.env` (refer to `.env.example`):

```env
VITE_BASE_URL=http://localhost:3000
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/original
VITE_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
VITE_CURRENCY=USD
```

Start the frontend:

```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Running the Application

Start the backend:

```bash
cd server
npm run server
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

Then open the application in your browser.

---

## Booking Workflow

### Manual Booking

1. User logs in.
2. User browses movies.
3. User selects a movie.
4. User selects a showtime.
5. User selects available seats.
6. User proceeds to checkout.
7. Stripe processes the payment.
8. Booking is confirmed.
9. Confirmation notification is sent.

### Agentic Booking

1. User provides a natural-language request.
2. AI agent interprets the request.
3. Agent identifies relevant movie/show preferences.
4. Agent searches available movie/show information.
5. Agent presents matching options.
6. User proceeds with the selected booking.
7. Payment is processed through Stripe.
8. Booking is confirmed.

---

## Security

* Authentication handled through Clerk.
* Sensitive credentials are stored using environment variables.
* Stripe webhook secrets are validated on the backend.
* Database credentials are never exposed to the frontend.

---

## Future Improvements

* Fully autonomous seat selection based on user preferences
* Conversational booking assistant
* Personalized movie recommendations
* Multi-agent booking architecture
* Voice-based movie booking
* Real-time seat availability through agent tools
* Booking modification and cancellation through natural language
* Intelligent seat recommendations based on price and location

---

## Author

**Kishor SR**

Information Science & Engineering  
M. S. Ramaiah Institute of Technology, Bengaluru  

GitHub: [KISHOR-glitch](https://github.com/KISHOR-glitch)
