# Online Voting System - Backend

This is the backend API for the Online Voting System project.

## Features
- RESTful API for voting, user, admin, and election management
- JWT authentication for users and admins
- MongoDB database
- File upload support for party/candidate images

## Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT
- Multer (for file uploads)

## Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file for environment variables (e.g., MongoDB URI, JWT secret).
4. Start the backend server:
   ```bash
   npm run dev
   ```
5. The API will be available at `http://localhost:5000` by default.

## Available Scripts
- `npm run dev` - Start the server in development mode (with nodemon)
- `npm start` - Start the server in production mode

## Environment Variables
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT authentication
- `PORT` - Port for the backend server (default: 5000)

---
For more details, see the main project documentation. 