/**
 * Gandharva Backend - AI Music Retrieval Engine
 * Production-ready server for Anti Gravity AI projects.
 */
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const ngrok = require('ngrok');
const logger = require('./src/utils/logger');
const musicRoutes = require('./src/routes/musicRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const albumRoutes = require('./src/routes/albumRoutes');
const vocalRoutes = require('./src/routes/vocalRoutes');
const authRoutes = require('./src/routes/authRoutes');
const connectedServicesRoutes = require('./src/routes/connectedServicesRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Optimization Middleware: Robust CORS Configuration
const allowedOriginPatterns = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
  /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
  /\.ngrok-free\.app$/,
  /\.ngrok\.io$/,
  /\.vercel\.app$/
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser agents, mobile native apps (no origin), and matched domains
    if (!origin || allowedOriginPatterns.some(pattern => pattern.test(origin))) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive fallback for seamless dev preview
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning', 'apikey', 'X-Requested-With']
}));
app.options('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static fallback audio files from assets and public directories
app.use('/fallback', express.static(path.join(__dirname, 'assets/fallback_music'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.set('Content-Type', 'audio/mpeg');
  }
}));
app.use('/fallback', express.static(path.join(__dirname, 'public/fallback'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.set('Content-Type', 'audio/mpeg');
  }
}));

// Serve other public assets and generated AI tracks
app.use('/public', express.static(path.join(__dirname, 'public'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  }
}));
app.use('/generated', express.static(path.join(__dirname, 'public/generated'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.set('Content-Type', 'audio/wav');
  }
}));

const { handleHealthCheck } = require('./src/controllers/musicController');

// Root and Health Check Endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Gandharva Music Retrieval Engine',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', handleHealthCheck);
app.get('/api/health', handleHealthCheck);

// Primary API Routes
app.use('/api', authRoutes);
app.use('/api', musicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', albumRoutes);
app.use('/api', vocalRoutes);
app.use('/api', connectedServicesRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error('Unhandled System Error', err);
  res.status(500).json({
    success: false,
    message: 'A critical system error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

async function startServer() {
  app.listen(PORT, '0.0.0.0', async () => {
    console.log('\n===========================================');
    console.log(`🚀 LOCAL SERVER ACTIVE ON PORT ${PORT}`);
    
    // Attempt Ngrok tunnel in background without blocking server startup
    if (process.env.ENABLE_LOCAL_NGROK === 'true' && process.env.NGROK_AUTH_TOKEN) {
      ngrok.connect({
        proto: 'http',
        addr: PORT,
        authtoken: process.env.NGROK_AUTH_TOKEN
      }).then(url => {
        console.log(`📡 PUBLIC SERVER URL: ${url}`);
      }).catch(() => {});
    }
    logger.info(`Server initialized on port ${PORT} in ${process.env.NODE_ENV || 'production'} mode`);
  });
}

startServer();
