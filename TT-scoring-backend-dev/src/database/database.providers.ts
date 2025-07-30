import * as mongoose from 'mongoose';

/**
 * Database providers configuration
 * Uses environment variables for flexible database connection
 * Supports both local MongoDB and MongoDB Atlas
 */
export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> => {
      // Get MongoDB URI from environment variables, fallback to local MongoDB
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/scoring-system';
      
      console.log('Connecting to MongoDB:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
      
      return mongoose
        .connect(mongoUri)
        .then(() => {
          console.log('MongoDB connected successfully');
          return mongoose;
        })
        .catch((error) => {
          console.error('MongoDB connection error:', error);
          throw error;
        });
    },
  },
];
