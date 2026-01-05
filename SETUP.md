# Quick Setup Guide

## Prerequisites
1. **Node.js** (v14 or higher) - Download from https://nodejs.org/
2. **MongoDB** - Download from https://www.mongodb.com/try/download/community
   OR use MongoDB Atlas (cloud) - https://www.mongodb.com/cloud/atlas

## Installation Steps

### Option 1: Quick Setup (All at once)
```bash
# Install all dependencies
npm run install-all

# Start both backend and frontend (requires MongoDB to be running)
npm run dev
```

### Option 2: Manual Setup

#### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

#### Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
```

#### Step 3: Start MongoDB
- **Windows**: Open Command Prompt as Administrator and run `mongod`
- **macOS**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`
- **Or use MongoDB Atlas**: Update `backend/.env` with your MongoDB Atlas connection string

#### Step 4: Start the Application
Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend will run on http://localhost:3000

## First Time Usage

1. Open http://localhost:3000 in your browser
2. Click "Sign Up" to create a new account
3. After registration, you'll be automatically logged in
4. Start uploading Excel files or adding data manually!

## Excel File Format

Your Excel file should have these columns (case-insensitive):
- Name
- Age
- Gender (Male/Female/Other)
- Content Type
- City
- State

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check if the connection string in `backend/.env` is correct
- For MongoDB Atlas, make sure your IP is whitelisted

### Port Already in Use
- Backend: Change PORT in `backend/.env`
- Frontend: React will ask to use a different port automatically

### Module Not Found Errors
- Make sure you ran `npm install` in both backend and frontend directories
- Delete `node_modules` and run `npm install` again

## Production Build

```bash
# Build React app for production
npm run build

# The built files will be in frontend/build/
```


