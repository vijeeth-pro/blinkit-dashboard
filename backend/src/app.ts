import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dashboardRoutes from './routes/dashboard.routes.js';
import salesRoutes from './routes/sales.routes.js';
import productsRoutes from './routes/products.routes.js';
import outletsRoutes from './routes/outlets.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { validateRequestBody } from './middleware/validation.middleware.js';

const app = express();

app.use(cors());
app.use(compression()); // Gzip/Brotli automatic payload compression
app.use(express.json());

// Global Joi Request Body Security Middleware
app.use(validateRequestBody);

// Performance Cache-Control Headers Middleware
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
  next();
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Blinkit BI Analytics Engine',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/outlets', outletsRoutes);
app.use('/api/reports', reportsRoutes);

// Central Error Handler
app.use(errorMiddleware);

export default app;
