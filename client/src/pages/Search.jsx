import { useState } from 'react';
import { Link } from 'react-router-dom';
import { analysis } from '../api/client';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await analysis.search(query);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>종목 검색</h1>
      <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', maxWidth: 400 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="종목명 또는 심볼 (예: 삼성전자, AAPL)"
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={loading}>
            {loading ? '검색 중...' : '검색'}
          </button>
        </div>
      </form>

      {results.length > 0 && (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>심볼</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>종목명</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>거래소</th>
                <th style={{ padding: '0.75rem' }}></th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.symbol} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 500 }}>{r.symbol}</td>
                  <td style={{ padding: '0.75rem' }}>{r.name}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{r.exchange}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <Link to={`/stock/${encodeURIComponent(r.symbol)}`}>
                      <button style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>분석</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {results.length === 0 && query && !loading && (
        <p className="text-muted">검색 결과가 없습니다.</p>
      )}
    </div>
  );
}
