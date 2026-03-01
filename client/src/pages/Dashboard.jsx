import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analysis } from '../api/client';

const STRATEGY_LABELS = {
  graham: '그레이엄',
  lynch: '린치',
  buffett: '버핏',
  chowder: '초우더',
  short_term: '단타'
};

export default function Dashboard() {
  const [stocks, setStocks] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    analysis.daily(filter)
      .then(setStocks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }} className="text-muted">
        오늘의 추천 종목을 불러오는 중...
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>오늘의 추천</h1>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setFilter('')}
          style={{ background: !filter ? 'var(--accent)' : 'var(--bg-secondary)' }}
        >
          전체
        </button>
        {Object.entries(STRATEGY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{ background: filter === key ? 'var(--accent)' : 'var(--bg-secondary)' }}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="card" style={{ color: 'var(--down)', marginBottom: '1rem' }}>{error}</div>
      )}

      {stocks.length === 0 && !error ? (
        <div className="card text-muted" style={{ textAlign: 'center', padding: '2rem' }}>
          오늘 분석된 추천 종목이 없습니다. 검색에서 종목을 조회해보세요.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {stocks.map((s) => (
            <Link
              key={s.id}
              to={`/stock/${encodeURIComponent(s.symbol)}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}>
                <div className="flex justify-between items-center mb-2">
                  <span style={{ fontWeight: 600 }}>{s.name || s.symbol}</span>
                  <span className="font-mono">{s.symbol}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-mono">
                    {s.current_price != null ? `₩${Number(s.current_price).toLocaleString()}` : '-'}
                  </span>
                  <span>점수 {s.score ?? '-'}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  {(s.strategies || '').split(',').filter(Boolean).map((str) => (
                    <span
                      key={str}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.5rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: 4
                      }}
                    >
                      {STRATEGY_LABELS[str] || str}
                    </span>
                  ))}
                </div>
                <p className="text-muted text-sm" style={{ margin: 0 }}>
                  {s.summary || '분석 중'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <p className="text-muted text-sm" style={{ marginTop: '1.5rem' }}>
        * 투자 참고용이며, 실제 투자 책임은 본인에게 있습니다.
      </p>
    </div>
  );
}
