const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const { testConnection, initDatabase } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const centerRoutes = require('./routes/centers');
const projectRoutes = require('./routes/projects');
const staffRoutes = require('./routes/staff');
const userRoutes = require('./routes/users');
const roleRoutes = require('./routes/roles');
const projectMemberRoutes = require('./routes/projectMembers');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'MS System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/centers', centerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/project-members', projectMemberRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Initialize database and start server
const startServer = () => {
  // Test database connection
  testConnection((isConnected) => {
    if (!isConnected) {
      console.error('❌ Cannot start server without database connection');
      process.exit(1);
    }

    // Initialize database tables
    initDatabase((initSuccess) => {
      if (!initSuccess) {
        console.error('❌ Failed to initialize database');
        process.exit(1);
      }

      // Start server
      app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/health`);
        console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      });
    });
  });
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer(); 