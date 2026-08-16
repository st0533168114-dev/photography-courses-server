# Mirela Cohen - Photography Courses | Server

REST API server for a digital photography courses sales website. Includes user management with JWT authentication, course and category catalog, shopping cart, orders and payments, and an admin management panel.

## Technologies

Node.js · Express 5 · MongoDB (Mongoose) · JWT · bcrypt · cors · dotenv

## Installation & Running

```bash
git clone https://github.com/st0533168114-dev/photography-courses-server.git
cd photography-courses-server
npm install
npm start
```

The server will listen on `http://localhost:1234`.

## Environment Variables

Create a `.env` file in the server directory:

```
MONGO_URI=<MongoDB connection string>
JWT_SECRET=<secret for signing tokens>
```

## Main Structure

```
├── app.js          # Entry point: express, DB, CORS, routers
├── Routers/        # API route definitions
├── Controllers/     # Business logic
├── Models/          # Mongoose schemas
├── Middlewares/      # JWT authentication and admin authorization
└── Images/           # Course images
```

## Main API Routes

`/users` · `/courses` · `/categories` · `/shoppingCarts` · `/orders` · `/payments` · `/faq`

## Related Repository
- [Photography Courses Client (React)](https://github.com/st0533168114-dev/photography-courses-client)
