@echo off
echo Starting Data Management System...
echo.

echo Step 1: Checking if MongoDB is running...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo MongoDB is running!
) else (
    echo WARNING: MongoDB does not appear to be running.
    echo Please start MongoDB first, or use MongoDB Atlas.
    echo.
    pause
)

echo.
echo Step 2: Installing dependencies (if needed)...
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo Step 3: Starting servers...
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo.

start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo Servers are starting! Check the opened windows for status.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak > nul
start http://localhost:3000

pause


