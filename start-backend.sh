#!/bin/bash

# VenueGenie Startup Script

echo "🎭 Starting VenueGenie..."
echo ""

# Check if node_modules exists
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env file..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env to add your API keys"
fi

echo ""
echo "Starting backend server on http://localhost:5000..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

echo "Backend started with PID: $BACKEND_PID"
echo ""
echo "Backend is running at: http://localhost:5000"
echo "API Health Check: http://localhost:5000/api/health"
echo ""
echo "To start the frontend, run: cd frontend && npm start"
echo "Or run both with: npm run dev"
echo ""
echo "To stop the backend, run: kill $BACKEND_PID"
echo ""
