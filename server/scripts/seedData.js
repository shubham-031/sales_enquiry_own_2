import mongoose from 'mongoose';
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Enquiry from '../models/Enquiry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sales-enquiry';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Create sample users
const createSampleUsers = async () => {
  try {
    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('ℹ️  Users already exist, skipping user creation');
      return;
    }

    const users = [
      // Superuser
      {
        name: 'Superuser Account',
        email: 'superuser@example.com',
        password: 'superuser123',
        role: 'superuser',
        department: 'Superuser',
      },
      // Sales Team
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        password: 'sales123',
        role: 'sales',
        department: 'Sales',
      },
      {
        name: 'Priya Singh',
        email: 'priya@example.com',
        password: 'sales123',
        role: 'sales',
        department: 'Sales',
      },
      {
        name: 'Amit Patel',
        email: 'amit@example.com',
        password: 'sales123',
        role: 'sales',
        department: 'Sales',
      },
      {
        name: 'Sneha Sharma',
        email: 'sneha@example.com',
        password: 'sales123',
        role: 'sales',
        department: 'Sales',
      },
      {
        name: 'Vikram Reddy',
        email: 'vikram@example.com',
        password: 'sales123',
        role: 'sales',
        department: 'Sales',
      },
      // R&D Team
      {
        name: 'Dr. Arun Kumar',
        email: 'arun@example.com',
        password: 'rnd123',
        role: 'r&d',
        department: 'Research & Development',
      },
      {
        name: 'Dr. Meera Iyer',
        email: 'meera@example.com',
        password: 'rnd123',
        role: 'r&d',
        department: 'Research & Development',
      },
      {
        name: 'Karthik Menon',
        email: 'karthik@example.com',
        password: 'rnd123',
        role: 'r&d',
        department: 'Research & Development',
      },
      // Management
      {
        name: 'Suresh Reddy',
        email: 'suresh@example.com',
        password: 'mgmt123',
        role: 'management',
        department: 'Management',
      },
    ];

    await User.insertMany(users);
    console.log(`✅ Created ${users.length} sample users`);
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
  }
};

// Generate sample enquiry data
const generateSampleEnquiries = async () => {
  try {
    // Check if enquiries already exist
    const existingEnquiries = await Enquiry.countDocuments();
    if (existingEnquiries > 0) {
      console.log('ℹ️  Enquiries already exist, skipping enquiry creation');
      return;
    }

    // Get users
    let salesUsers = await User.find({ role: 'sales' });
    let rndUsers = await User.find({ role: 'r&d' });

    // If no role-based users, try to get all users and use them
    if (salesUsers.length === 0 || rndUsers.length === 0) {
      console.log('⚠️  No role-based users found, using all available users...');
      const allUsers = await User.find();
      
      if (allUsers.length === 0) {
        console.error('❌ No users found in database. Please create users first.');
        return;
      }
      
      // Use all users as both sales and R&D
      salesUsers = allUsers;
      rndUsers = allUsers;
      console.log(`ℹ️  Using ${allUsers.length} users for enquiry assignment`);
    }

    const customers = [
      'ABC Industries Ltd', 'XYZ Corporation', 'Tech Solutions Pvt Ltd',
      'Global Enterprises', 'Innovative Systems', 'Prime Manufacturing',
      'Elite Technologies', 'Mega Corp India', 'Smart Solutions Ltd',
      'Dynamic Industries', 'Bright Future Corp', 'Sunrise Enterprises',
      'Platinum Systems', 'Golden Gate Industries', 'Silver Star Corp',
      'Crystal Clear Ltd', 'Diamond Tech', 'Emerald Solutions',
      'Ruby Industries', 'Sapphire Systems', 'Pearl Manufacturing',
    ];

    const productTypes = ['SP', 'NSP', 'SP+NSP', 'Other'];
    const marketTypes = ['Domestic', 'Export'];
    const activities = ['Quoted', 'Regretted', 'In Progress', 'On Hold'];
    const statuses = ['Open', 'Closed'];

    const enquiries = [];
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-09-30');

    // Generate 200 sample enquiries
    for (let i = 0; i < 200; i++) {
      const enquiryDate = new Date(
        startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
      );

      const activity = activities[Math.floor(Math.random() * activities.length)];
      const status = activity === 'Quoted' || activity === 'Regretted' ? 'Closed' : 'Open';
      
      let quoteDate = null;
      let closureDate = null;

      if (activity === 'Quoted' || activity === 'Regretted') {
        // Add 1-5 days for quote date
        quoteDate = new Date(enquiryDate);
        quoteDate.setDate(quoteDate.getDate() + Math.floor(Math.random() * 5) + 1);
        
        // Add 1-3 days after quote for closure
        closureDate = new Date(quoteDate);
        closureDate.setDate(closureDate.getDate() + Math.floor(Math.random() * 3) + 1);
      }

      const randomSalesUser = salesUsers[Math.floor(Math.random() * salesUsers.length)];
      const randomRndUser = rndUsers[Math.floor(Math.random() * rndUsers.length)];

      enquiries.push({
        // Don't set enquiryNumber - it will be auto-generated by pre-save hook
        customerName: customers[Math.floor(Math.random() * customers.length)],
        enquiryDate,
        marketType: marketTypes[Math.floor(Math.random() * marketTypes.length)],
        productType: productTypes[Math.floor(Math.random() * productTypes.length)],
        salesRepresentative: randomSalesUser._id,
        salesRepName: randomSalesUser.name,
        rndHandler: randomRndUser._id,
        rndHandlerName: randomRndUser.name,
        quotationDate: quoteDate,
        closureDate,
        activity,
        status,
        supplyScope: `Sample supply scope for ${productTypes[Math.floor(Math.random() * productTypes.length)]} product`,
        quantity: Math.floor(Math.random() * 1000) + 100,
        estimatedValue: Math.floor(Math.random() * 10000000) + 100000,
        remarks: activity === 'Regretted' ? 'Price not competitive' : 'Standard enquiry processing',
        createdBy: randomSalesUser._id,
        updatedBy: randomSalesUser._id,
      });
    }

    // Save enquiries one by one to trigger pre-save hooks
    console.log('⏳ Creating enquiries (this may take a moment)...');
    for (const enquiryData of enquiries) {
      const enquiry = new Enquiry(enquiryData);
      await enquiry.save();
    }
    console.log(`✅ Created ${enquiries.length} sample enquiries`);
  } catch (error) {
    console.error('❌ Error creating enquiries:', error.message);
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🚀 Starting database seeding...\n');
    
    await connectDB();
    
    // Clear existing data (optional - uncomment if needed)
    // await User.deleteMany({});
    // await Enquiry.deleteMany({});
    // console.log('🗑️  Cleared existing data\n');
    
    await createSampleUsers();
    await generateSampleEnquiries();
    
    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('   Superuser: superuser@example.com / superuser123');
    console.log('   Sales: rajesh@example.com / sales123');
    console.log('   R&D: arun@example.com / rnd123');
    console.log('   Management: suresh@example.com / mgmt123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run the seeding
seedDatabase();
