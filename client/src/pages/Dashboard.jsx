import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

const STRATEGIES = [
  { key: '', label: '전체' },
  { key: 'graham', label: '그레이엄' },
  { key: 'lynch', label: '린치' },
  { key: 'buffett', label: '버핏' },
  { key: 'chowder', label: '배당(Chowder)' },
  { key: 'short_term', label: '단기(RSI)' }
];

const BADGE_MAP = {
  graham: { label: 'Graham', cls: 'badge-graham' },
  lynch: { label: 'Lynch', cls: 'badge-lynch' },
  buffett: { label: 'Buffett', cls: 'badge-buffett' },
  chowder: { label: 'Chowder', cls: 'badge-chowder' },
  short_term: { label: '단기', cls: 'badge-short' }
};

export default function Dashboard() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [strategy, setStrategy] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/daily-analysis${strategy ? `?strategy=${strategy}` : ''}`)
      .then(setStocks)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [strategy]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>오늘의 추천 종목</h1>
        <p style={{ color: 'var(--text2)' }}>성공 투자자 전략 기반 자동 분석 · {new Date().toLocaleDateString('ko-KR')}</p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {STRATEGIES.map(s => (
          <button key={s.key} onClick={() => setStrategy(s.key)} className={`btn ${strategy === s.key ? 'btn-primary' : 'btn-ghost'} btn-sm`}>
            {s.label}
          </button>
        ))}
      </div>

      {loading && <div className="loading"><div className="spinner" />분석 중... (첫 로드 시 1-2분 소요될 수 있습니다)</div>}
      {error && <div className="error-msg">{error}</div>}

      {!loading && !error && stocks.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>
          해당 전략에 맞는 종목이 없습니다.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {stocks.map(stock => (
          <Link key={stock.id} to={`/stock/${stock.symbol}`} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s, transform 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 2 }}>{stock.symbol}</div>
                  <div style={{ color: 'var(--text2)', fontSize: 13 }}>{stock.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>
                    {stock.current_price ? `$${stock.current_price.toLocaleString()}` : '-'}
                  </div>
                  <span className="badge" style={{ background: stock.market === 'KR' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)', color: stock.market === 'KR' ? 'var(--green)' : 'var(--accent2)', fontSize: 10 }}>
                    {stock.market === 'KR' ? '한국' : '미국'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {(stock.strategies || '').split(',').filter(Boolean).map(s => {
                  const b = BADGE_MAP[s.trim()];
                  return b ? <span key={s} className={`badge ${b.cls}`}>{b.label}</span> : null;
                })}
              </div>

              <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>{stock.summary}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                <div style={{ background: 'var(--bg3)', padding: '8px 10px', borderRadius: 6 }}>
                  <div style={{ color: 'var(--text2)', marginBottom: 2 }}>목표가</div>
                  <div style={{ color: 'var(--green)', fontWeight: 600 }}>
                    {stock.target_price ? `$${stock.target_price.toLocaleString()}` : '-'}
                  </div>
                </div>
                <div style={{ background: 'var(--bg3)', padding: '8px 10px', borderRadius: 6 }}>
                  <div style={{ color: 'var(--text2)', marginBottom: 2 }}>손절가</div>
                  <div style={{ color: 'var(--red)', fontWeight: 600 }}>
                    {stock.stop_loss ? `$${stock.stop_loss.toLocaleString()}` : '-'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, color: 'var(--text2)' }}>
                <span>종합점수 <strong style={{ color: 'var(--accent2)' }}>{Math.round(stock.score || 0)}점</strong></span>
                {stock.rsi != null && <span>RSI <strong style={{ color: stock.rsi < 30 ? 'var(--green)' : stock.rsi > 70 ? 'var(--red)' : 'var(--text)' }}>{Math.round(stock.rsi)}</strong></span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
