const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'TaskFlow API is running', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// API info
app.get('/api', (req, res) => {
  res.json({
    success: true,
    name: 'TaskFlow API',
    version: '1.0.0',
    endpoints: {
      auth: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET  /api/auth/me',
        'PUT  /api/auth/profile',
        'PUT  /api/auth/password',
      ],
      tasks: [
        'GET    /api/tasks',
        'POST   /api/tasks',
        'GET    /api/tasks/:id',
        'PUT    /api/tasks/:id',
        'DELETE /api/tasks/:id',
        'GET    /api/tasks/stats',
        'POST   /api/tasks/bulk',
      ],
    },
  });
});

// 404 & Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
const start = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀 TaskFlow API running on http://localhost:${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

start();
