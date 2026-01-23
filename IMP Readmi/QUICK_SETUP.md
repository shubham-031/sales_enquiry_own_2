# 🚀 Quick Setup Guide for New Features

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (running on localhost or remote)
- Git

---

## Step 1: Install Dependencies

### Backend Dependencies
```powershell
cd server
npm install
```

This will install:
- `exceljs` - For Excel file generation and export

### Frontend Dependencies
```powershell
cd ../client
npm install
```

This will install:
- `@mui/x-data-grid` - For advanced data tables with filtering and sorting

---

## Step 2: Environment Setup

Make sure you have `.env` file in the server directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/sales-enquiry

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# CORS Configuration
CLIENT_URL=http://localhost:5173
```

---

## Step 3: Import Sample Data

### Option 1: Import from Excel File

Place your Excel file at:
```
server/data/SALES ENQUIRY TRACKER_Sample data_ 2025-26_VIT Project (1).xls
```

Then run:
```powershell
cd server
npm run import
```

### Option 2: Use Sample Seed Data
```powershell
cd server
npm run seed
```

---

## Step 4: Start the Application

### Terminal 1 - Start Backend
```powershell
cd server
npm run dev
```

Backend will run on: http://localhost:5000

### Terminal 2 - Start Frontend
```powershell
cd client
npm run dev
```

Frontend will run on: http://localhost:5173

---

## Step 5: Login and Test

### Default Admin Credentials
```
Email: admin@example.com
Password: admin123
```

### Test All New Features:

1. **Enquiry List**
   - Go to: http://localhost:5173/enquiries
   - Try filtering by date, status, market type
   - Test search functionality
   - Try pagination

2. **Create Enquiry**
   - Click "New Enquiry" button
   - Fill in the form
   - Submit and verify

3. **View Enquiry Details**
   - Click on any enquiry row
   - View all details
   - Test edit functionality

4. **Generate Reports**
   - Go to: http://localhost:5173/reports
   - Select filters
   - Click "Generate Report"
   - Try Excel and CSV exports

5. **User Management** (Admin only)
   - Go to: http://localhost:5173/users
   - Create a new user
   - Edit user details
   - Test role assignment

6. **Profile Management**
   - Go to: http://localhost:5173/profile
   - Update your details
   - Change password

---

## Troubleshooting

### Issue: Dependencies not installing
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: MongoDB connection error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB service is active

### Issue: Excel import failing
- Verify file path is correct
- Check Excel file format (should be .xls or .xlsx)
- Ensure file has correct column headers
- Check server logs for specific errors

### Issue: Frontend not connecting to backend
- Verify backend is running on port 5000
- Check CORS settings in server
- Verify axios configuration in `client/src/utils/axios.js`

### Issue: DataGrid not displaying
- Ensure `@mui/x-data-grid` is installed
- Check browser console for errors
- Verify data is being fetched from API

---

## Quick Commands Reference

### Backend
```powershell
npm run dev          # Start development server
npm run start        # Start production server
npm run seed         # Seed sample data
npm run import       # Import from Excel file
```

### Frontend
```powershell
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---

## Feature Access Matrix

| Feature | Admin | Management | Sales | R&D |
|---------|-------|------------|-------|-----|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Create Enquiry | ✅ | ✅ | ✅ | ❌ |
| Edit Enquiry | ✅ | ✅ | ✅* | ✅* |
| Delete Enquiry | ✅ | ❌ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ✅ | ✅ |
| Export Data | ✅ | ✅ | ✅ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ |
| Profile Update | ✅ | ✅ | ✅ | ✅ |

*Own enquiries only

---

## Performance Tips

1. **Database Indexing**
   - Enquiry indexes are auto-created
   - Check MongoDB logs for slow queries

2. **Data Grid Performance**
   - Use pagination for large datasets
   - Apply filters before loading data
   - Limit initial page size

3. **Export Large Datasets**
   - Apply date range filters
   - Export in smaller batches if needed
   - Use CSV for very large datasets

---

## Next Steps

After successful setup:

1. ✅ Test all features with sample data
2. ✅ Import your actual data using the import script
3. ✅ Configure user accounts and roles
4. ✅ Customize filters and views as needed
5. ✅ Train team members on the new system
6. ✅ Set up regular backups

---


