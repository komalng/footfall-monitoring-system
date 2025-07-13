const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const sensorRoutes = require('./routes/sensorRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const deviceRoutes = require('./routes/deviceRoutes');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MongoDB Connection with retry logic
const connectToMongoDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/footfall';
  
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      retryWrites: true,
    });
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('💡 Please make sure MongoDB is running:');
    console.log('   - Install MongoDB: https://www.mongodb.com/try/download/community');
    console.log('   - Or use MongoDB Atlas: https://www.mongodb.com/atlas');
    console.log('   - Or run: mongod --dbpath ./data/db');
    return false;
  }
};

// Initialize MongoDB connection
let mongoConnected = false;
const initializeMongoDB = async () => {
  mongoConnected = await connectToMongoDB();
  if (!mongoConnected) {
    console.log('🔄 Retrying MongoDB connection in 10 seconds...');
    setTimeout(initializeMongoDB, 10000);
  }
};

// Start MongoDB connection
initializeMongoDB();

// Routes
app.use('/api/sensor-data', sensorRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/devices', deviceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoConnected ? 'connected' : 'disconnected'
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.IO server ready`);
  console.log(`🗄️  MongoDB status: ${mongoConnected ? 'Connected' : 'Disconnected'}`);
});

module.exports = { app, server, io }; 