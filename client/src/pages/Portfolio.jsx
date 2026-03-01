import { useState, useEffect } from 'react';
import { portfolio as portfolioApi } from '../api/client';

export default function Portfolio() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ symbol: '', quantity: '', avg_cost: '' });

  const load = () => {
    portfolioApi.get()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.symbol || !form.quantity || !form.avg_cost) return;
    try {
      await portfolioApi.add(form.symbol, form.quantity, form.avg_cost);
      setForm({ symbol: '', quantity: '', avg_cost: '' });
      setAddOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemove = async (id) => {
    if (!confirm('삭제하시겠습니까?')) return;
    try {
      await portfolioApi.remove(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }} className="text-muted">
        포트폴리오 로딩 중...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="card" style={{ color: 'var(--down)' }}>
        {error}
      </div>
    );
  }

  const { holdings = [], totalValue = 0, totalCost = 0, totalReturnPct = 0 } = data || {};

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 style={{ fontSize: '1.5rem' }}>내 포트폴리오</h1>
        <button onClick={() => setAddOpen(true)}>종목 추가</button>
      </div>

      {error && (
        <div className="card mb-4" style={{ color: 'var(--down)' }}>{error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="text-muted text-sm">총 평가금액</div>
          <div className="font-mono" style={{ fontSize: '1.25rem' }}>
            ₩{totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="card">
          <div className="text-muted text-sm">총 투자원금</div>
          <div className="font-mono" style={{ fontSize: '1.25rem' }}>
            ₩{totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="card">
          <div className="text-muted text-sm">수익률</div>
          <div className={`font-mono ${totalReturnPct >= 0 ? 'up' : 'down'}`} style={{ fontSize: '1.25rem' }}>
            {totalReturnPct >= 0 ? '+' : ''}{totalReturnPct.toFixed(2)}%
          </div>
        </div>
      </div>

      {addOpen && (
        <div className="card mb-4">
          <h3 style={{ marginBottom: '1rem' }}>종목 추가</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label className="text-sm" style={{ display: 'block', marginBottom: '0.25rem' }}>심볼</label>
              <input
                value={form.symbol}
                onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                placeholder="AAPL"
                required
              />
            </div>
            <div>
              <label className="text-sm" style={{ display: 'block', marginBottom: '0.25rem' }}>수량</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="10"
                required
                min="0.0001"
                step="any"
              />
            </div>
            <div>
              <label className="text-sm" style={{ display: 'block', marginBottom: '0.25rem' }}>매수가</label>
              <input
                type="number"
                value={form.avg_cost}
                onChange={(e) => setForm({ ...form, avg_cost: e.target.value })}
                placeholder="150000"
                required
                min="0"
                step="any"
              />
            </div>
            <button type="submit">추가</button>
            <button type="button" onClick={() => setAddOpen(false)} style={{ background: 'var(--bg-secondary)' }}>
              취소
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>종목</th>
              <th style={{ textAlign: 'right', padding: '0.75rem' }}>수량</th>
              <th style={{ textAlign: 'right', padding: '0.75rem' }}>매수가</th>
              <th style={{ textAlign: 'right', padding: '0.75rem' }}>현재가</th>
              <th style={{ textAlign: 'right', padding: '0.75rem' }}>평가금액</th>
              <th style={{ textAlign: 'right', padding: '0.75rem' }}>수익률</th>
              <th style={{ padding: '0.75rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {holdings.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center' }} className="text-muted">
                  보유 종목이 없습니다. 종목을 추가해보세요.
                </td>
              </tr>
            ) : (
              holdings.map((h) => (
                <tr key={h.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 500 }}>{h.symbol}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }} className="font-mono">{h.quantity}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }} className="font-mono">
                    ₩{Number(h.avg_cost).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }} className="font-mono">
                    ₩{Number(h.currentPrice).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }} className="font-mono">
                    ₩{Number(h.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }} className={`font-mono ${h.returnPct >= 0 ? 'up' : 'down'}`}>
                    {h.returnPct >= 0 ? '+' : ''}{h.returnPct.toFixed(2)}%
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      onClick={() => handleRemove(h.id)}
                      style={{ background: 'var(--down)', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
