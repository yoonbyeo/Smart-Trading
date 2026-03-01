import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import db from '../db/schema.js';
import { getQuote } from '../services/yahooFinance.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const holdings = db.prepare('SELECT * FROM portfolio_holdings WHERE user_id = ?').all(req.userId);
    const symbols = [...new Set(holdings.map(h => h.symbol))];
    const quotes = {};
    for (const s of symbols) {
      try {
        const q = await getQuote(s);
        if (q) quotes[s] = q.regularMarketPrice;
      } catch (_) {}
    }

    const enriched = holdings.map(h => ({
      ...h,
      currentPrice: quotes[h.symbol] || h.avg_cost,
      value: (quotes[h.symbol] || h.avg_cost) * h.quantity,
      cost: h.avg_cost * h.quantity,
      returnPct: quotes[h.symbol] ? ((quotes[h.symbol] - h.avg_cost) / h.avg_cost * 100) : 0
    }));

    const totalValue = enriched.reduce((s, h) => s + h.value, 0);
    const totalCost = enriched.reduce((s, h) => s + h.cost, 0);
    res.json({
      holdings: enriched,
      totalValue,
      totalCost,
      totalReturnPct: totalCost > 0 ? ((totalValue - totalCost) / totalCost * 100) : 0
    });
  } catch (e) {
    res.status(500).json({ error: e.message || '포트폴리오 조회 실패' });
  }
});

router.post('/', (req, res) => {
  try {
    const { symbol, quantity, avg_cost, purchased_at } = req.body;
    if (!symbol || !quantity || !avg_cost) return res.status(400).json({ error: '종목, 수량, 매수가를 입력해주세요.' });
    const result = db.prepare(`
      INSERT INTO portfolio_holdings (user_id, symbol, quantity, avg_cost, purchased_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.userId, symbol.toUpperCase(), Number(quantity), Number(avg_cost), purchased_at || null);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (e) {
    res.status(500).json({ error: e.message || '추가 실패' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, avg_cost } = req.body;
    db.prepare(`
      UPDATE portfolio_holdings SET
        quantity = COALESCE(?, quantity),
        avg_cost = COALESCE(?, avg_cost)
      WHERE id = ? AND user_id = ?
    `).run(
      quantity != null ? Number(quantity) : null,
      avg_cost != null ? Number(avg_cost) : null,
      id, req.userId
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message || '수정 실패' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM portfolio_holdings WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message || '삭제 실패' });
  }
});

export default router;
