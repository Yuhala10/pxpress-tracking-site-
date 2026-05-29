const mongoose = require('mongoose');

async function connectDB() {
  const localUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pxpress';
  const forceMemory = process.env.USE_MEMORY_DB === 'true';

  if (!forceMemory) {
    try {
      await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
      console.log('MongoDB connected:', localUri.replace(/\/\/.*@/, '//***@'));
      return { mode: 'local' };
    } catch (err) {
      console.warn('Local MongoDB unavailable:', err.message);
      console.warn('Starting in-memory database for testing...');
    }
  }

  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mem = await MongoMemoryServer.create();
  const uri = mem.getUri();
  await mongoose.connect(uri);
  console.log('In-memory MongoDB ready (data resets when server stops)');
  return { mode: 'memory', mem };
}

module.exports = { connectDB };
