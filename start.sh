#!/bin/bash

echo "Starting Data Management System..."
echo ""

echo "Step 1: Checking if MongoDB is running..."
if pgrep -x "mongod" > /dev/null; then
    echo "✓ MongoDB is running!"
else
    echo "⚠ WARNING: MongoDB does not appear to be running."
    echo "Please start MongoDB first, or use MongoDB Atlas."
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "Step 2: Installing dependencies (if needed)..."

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

echo ""
echo "Step 3: Starting servers..."
echo "Backend will run on http://localhost:5000"
echo "Frontend will run on http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
cd frontend
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "Servers are starting!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Check backend.log and frontend.log for logs"
echo ""
echo "Opening browser in 5 seconds..."
sleep 5

# Open browser (works on macOS and most Linux distros)
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3000
elif command -v open > /dev/null; then
    open http://localhost:3000
fi

echo ""
echo "To stop servers, run: kill $BACKEND_PID $FRONTEND_PID"
echo "Or press Ctrl+C and kill the processes manually"

wait


