const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const apiRoutes = require('./routes');
const { initSocket } = require('./services/notificationService');
const { connectDB, mongoose } = require('./config/db');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST', 'PATCH']
  }
});
initSocket(io);

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health & Root Check
app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected (MongoDB)' : 'In-Memory Resilient Store';
  res.status(200).json({
    name: 'CampusCare College Complaint System API',
    status: 'online',
    database: dbStatus,
    frontendPortal: 'http://localhost:5173',
    healthCheck: '/health',
    apiEndpoints: {
      auth: '/api/auth',
      complaints: '/api/complaints',
      reports: '/api/reports'
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    databaseConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('[API Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

if (require.main === module) {
  server.listen(PORT, async () => {
    console.log(`===================================================`);
    console.log(`🚀 College Complaint System API Server Running`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`⚡ WebSocket: Real-time Socket.io active`);
    console.log(`🔐 Auth: Institutional LDAP/SSO adapter ready`);
    await connectDB();
    const { seedDefaultAccounts } = require('./services/authService');
    await seedDefaultAccounts();
    console.log(`🛡️ Auth: Multi-role DB authentication & predefined Admin ready`);
    console.log(`===================================================`);
  });
}

module.exports = { app, server, io };
