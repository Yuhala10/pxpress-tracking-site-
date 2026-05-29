const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const isProd = process.env.NODE_ENV === 'production';
  const forceMemory = process.env.USE_MEMORY_DB === 'true';

  if (isProd && !uri) {
    throw new Error('MONGODB_URI is required in production');
  }

  const connectUri = uri || 'mongodb://127.0.0.1:27017/pxpress';

  if (!forceMemory) {
    try {
      await mongoose.connect(connectUri, { serverSelectionTimeoutMS: isProd ? 10000 : 3000 });
      console.log('MongoDB connected:', connectUri.replace(/\/\/.*@/, '//***@'));
      return { mode: uri ? 'remote' : 'local' };
    } catch (err) {
      if (isProd) throw err;
      console.warn('Local MongoDB unavailable:', err.message);
      console.warn('Starting in-memory database for testing...');
    }
  }

  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mem = await MongoMemoryServer.create();
  const memUri = mem.getUri();
  await mongoose.connect(memUri);
  console.log('In-memory MongoDB ready (data resets when server stops)');
  return { mode: 'memory', mem };
}

module.exports = { connectDB };
