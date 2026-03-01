import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import authRoutes from './routes/auth.js';
import stockRoutes from './routes/stock.js';
import analysisRoutes from './routes/analysis.js';
import portfolioRoutes from './routes/portfolio.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',')
  : true;
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api', analysisRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.get('/api/health', (_, res) => res.json({ ok: true }));

// Production: serve React build from client/dist
if (isProd) {
  const distPath = join(__dirname, '../../client/dist');
  if (existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(join(distPath, 'index.html'));
      }
    });
  }
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT} [${isProd ? 'production' : 'development'}]`);
});
