import { connectDB } from '../config/db';
import { User } from '../models/User';
import mongoose from 'mongoose';

const createTestUser = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB successfully');
    
    console.log('Checking for existing test user...');
    const existingUser = await User.findOne({ email: 'test@test.com' });
    if (existingUser) {
      console.log('Deleting existing test user...');
      await User.deleteOne({ email: 'test@test.com' });
      console.log('Existing test user deleted');
    }
    
    console.log('Creating new test user...');
    const testUser = new User({
      username: 'testuser',
      email: 'test@test.com',
      password: 'test123',
      gamesPlayed: 0,
      gamesWon: 0,
      badges: [],
      trophies: [],
      points: 0,
      rank: 'Louveteau'
    });

    await testUser.save();
    console.log('Test user created successfully');
    console.log('User details:', {
      username: testUser.username,
      email: testUser.email,
      _id: testUser._id
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error details:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB due to error');
    }
    process.exit(1);
  }
};

createTestUser(); 