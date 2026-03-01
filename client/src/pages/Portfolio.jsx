import { useState, useEffect } from 'react';
import { api } from '../api/client.js';

export default function Portfolio() {
  const [data, setData] = useState({ holdings: [], totalValue: 0, totalCost: 0, totalReturnPct: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ symbol: '', quantity: '', avg_cost: '', purchased_at: '' });
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchPortfolio = () => {
    setLoading(true);
    api.get('/portfolio').then(setData).catch(e => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(fetchPortfolio, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.post('/portfolio', {
        symbol: form.symbol.toUpperCase(),
        quantity: Number(form.quantity),
        avg_cost: Number(form.avg_cost),
        purchased_at: form.purchased_at || null
      });
      setForm({ symbol: '', quantity: '', avg_cost: '', purchased_at: '' });
      setShowForm(false);
      fetchPortfolio();
    } catch (e) {
      setError(e.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('삭제하시겠습니까?')) return;
    try {
      await api.delete(`/portfolio/${id}`);
      fetchPortfolio();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" />로딩 중...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>내 포트폴리오</h1>
          <p style={{ color: 'var(--text2)' }}>보유 종목 현황 및 수익률</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? '취소' : '+ 종목 추가'}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>종목 추가</h2>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: 'var(--text2)', fontSize: 13 }}>티커</label>
              <input placeholder="AAPL" value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: 'var(--text2)', fontSize: 13 }}>수량</label>
              <input type="number" placeholder="10" step="any" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: 'var(--text2)', fontSize: 13 }}>매수가</label>
              <input type="number" placeholder="150.00" step="any" value={form.avg_cost} onChange={e => setForm(f => ({ ...f, avg_cost: e.target.value }))} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: 'var(--text2)', fontSize: 13 }}>매수일</label>
              <input type="date" value={form.purchased_at} onChange={e => setForm(f => ({ ...f, purchased_at: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={adding} style={{ width: '100%', justifyContent: 'center' }}>
                {adding ? '추가 중...' : '추가'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: '총 평가액', value: `$${data.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: '총 투자금', value: `$${data.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          {
            label: '총 수익률',
            value: `${data.totalReturnPct >= 0 ? '+' : ''}${data.totalReturnPct.toFixed(2)}%`,
            color: data.totalReturnPct >= 0 ? 'var(--green)' : 'var(--red)'
          },
          { label: '보유 종목', value: `${data.holdings.length}개` }
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ color: 'var(--text2)', fontSize: 12, marginBottom: 6 }}>{label}</div>
            <div style={{ fontWeight: 700, fontSize: 20, color: color || 'var(--text)' }}>{value}</div>
          </div>
        ))}
      </div>

      {data.holdings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>
          보유 종목이 없습니다. 종목을 추가해보세요.
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>종목</th>
                <th>수량</th>
                <th>매수가</th>
                <th>현재가</th>
                <th>평가액</th>
                <th>수익률</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.holdings.map(h => (
                <tr key={h.id}>
                  <td><strong>{h.symbol}</strong></td>
                  <td>{h.quantity}</td>
                  <td>${h.avg_cost?.toLocaleString()}</td>
                  <td>${h.currentPrice?.toLocaleString()}</td>
                  <td>${h.value?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className={h.returnPct >= 0 ? 'positive' : 'negative'}>
                    {h.returnPct >= 0 ? '+' : ''}{h.returnPct?.toFixed(2)}%
                  </td>
                  <td>
                    <button onClick={() => handleDelete(h.id)} className="btn btn-danger btn-sm">삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
