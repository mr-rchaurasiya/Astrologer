import mongoose, { ConnectOptions } from 'mongoose';
import { config } from './environment';

let isConnected = false;
let memoryServer: any = null;

export const MONGO_OPTIONS: ConnectOptions = {
  maxPoolSize: 50,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 2500,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 3000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  retryReads: true,
  autoIndex: !config.isProd, // In production, indexes should be created during deployment
};

export const connectDatabase = async (customUri?: string): Promise<void> => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const uri = customUri || config.mongodbUri;

  try {
    mongoose.set('strictQuery', true);

    // Setup connection event listeners
    mongoose.connection.on('connected', () => {
      isConnected = true;
      if (!config.isTest) {
        console.log('📦 MongoDB Connected successfully.');
      }
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Connection Error:', err.message || err);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      if (!config.isTest) {
        console.warn('⚠️ MongoDB Disconnected. Retrying...');
      }
    });

    await mongoose.connect(uri, MONGO_OPTIONS);
    isConnected = true;
  } catch (error: any) {
    if (!config.isProd && !config.isTest) {
      console.warn(`⚠️ Could not connect to local MongoDB daemon (${error.message}).`);
      console.log('🚀 Starting in-memory MongoDB engine for seamless development...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        if (!memoryServer) {
          memoryServer = await MongoMemoryServer.create();
        }
        const memUri = memoryServer.getUri();
        await mongoose.connect(memUri, MONGO_OPTIONS);
        isConnected = true;
        console.log(`📦 In-Memory MongoDB Connected successfully at: ${memUri}`);
        return;
      } catch (memErr: any) {
        console.error('❌ Failed to start in-memory MongoDB:', memErr.message || memErr);
      }
    }

    console.error('❌ Fatal error connecting to MongoDB:', error.message || error);
    if (!config.isTest) {
      throw error;
    }
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (!isConnected && mongoose.connection.readyState === 0) {
    return;
  }

  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
    isConnected = false;
    if (!config.isTest) {
      console.log('📦 MongoDB Disconnected successfully.');
    }
  } catch (error: any) {
    console.error('❌ MongoDB Disconnect Error:', error.message || error);
  }
};

export const isDbConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export const getDatabaseHealth = () => {
  const stateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    state: stateMap[mongoose.connection.readyState] || 'unknown',
    isHealthy: mongoose.connection.readyState === 1,
    host: mongoose.connection.host || 'local',
    name: mongoose.connection.name || 'astrologer_db',
    readyState: mongoose.connection.readyState,
  };
};
