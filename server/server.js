// CRITICAL: Import config FIRST to load environment variables
import './config.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));

// Rate limiting — file browser generates several requests per navigation,
// so keep limit generous while still protecting against abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // ~40 folder navigations per minute per IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3003',
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON parsing
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Load routes dynamically to avoid blocking startup
console.log('Loading routes...');
const { default: driveRoutes } = await import('./routes/drive.js');
console.log('drive OK');
const { default: apuntesRoutes } = await import('./routes/apuntes.js');
console.log('apuntes OK');
const { default: favoritesRoutes } = await import('./routes/favorites.js');
console.log('favorites OK');
const { default: uploadRoutes } = await import('./routes/upload.js');
console.log('upload OK');
const { default: rankingAutoUpdateRoutes } = await import('./routes/rankingAutoUpdate.js');
console.log('rankingAutoUpdate OK');

// Drive API routes
app.use('/api/drive', driveRoutes);

// API Routes
app.use('/api/apuntes', apuntesRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ranking-update', rankingAutoUpdateRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('❌ Server error:', err.message);
  process.exit(1);
});