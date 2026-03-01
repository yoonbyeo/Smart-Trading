import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import stockRoutes from './routes/stock.js';
import analysisRoutes from './routes/analysis.js';
import portfolioRoutes from './routes/portfolio.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api', analysisRoutes);
app.use('/api/portfolio', portfolioRoutes);

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
