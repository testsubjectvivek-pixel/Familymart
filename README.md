# FamilyMart - Quick Commerce Platform

A Blinkit-like quick-commerce platform built with React, Node.js, Express, and MongoDB.

## Features

### Customer Side
- Browse products with filters and sorting
- Product detail pages with stock information
- Shopping cart with quantity management
- Checkout with address collection
- Responsive design for mobile and desktop

### Admin Panel (Protected)
- Login with JWT authentication
- Dashboard with statistics and recent orders
- Product management (CRUD operations)
- Category management (CRUD operations)
- Order management with status updates

## Tech Stack

- **Frontend:** React 18, React Router v6, Axios, Tailwind CSS, React Context API
- **Backend:** Node.js, Express, MongoDB with Mongoose, JWT for authentication, bcrypt for password hashing
- **Database:** MongoDB (Atlas or local)

## Project Structure

```
FamilyMart/
├── backend/          # Node.js API
│   ├── controllers/  # Route handlers
│   ├── middleware/   # Authentication and error handling
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API endpoints
│   ├── seed/         # Database seeding script
│   ├── config/       # Database configuration
│   ├── .env         # Environment variables
│   └── server.js     # Main server file
├── frontend/         # React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React Context for state management
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service
│   │   └── App.jsx      # Main app component
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Atlas or local instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following content:
   ```
   MONGO_URI=mongodb://localhost:27017/familymart
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

5. Seed the database with initial data (optional):
   ```bash
   npm run seed
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following content:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Default Admin Credentials

- Email: `admin@familymart.com`
- Password: `password123`

## API Endpoints

### Public Endpoints
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/categories` - Get all categories
- `POST /api/orders` - Place an order (requires authentication)

### Admin Endpoints (Protected)
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/products` - Get all products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/categories` - Get all categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status

## Environment Variables

### Backend
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)

### Frontend
- `VITE_API_URL` - Base URL for API requests

## Features Implemented

- [x] Customer product browsing with filters
- [x] Shopping cart with localStorage persistence
- [x] Checkout process with order placement
- [x] Admin authentication with JWT
- [x] Admin dashboard with statistics
- [x] Product management (CRUD)
- [x] Category management (CRUD)
- [x] Order management with status updates
- [x] Responsive design with Tailwind CSS
- [x] Error handling and loading states
- [x] Toast notifications
- [x] Database seeding with sample data

## Running in Production

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Serve the frontend files using a static server or configure your backend to serve the frontend files.

3. Set appropriate environment variables for production.

## License

This project is for educational purposes. Feel free to use and modify the code as needed.# Familymart
