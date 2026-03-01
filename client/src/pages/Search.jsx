import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = useCallback(async (q) => {
    if (q.length < 1) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await api.get(`/search?q=${encodeURIComponent(q)}`);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    clearTimeout(window._searchTimer);
    window._searchTimer = setTimeout(() => handleSearch(v), 400);
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>종목 검색</h1>
        <p style={{ color: 'var(--text2)' }}>미국 · 한국 주식 검색 (예: Apple, AAPL, 삼성, 005930.KS)</p>
      </div>

      <div style={{ position: 'relative', maxWidth: 500, marginBottom: 28 }}>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="종목명 또는 티커 입력..."
          style={{ paddingLeft: 42, fontSize: 15, height: 46 }}
          autoFocus
        />
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)', pointerEvents: 'none' }}>🔍</span>
        {loading && <div className="spinner" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', margin: 0 }} />}
      </div>

      {results.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {results.map((r, i) => (
            <div key={r.symbol} onClick={() => navigate(`/stock/${r.symbol}`)}
              style={{
                padding: '14px 20px',
                borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{r.symbol}</div>
                <div style={{ color: 'var(--text2)', fontSize: 13 }}>{r.name}</div>
              </div>
              <span style={{ color: 'var(--text2)', fontSize: 12 }}>{r.exchange}</span>
            </div>
          ))}
        </div>
      )}

      {query && !loading && results.length === 0 && (
        <div style={{ color: 'var(--text2)', textAlign: 'center', padding: 40 }}>검색 결과가 없습니다.</div>
      )}

      {!query && (
        <div>
          <p style={{ color: 'var(--text2)', marginBottom: 16, fontSize: 13 }}>주요 종목 바로가기</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA', 'AMZN', '005930.KS', '000660.KS'].map(s => (
              <button key={s} onClick={() => navigate(`/stock/${s}`)} className="btn btn-ghost btn-sm">{s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
