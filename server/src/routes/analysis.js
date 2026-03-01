import { Router } from 'express';
import { db } from '../db/index.js';
import { analyzeStock } from '../services/analysisEngine.js';

const router = Router();

const SAMPLE_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', '005930.KS', '000660.KS', 'TSLA', 'NVDA', 'AMZN'];

router.get('/daily-analysis', async (req, res) => {
  try {
    const { strategy } = req.query;
    const today = new Date().toISOString().slice(0, 10);

    let row = db.prepare('SELECT id FROM daily_analysis WHERE analysis_date = ?').get(today);

    if (!row) {
      db.prepare('INSERT INTO daily_analysis (analysis_date) VALUES (?)').run(today);
      row = db.prepare('SELECT id FROM daily_analysis WHERE analysis_date = ?').get(today);

      for (const symbol of SAMPLE_SYMBOLS) {
        try {
          const a = await analyzeStock(symbol);
          if (a && a.strategies?.length > 0) {
            db.prepare(`
              INSERT INTO daily_stocks (analysis_id, symbol, name, market, current_price, target_price, stop_loss, score, short_term_score, strategies, summary, pe_ratio, peg_ratio, roe, graham_number, chowder_number, rsi)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              row.id, a.symbol, a.name, a.market, a.currentPrice, a.targetPrice, a.stopLoss,
              a.score, a.shortTermScore, a.strategies?.join(','), a.summary,
              a.peRatio, a.pegRatio, a.roe, a.grahamNumber, a.chowderNumber, a.rsi
            );
          }
        } catch (_) {}
      }
    }

    let sql = 'SELECT * FROM daily_stocks WHERE analysis_id = ?';
    const params = [row.id];
    if (strategy) {
      sql += ' AND strategies LIKE ?';
      params.push(`%${strategy}%`);
    }
    sql += ' ORDER BY score DESC, short_term_score DESC LIMIT 20';

    const stocks = db.prepare(sql).all(...params);
    res.json(stocks);
  } catch (e) {
    res.status(500).json({ error: e.message || '분석 조회 실패' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const { search } = await import('../services/yahooFinance.js');
    const results = await search(q);
    res.json(results.map(r => ({
      symbol: r.symbol,
      name: r.shortname || r.longname || r.shortName || r.longName || r.symbol,
      exchange: r.exchange || ''
    })));
  } catch {
    res.json([]);
  }
});

router.get('/market-regime', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const row = db.prepare('SELECT * FROM market_regime WHERE regime_date = ?').get(today);
  res.json(row || { us_regime: 'unknown', kr_regime: 'unknown' });
});

export default router;
