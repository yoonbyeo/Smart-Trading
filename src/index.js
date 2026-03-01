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

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api', analysisRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.get('/api/health', (_, res) => res.json({ ok: true, env: process.env.NODE_ENV }));

if (isProd) {
  const distPath = join(__dirname, '../client/dist');
  if (existsSync(distPath)) {
    console.log('Serving static files from:', distPath);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(join(distPath, 'index.html'));
      }
    });
  } else {
    console.warn('client/dist not found');
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${isProd ? 'production' : 'development'}]`);
});
