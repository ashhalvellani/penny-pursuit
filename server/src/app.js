require('express-async-errors');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');

const env = require('./config/env');
const logger = require('./utils/logger');
const passport = require('./config/passport');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const healthRoutes = require('./features/health/health.routes');
const authRoutes = require('./features/auth/auth.routes');
const expenseRoutes = require('./features/expenses/expense.routes');
const dashboardRoutes = require('./features/dashboard/dashboard.routes');
const aiRoutes = require('./features/ai/ai.routes');
const budgetRoutes = require('./features/budgets/budget.routes');

function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(pinoHttp({ logger }));
  app.use(passport.initialize());

  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/budgets', budgetRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
