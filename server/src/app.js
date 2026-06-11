const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { startCronJobs } = require('./utils/cronJobs');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const holidayRoutes = require('./routes/holidayRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Request Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger using Morgan & Winston
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/holidays', holidayRoutes);

// Swagger Documentation
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  logger.info(`Swagger API Docs available at http://localhost:${PORT}/api/docs`);
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

// Global Error Handler
app.use(errorHandler);

// Start Cron Jobs
startCronJobs();

// Start Server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app;
