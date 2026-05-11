const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

async function connectDB() {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'mongo connection error');
  });
  mongoose.connection.on('disconnected', () => {
    logger.warn('mongo disconnected');
  });

  await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 8000,
  });

  logger.info('mongo connected');
}

module.exports = connectDB;
