import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ Error: MONGO_URI is not defined in environment variables');
      console.error('Please create a .env file in the root directory with MONGO_URI');
      console.error('Example: MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database');
      process.exit(1);
    }

    console.log('🔄 Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // Increased to 30s
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority',
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`\n❌ Error connecting to MongoDB: ${error.message}\n`);
    
    // Provide specific troubleshooting based on error type
    if (error.message.includes('ETIMEOUT') || error.message.includes('ENOTFOUND')) {
      console.error('🔍 Troubleshooting steps:');
      console.error('1. Check if your MongoDB Atlas cluster is running (not paused)');
      console.error('2. Verify your IP address is whitelisted in MongoDB Atlas Network Access');
      console.error('3. Check your internet connection');
      console.error('4. Verify the MONGO_URI format is correct');
      console.error('5. Try connecting with MongoDB Compass to test the connection string\n');
    } else if (error.message.includes('authentication failed')) {
      console.error('🔍 Authentication failed:');
      console.error('1. Check your username and password in the connection string');
      console.error('2. Verify the database user has proper permissions\n');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('🔍 DNS resolution failed:');
      console.error('1. Check if the cluster hostname is correct');
      console.error('2. Verify your internet connection\n');
    }
    
    console.error('⚠️  The server will continue to run but database operations will fail');
    console.error('💡 To fix: Update your .env file with a valid MONGO_URI and restart the server\n');
  }
};

export default connectDB;
