import { Router } from 'express';
import { getHistorical } from '../services/yahooFinance.js';
import { analyzeStock, calcRSI } from '../services/analysisEngine.js';

const router = Router();

router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const analysis = await analyzeStock(symbol);
    if (!analysis) return res.status(404).json({ error: '종목을 찾을 수 없습니다.' });
    res.json(analysis);
  } catch (e) {
    res.status(500).json({ error: e.message || '분석 중 오류가 발생했습니다.' });
  }
});

router.get('/:symbol/chart', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1mo', interval = '1d' } = req.query;
    const data = await getHistorical(symbol, period, interval);
    res.json(data);
  } catch {
    res.json([]);
  }
});

router.get('/:symbol/technical', async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await getHistorical(symbol, '3mo');
    const closes = data.map(q => q.close).filter(Boolean);
    const rsi = calcRSI(closes);
    res.json({ rsi });
  } catch {
    res.json({ rsi: null });
  }
});

router.get('/:symbol/news', (req, res) => {
  const baseSymbol = req.params.symbol.replace(/\.(KS|KQ)$/, '');
  const url = `https://news.google.com/search?q=${encodeURIComponent(baseSymbol)}+stock&hl=ko`;
  res.json({ url, articles: [] });
});

export default router;
