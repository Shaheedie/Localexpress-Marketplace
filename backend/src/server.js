import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import sellerRoutes from './routes/seller.js';
import adminRoutes from './routes/admin.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.disable('x-powered-by');
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({
    name: 'LocalExpress Marketplace API',
    status: 'running',
    version: '1.1.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'localexpress-api', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((error, req, res, next) => {
  console.error(error);
  const status = error.status || (error.code === 'LIMIT_FILE_SIZE' ? 413 : 500);
  const safeMessage = config.isProduction && status >= 500
    ? 'Something went wrong on the server.'
    : (error.message || 'Something went wrong on the server.');

  res.status(status).json({ message: safeMessage });
});

initDb()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`LocalExpress API running on http://localhost:${config.port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
