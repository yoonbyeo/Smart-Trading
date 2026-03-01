import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createChart } from 'lightweight-charts';
import { api } from '../api/client.js';

const PERIODS = [
  { label: '1개월', value: '1mo' },
  { label: '3개월', value: '3mo' },
  { label: '6개월', value: '6mo' },
  { label: '1년', value: '1y' }
];

export default function StockDetail() {
  const { symbol } = useParams();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('3mo');
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const seriesRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/stock/${symbol}`)
      .then(setStock)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [symbol]);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }
    const chart = createChart(chartRef.current, {
      layout: { background: { color: '#111827' }, textColor: '#94a3b8' },
      grid: { vertLines: { color: '#1f2d45' }, horzLines: { color: '#1f2d45' } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#1f2d45' },
      timeScale: { borderColor: '#1f2d45' },
      width: chartRef.current.clientWidth,
      height: 340
    });
    const series = chart.addCandlestickSeries({
      upColor: '#10b981', downColor: '#ef4444',
      borderUpColor: '#10b981', borderDownColor: '#ef4444',
      wickUpColor: '#10b981', wickDownColor: '#ef4444'
    });
    chartInstanceRef.current = chart;
    seriesRef.current = series;

    const observer = new ResizeObserver(() => {
      if (chartInstanceRef.current && chartRef.current) {
        chartInstanceRef.current.applyOptions({ width: chartRef.current.clientWidth });
      }
    });
    observer.observe(chartRef.current);
    return () => { observer.disconnect(); };
  }, [symbol]);

  useEffect(() => {
    if (!seriesRef.current) return;
    api.get(`/stock/${symbol}/chart?period=${period}`)
      .then(data => {
        const candles = data
          .filter(d => d.open && d.high && d.low && d.close)
          .map(d => {
            const dateObj = d.date instanceof Date ? d.date : new Date(d.date);
            return {
              time: dateObj.toISOString().slice(0, 10),
              open: d.open, high: d.high, low: d.low, close: d.close
            };
          })
          .sort((a, b) => a.time.localeCompare(b.time));
        seriesRef.current.setData(candles);
        chartInstanceRef.current?.timeScale().fitContent();
      })
      .catch(() => {});
  }, [symbol, period]);

  if (loading) return <div className="loading"><div className="spinner" />분석 중...</div>;
  if (error) return <div className="error-msg">오류: {error}</div>;
  if (!stock) return null;

  const strategies = stock.strategies || [];
  const BADGE_MAP = {
    graham: { label: 'Graham', cls: 'badge-graham' },
    lynch: { label: 'Lynch', cls: 'badge-lynch' },
    buffett: { label: 'Buffett', cls: 'badge-buffett' },
    chowder: { label: 'Chowder', cls: 'badge-chowder' },
    short_term: { label: '단기', cls: 'badge-short' }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link to="/" style={{ color: 'var(--text2)', fontSize: 13 }}>← 대시보드</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{stock.symbol}</h1>
          <p style={{ color: 'var(--text2)', fontSize: 15 }}>{stock.name}</p>
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {strategies.map(s => {
              const b = BADGE_MAP[s];
              return b ? <span key={s} className={`badge ${b.cls}`}>{b.label}</span> : null;
            })}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>
            {stock.currentPrice ? `$${stock.currentPrice.toLocaleString()}` : '-'}
          </div>
          <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>현재가</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: '목표가', value: stock.targetPrice ? `$${stock.targetPrice.toLocaleString()}` : '-', color: 'var(--green)' },
          { label: '손절가', value: stock.stopLoss ? `$${stock.stopLoss.toLocaleString()}` : '-', color: 'var(--red)' },
          { label: 'P/E', value: stock.peRatio ? stock.peRatio.toFixed(1) : '-', color: 'var(--text)' },
          { label: 'PEG', value: stock.pegRatio ? stock.pegRatio.toFixed(2) : '-', color: stock.pegRatio < 1 ? 'var(--green)' : 'var(--text)' },
          { label: 'ROE', value: stock.roe ? `${stock.roe.toFixed(1)}%` : '-', color: stock.roe >= 15 ? 'var(--green)' : 'var(--text)' },
          { label: 'RSI', value: stock.rsi ? Math.round(stock.rsi) : '-', color: stock.rsi < 30 ? 'var(--green)' : stock.rsi > 70 ? 'var(--red)' : 'var(--text)' },
          { label: '그레이엄 수', value: stock.grahamNumber ? `$${stock.grahamNumber.toFixed(1)}` : '-', color: 'var(--text)' },
          { label: '종합 점수', value: `${Math.round(stock.score || 0)}점`, color: 'var(--accent2)' }
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ color: 'var(--text2)', fontSize: 12, marginBottom: 6 }}>{label}</div>
            <div style={{ fontWeight: 700, fontSize: 18, color }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>가격 차트</h2>
          <div style={{ display: 'flex', gap: 6 }}>
            {PERIODS.map(p => (
              <button key={p.value} onClick={() => setPeriod(p.value)} className={`btn btn-sm ${period === p.value ? 'btn-primary' : 'btn-ghost'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div ref={chartRef} style={{ borderRadius: 8, overflow: 'hidden' }} />
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>분석 요약</h2>
        <p style={{ color: 'var(--text2)', lineHeight: 1.8 }}>{stock.summary || '분석 중'}</p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>관련 뉴스</h2>
        <a href={`https://news.google.com/search?q=${encodeURIComponent(stock.symbol)}+stock&hl=ko`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
          Google 뉴스에서 보기 →
        </a>
      </div>
    </div>
  );
}
