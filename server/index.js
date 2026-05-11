require('dotenv').config();

const env = require('./src/config/env');
const logger = require('./src/utils/logger');
const createApp = require('./src/app');
const connectDB = require('./src/config/db');

(async () => {
  try {
    await connectDB();
    const app = createApp();
    app.listen(env.PORT, () => {
      logger.info(`server listening on http://localhost:${env.PORT}`);
    });
  } catch (err) {
    logger.error({ err }, 'failed to start server');
    process.exit(1);
  }
})();
