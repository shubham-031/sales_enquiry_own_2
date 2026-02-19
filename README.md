# 📊 Sales Enquiry Management System

> A full-stack web application for managing sales enquiries with a React frontend and Node.js/Express backend.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Frontend Development Guide](#frontend-development-guide)
- [Backend Overview](#backend-overview)
- [Available Scripts](#available-scripts)
- [Making Changes & Contributing](#making-changes--contributing)
- [Troubleshooting](#troubleshooting)

---

## 🌟 Overview

The Sales Enquiry Management System is a modern web application designed to streamline the process of managing sales enquiries. It provides a user-friendly interface for tracking, managing, and analyzing sales enquiries with real-time data visualization and reporting capabilities.

**Key Features:**
- 📝 Enquiry management (Create, Read, Update, Delete)
- 📊 Interactive dashboards with charts and analytics
- 🔐 User authentication and authorization
- 📅 Date filtering and advanced search
- 📤 Excel import/export functionality
- 📱 Responsive Material-UI design
- 🔄 Real-time data updates

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18.3.1
- **Build Tool:** Vite 7.1.7
- **UI Library:** Material-UI (MUI) v5
- **State Management:** Zustand 4.4.7
- **Form Handling:** Formik 2.4.5 + Yup 1.3.3
- **Routing:** React Router DOM 6.20.1
- **HTTP Client:** Axios 1.6.2
- **Charts:** Chart.js 4.4.1 + React-ChartJS-2
- **Date Handling:** Day.js 1.11.19 + Date-fns 3.0.6
- **Notifications:** React-Toastify 9.1.3

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 4.18.2
- **Database:** MongoDB with Mongoose 8.0.3
- **Authentication:** JWT (jsonwebtoken 9.0.2) + bcryptjs 2.4.3
- **Security:** Helmet 7.1.0, express-rate-limit 7.1.5
- **File Upload:** Multer 1.4.5
- **Excel Processing:** ExcelJS 4.4.0, XLSX 0.18.5
- **Email:** Nodemailer 6.9.7
- **Logging:** Winston 3.11.0

---

## 📁 Project Structure

```
sales_enquiry_own_2/
│
├── client/                          # Frontend React Application
│   ├── public/                      # Static assets
│   ├── src/                         # Source code
│   │   ├── assets/                  # Images, icons, fonts
│   │   ├── components/              # Reusable React components
│   │   │   └── *.jsx                # Component files
│   │   ├── pages/                   # Page components (routes)
│   │   │   └── *.jsx                # Page files
│   │   ├── services/                # API service layer
│   │   │   └── api.js               # Axios instance & API calls
│   │   ├── store/                   # Zustand state management
│   │   │   └── *.js                 # Store files
│   │   ├── utils/                   # Helper functions & utilities
│   │   │   └── *.js                 # Utility files
│   │   ├── App.jsx                  # Main App component
│   │   ├── App.css                  # App-specific styles
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── .env.example                 # Environment variables template
│   ├── index.html                   # HTML template
│   ├── package.json                 # Frontend dependencies
│   ├── vite.config.js               # Vite configuration
│   └── eslint.config.js             # ESLint configuration
│
├── server/                          # Backend Node.js Application
│   ├── config/                      # Configuration files
│   │   └── database.js              # MongoDB connection
│   ├── controllers/                 # Route controllers
│   │   └── *.js                     # Controller files
│   ├── data/                        # Seed data / sample data
│   ├── middlewares/                 # Custom middleware
│   │   └── *.js                     # Middleware files
│   ├── models/                      # Mongoose models
│   │   └── *.js                     # Model files
│   ├── routes/                      # API routes
│   │   └── *.js                     # Route files
│   ├── scripts/                     # Utility scripts
│   │   ├── seedData.js              # Database seeding
│   │   └── importFromExcel.js       # Excel import script
│   ├── utils/                       # Helper functions
│   │   └── *.js                     # Utility files
│   ├── .env.example                 # Environment variables template
│   ├── index.js                     # Server entry point
│   └── package.json                 # Backend dependencies
│
├── IMP Readmi/                      # Important documentation
├── .gitignore                       # Git ignore rules
├── README.md                        # This file
└── QUICK_TEST_GUIDE.md              # Quick testing guide

```

---

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.x or v20.x LTS (recommended)
  - Check: `node -v`
  - Download: https://nodejs.org/
- **npm**: v9.x or higher (comes with Node.js)
  - Check: `npm -v`
- **Git**: Latest version
  - Check: `git --version`
  - Download: https://git-scm.com/
- **MongoDB**: 
  - Local installation OR
  - MongoDB Atlas account (cloud database)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/shubham-031/sales_enquiry_own_2.git
cd sales_enquiry_own_2
```

### 2. Setup Backend (Server)

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env file with your configuration
# (See Environment Configuration section below)

# Start the development server
npm run dev

# Server will run on http://localhost:5000 (or your configured PORT)
```

### 3. Setup Frontend (Client)

```bash
# Open a new terminal and navigate to client directory
cd client

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env file with backend URL
# VITE_API_URL=http://localhost:5000

# Start the development server
npm run dev

# Client will run on http://localhost:5173
```

### 4. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api

---

## ⚙️ Environment Configuration

### Client Environment Variables

Create a `.env` file in the `client/` directory:

```env
# API Backend URL
VITE_API_URL=http://localhost:5000

# Optional: Other environment-specific variables
VITE_APP_NAME=Sales Enquiry System
```

### Server Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/sales-enquiry
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sales-enquiry?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Email Configuration (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

⚠️ **Important:** Never commit `.env` files to version control. They contain sensitive information.

---

## 🎨 Frontend Development Guide

### For Frontend Developers

#### Key Directories to Work With:

1. **`client/src/components/`** - Reusable UI components
   - Create new components here
   - Example: `Button.jsx`, `Card.jsx`, `Modal.jsx`

2. **`client/src/pages/`** - Page-level components
   - Each page corresponds to a route
   - Example: `Dashboard.jsx`, `EnquiryList.jsx`, `EnquiryDetails.jsx`

3. **`client/src/services/`** - API integration
   - Axios instance and API calls
   - Example: `api.js` for HTTP requests

4. **`client/src/store/`** - State management (Zustand)
   - Global state stores
   - Example: `useAuthStore.js`, `useEnquiryStore.js`

5. **`client/src/utils/`** - Helper functions
   - Utility functions and constants
   - Example: `formatters.js`, `validators.js`

### Making UI Changes:

#### 1. Adding a New Component

```jsx
// client/src/components/MyComponent.jsx
import React from 'react';
import { Button, Card } from '@mui/material';

const MyComponent = ({ title, onClick }) => {
  return (
    <Card>
      <h2>{title}</h2>
      <Button variant="contained" onClick={onClick}>
        Click Me
      </Button>
    </Card>
  );
};

export default MyComponent;
```

#### 2. Adding a New Page

```jsx
// client/src/pages/NewPage.jsx
import React from 'react';
import { Container } from '@mui/material';
import MyComponent from '../components/MyComponent';

const NewPage = () => {
  const handleClick = () => {
    console.log('Button clicked!');
  };

  return (
    <Container>
      <MyComponent title="Welcome" onClick={handleClick} />
    </Container>
  );
};

export default NewPage;
```

#### 3. Adding a Route

```jsx
// client/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NewPage from './pages/NewPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ... other routes ... */}
        <Route path="/new-page" element={<NewPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

#### 4. Making API Calls

```javascript
// client/src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Add authentication token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Functions
export const getEnquiries = () => API.get('/api/enquiries');
export const createEnquiry = (data) => API.post('/api/enquiries', data);
export const updateEnquiry = (id, data) => API.put(`/api/enquiries/${id}`, data);
export const deleteEnquiry = (id) => API.delete(`/api/enquiries/${id}`);

export default API;
```

#### 5. Using Zustand Store

```javascript
// client/src/store/useEnquiryStore.js
import { create } from 'zustand';
import { getEnquiries } from '../services/api';

const useEnquiryStore = create((set) => ({
  enquiries: [],
  loading: false,
  error: null,
  
  fetchEnquiries: async () => {
    set({ loading: true });
    try {
      const response = await getEnquiries();
      set({ enquiries: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));

export default useEnquiryStore;
```

### Styling Guidelines:

- **Material-UI Components:** Use MUI components for consistency
- **Custom Styles:** Use `sx` prop or styled components from `@emotion/styled`
- **Global Styles:** Modify `client/src/index.css`
- **Component Styles:** Use `client/src/App.css` or component-specific CSS files

### Useful MUI Components:

```jsx
import {
  Button, TextField, Card, CardContent,
  Grid, Box, Container, Typography,
  Dialog, DialogTitle, DialogContent,
  Table, TableBody, TableCell, TableRow,
  Alert, Snackbar, CircularProgress,
} from '@mui/material';

import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers';
```

---

## 🔧 Backend Overview

### API Structure

The backend follows a standard MVC pattern:

- **Models:** Define database schemas
- **Controllers:** Handle business logic
- **Routes:** Define API endpoints
- **Middlewares:** Authentication, validation, error handling

### Common API Endpoints:

```
# Authentication
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
GET    /api/auth/profile           # Get user profile

# Enquiries
GET    /api/enquiries              # Get all enquiries
POST   /api/enquiries              # Create new enquiry
GET    /api/enquiries/:id          # Get single enquiry
PUT    /api/enquiries/:id          # Update enquiry
DELETE /api/enquiries/:id          # Delete enquiry

# Excel Import/Export
POST   /api/enquiries/import       # Import from Excel
GET    /api/enquiries/export       # Export to Excel

# Reports & Analytics
GET    /api/reports/dashboard      # Dashboard statistics
GET    /api/reports/analytics      # Analytics data
```

---

## 📜 Available Scripts

### Client (Frontend)

```bash
npm run dev      # Start development server (Vite)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Server (Backend)

```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
npm run seed     # Seed database with sample data
npm run import   # Import data from Excel
```

---

## 🤝 Making Changes & Contributing

### Workflow for Frontend Developers:

1. **Create a New Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Add/modify components in `client/src/components/`
   - Add/modify pages in `client/src/pages/`
   - Update styles as needed

3. **Test Your Changes**
   ```bash
   cd client
   npm run dev
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push to Repository**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to GitHub repository
   - Click "New Pull Request"
   - Select your branch
   - Add description and submit

### Commit Message Guidelines:

- `feat:` New feature
- `fix:` Bug fix
- `style:` UI/styling changes
- `refactor:` Code refactoring
- `docs:` Documentation updates
- `test:` Adding tests

### Code Style Guidelines:

- Use functional components with hooks
- Follow ESLint rules
- Use meaningful variable/function names
- Add comments for complex logic
- Keep components small and focused
- Use PropTypes or TypeScript for type checking

---

## 🐛 Troubleshooting

### Common Issues and Solutions:

#### 1. Port Already in Use

**Error:** `Port 5173 is already in use`

**Solution:**
```bash
# Kill process on port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Kill process on port 5173 (Mac/Linux)
lsof -ti:5173 | xargs kill -9
```

#### 2. Module Not Found Error

**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. API Connection Error

**Error:** `Network Error` or `CORS Error`

**Solution:**
- Check if backend server is running
- Verify `VITE_API_URL` in client `.env`
- Check `CORS_ORIGIN` in server `.env`

#### 4. MongoDB Connection Error

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
- Ensure MongoDB is running locally OR
- Check MongoDB Atlas connection string
- Verify `MONGODB_URI` in server `.env`

#### 5. Build Errors

**Error:** Build fails with errors

**Solution:**
```bash
# Clear cache and rebuild
npm run build -- --force

# Or clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Getting Help:

- Check `QUICK_TEST_GUIDE.md` for testing procedures
- Review `IMP Readmi/` folder for additional documentation
- Check browser console for frontend errors
- Check server logs for backend errors

---

## 📚 Additional Resources

### Learning Resources:

- **React:** https://react.dev/
- **Vite:** https://vitejs.dev/
- **Material-UI:** https://mui.com/
- **React Router:** https://reactrouter.com/
- **Zustand:** https://github.com/pmndrs/zustand
- **Formik:** https://formik.org/
- **Chart.js:** https://www.chartjs.org/

### Project Documentation:

- See `IMP Readmi/` folder for detailed project documentation
- See `QUICK_TEST_GUIDE.md` for testing guidelines

---

## 👥 Team & Contact

**Project Owner:** @shubham-031  
**Development Team:** FCL Development Team

For questions or issues, please create an issue on GitHub or contact the project owner.

---

## 📄 License

ISC License - See package.json for details

---

**Happy Coding! 🚀**

Last Updated: 2026-02-19 05:47:19