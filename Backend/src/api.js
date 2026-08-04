require('dotenv').config();

const express = require('express');
const logger = require('./config/logger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const cors = require('cors');

const healthRoutes = require('./routes/api/health');
const authRoutes = require('./routes/api/auth');
const eventsRoutes = require('./routes/api/events');

const app = express();
const port = Number(process.env.API_PORT) || 4000;

app.use(express.json());

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(healthRoutes);
app.use('/auth', authRoutes);
app.use(eventsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  logger.info({ port, service: 'api' }, 'TicketBox API listening');
});
