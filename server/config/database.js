import mongoose from 'mongoose';
import { logger } from './logger.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected`);
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
