const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const alertRoutes = require('./routes/alert.routes');
const userRoutes = require('./routes/user.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate Limiter Global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { status: 'fail', message: 'Terlalu banyak permintaan, coba lagi nanti.' },
});
app.use('/api', globalLimiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'SiapSiaga API Server running normal',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Rute ${req.originalUrl} tidak ditemukan`,
  });
});

// Error handling
app.use(errorHandler);

module.exports = app;
