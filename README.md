# Data Management System - Ready to Use! 🚀

A complete, production-ready full-stack MERN (MongoDB, Express, React, Node.js) web application for managing data with Excel import/export functionality.

## ✨ Features

- ✅ **User Authentication** - Secure login/register with JWT
- ✅ **Excel Upload** - Import data from Excel files (.xlsx, .xls)
- ✅ **Data Management** - Add, Edit, Delete data entries
- ✅ **Advanced Filtering** - Filter by Name, Age, Content Type, City, State, Gender
- ✅ **Data Selection** - Select multiple records with checkboxes
- ✅ **Export Functionality** - Export selected or all data as Excel
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Real-time Updates** - Instant data updates after operations

## 🚀 Quick Start (Easiest Way)

### Windows Users:
1. **Double-click `start.bat`** - That's it! The script will:
   - Check if MongoDB is running
   - Install dependencies if needed
   - Start both backend and frontend servers
   - Open your browser automatically

### Mac/Linux Users:
1. Open terminal in the project folder
2. Run: `chmod +x start.sh`
3. Run: `./start.sh`
4. Wait for servers to start and browser to open

## 📋 Prerequisites

Before running, make sure you have:

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Verify: Run `node --version` in terminal

2. **MongoDB** (Choose one):
   - **Option A - Local MongoDB:**
     - Download: https://www.mongodb.com/try/download/community
     - Install and start MongoDB service
   
   - **Option B - MongoDB Atlas (Cloud - Recommended):**
     - Go to: https://www.mongodb.com/cloud/atlas (Free tier available)
     - Create account → Create cluster → Get connection string
     - Update `backend/.env` with your Atlas connection string

## 🔧 Manual Setup (If Quick Start Doesn't Work)

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

Or install all at once:
```bash
npm run install-all
```

### Step 2: Configure MongoDB

**For Local MongoDB:**
- Make sure MongoDB is running
- Default connection is already set in `backend/.env`

**For MongoDB Atlas:**
- Get your connection string from Atlas dashboard
- Update `MONGODB_URI` in `backend/.env`

### Step 3: Start the Application

**Option 1 - Run Both Servers Together:**
```bash
npm run dev
```

**Option 2 - Run Separately (Two Terminals):**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:5000

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```
Frontend runs on: http://localhost:3000

### Step 4: Open Browser

Navigate to: **http://localhost:3000**

## 🎯 First Time Usage

1. Open http://localhost:3000 in your browser
2. Click **"Sign Up"** to create a new account
3. Enter your email and password (minimum 6 characters)
4. After registration, you'll be automatically logged in
5. Start using the application!

## 📊 Excel File Format

Your Excel file should have these columns (case-insensitive):
- **Name** - Full name of the person
- **Age** - Numeric age
- **Gender** - Male, Female, or Other
- **Content Type** - Type of content
- **City** - City name
- **State** - State name

**Example:**
| Name | Age | Gender | Content Type | City | State |
|------|-----|--------|--------------|------|-------|
| John Doe | 25 | Male | Video | New York | NY |
| Jane Smith | 30 | Female | Article | Los Angeles | CA |

## 🗂️ Project Structure

```
.
├── backend/                 # Express.js backend
│   ├── models/             # MongoDB models
│   │   ├── User.js        # User model
│   │   └── Data.js        # Data model
│   ├── routes/            # API routes
│   │   ├── auth.js        # Authentication routes
│   │   └── data.js        # Data CRUD routes
│   ├── middleware/        # Middleware
│   │   └── auth.js        # JWT authentication
│   ├── server.js          # Express server
│   ├── package.json
│   └── .env               # Environment variables
│
├── frontend/              # React.js frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Login.js
│   │   │   └── Dashboard.js
│   │   ├── context/       # React context
│   │   │   └── AuthContext.js
│   │   ├── services/      # API services
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
│
├── start.bat              # Windows start script
├── start.sh               # Mac/Linux start script
├── package.json           # Root package.json
└── README.md              # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Data Operations
- `GET /api/data` - Get all data (requires auth)
- `GET /api/data/:id` - Get single entry
- `POST /api/data` - Create new entry
- `PUT /api/data/:id` - Update entry
- `DELETE /api/data/:id` - Delete entry
- `POST /api/data/upload` - Upload Excel file
- `POST /api/data/delete-multiple` - Delete multiple entries

## 🐛 Troubleshooting

### MongoDB Connection Error
- **Problem:** "MongoServerError: connect ECONNREFUSED"
- **Solution:** 
  - Make sure MongoDB is running locally, OR
  - Update `MONGODB_URI` in `backend/.env` with your MongoDB Atlas connection string

### Port Already in Use
- **Problem:** "Port 5000/3000 is already in use"
- **Solution:**
  - Backend: Change `PORT` in `backend/.env`
  - Frontend: React will automatically ask to use a different port

### Module Not Found
- **Problem:** "Cannot find module..."
- **Solution:** 
  ```bash
  cd backend && npm install
  cd ../frontend && npm install
  ```

### Can't Login/Register
- **Problem:** "Network Error" or 401 Unauthorized
- **Solution:** 
  - Make sure backend is running on port 5000
  - Check browser console for errors
  - Verify API URL in `frontend/.env`

### Excel Upload Not Working
- **Problem:** "Invalid file type" or upload fails
- **Solution:**
  - Make sure file is .xlsx or .xls format
  - Check that Excel file has correct column names
  - Verify file size is under 10MB

## 🚀 Production Deployment

### Build React App:
```bash
cd frontend
npm run build
```

### Environment Variables:
- Set `NODE_ENV=production`
- Use secure `JWT_SECRET` in production
- Use MongoDB Atlas or secure MongoDB instance

## 📝 License

ISC

## 👤 Author

Created with ❤️ using MERN Stack

---

## 🎉 You're All Set!

Your website is ready to use. Just run `start.bat` (Windows) or `./start.sh` (Mac/Linux) and start managing your data!

**Need Help?** Check `SETUP.md` or `QUICK_START.txt` for more details.
