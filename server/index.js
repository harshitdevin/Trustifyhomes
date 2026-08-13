import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import brokerRoutes from './routes/brokerRoutes.js';
import dealRoutes from './routes/dealRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS & Middleware
app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'EZ HOMES Jammu Real Estate Backend REST API',
    timestamp: new Date().toISOString()
  });
});

// REST API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/brokers', brokerRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/audit-logs', auditRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` EZ HOMES Backend REST API Server running on port ${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
