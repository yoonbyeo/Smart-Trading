import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createChart } from 'lightweight-charts';
import { stock } from '../api/client';

const STRATEGY_LABELS = {
  graham: '그레이엄',
  lynch: '린치',
  buffett: '버핏',
  chowder: '초우더',
  short_term: '단타'
};

export default function StockDetail() {
  const { symbol } = useParams();
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [period, setPeriod] = useState('1mo');
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    Promise.all([
      stock.get(symbol),
      stock.chart(symbol, period)
    ])
      .then(([analysis, chart]) => {
        setData(analysis);
        setChartData(chart);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [symbol, period]);

  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;

    if (chartInstance.current) {
      chartInstance.current.remove();
    }

    const chart = createChart(chartRef.current, {
      layout: { background: { color: '#1e252d' }, textColor: '#94a3b8' },
      grid: { vertLines: { color: '#2d3748' }, horzLines: { color: '#2d3748' } },
      width: chartRef.current.clientWidth,
      height: 300,
      timeScale: { timeVisible: true, secondsVisible: false }
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00c853',
      downColor: '#ff5252',
      borderVisible: false
    });

    const seriesData = chartData.map((d) => {
      let time = '';
      if (d.date) {
        if (typeof d.date === 'string') time = d.date.slice(0, 10);
        else if (d.date instanceof Date) time = d.date.toISOString().slice(0, 10);
        else if (typeof d.date === 'number') time = new Date(d.date * 1000).toISOString().slice(0, 10);
      }
      return { time, open: d.open, high: d.high, low: d.low, close: d.close };
    }).filter((d) => d.time && d.close != null);

    candleSeries.setData(seriesData);
    chart.timeScale().fitContent();
    chartInstance.current = chart;

    return () => {
      if (chartInstance.current) {
        chartInstance.current.remove();
        chartInstance.current = null;
      }
    };
  }, [chartData]);

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }} className="text-muted">
        로딩 중...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card">
        <p>종목을 찾을 수 없습니다.</p>
        <Link to="/">대시보드로 돌아가기</Link>
      </div>
    );
  }

  const strategies = (data.strategies || []).map((s) => STRATEGY_LABELS[s] || s);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" className="text-muted text-sm" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
          ← 대시보드
        </Link>
        <h1 style={{ fontSize: '1.5rem' }}>{data.name || data.symbol}</h1>
        <p className="text-muted">{data.symbol}</p>
      </div>

      <div className="card mb-4">
        <div className="flex justify-between items-center mb-4">
          <span className="font-mono" style={{ fontSize: '1.5rem' }}>
            {data.currentPrice != null ? `₩${Number(data.currentPrice).toLocaleString()}` : '-'}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['1mo', '3mo', '6mo', '1y'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{ background: period === p ? 'var(--accent)' : 'var(--bg-secondary)' }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div ref={chartRef} style={{ width: '100%', height: 300 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="text-muted text-sm">목표가</div>
          <div className="font-mono">{data.targetPrice != null ? `₩${Number(data.targetPrice).toLocaleString()}` : '-'}</div>
        </div>
        <div className="card">
          <div className="text-muted text-sm">손절가</div>
          <div className="font-mono">{data.stopLoss != null ? `₩${Number(data.stopLoss).toLocaleString()}` : '-'}</div>
        </div>
        <div className="card">
          <div className="text-muted text-sm">P/E</div>
          <div className="font-mono">{data.peRatio != null ? data.peRatio.toFixed(1) : '-'}</div>
        </div>
        <div className="card">
          <div className="text-muted text-sm">PEG</div>
          <div className="font-mono">{data.pegRatio != null ? data.pegRatio.toFixed(2) : '-'}</div>
        </div>
        <div className="card">
          <div className="text-muted text-sm">ROE</div>
          <div className="font-mono">{data.roe != null ? `${data.roe.toFixed(1)}%` : '-'}</div>
        </div>
        <div className="card">
          <div className="text-muted text-sm">RSI</div>
          <div className="font-mono">{data.rsi != null ? data.rsi.toFixed(0) : '-'}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '0.75rem' }}>적용 전략</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {strategies.map((s) => (
            <span key={s} style={{ padding: '0.25rem 0.5rem', background: 'var(--bg-secondary)', borderRadius: 4 }}>
              {s}
            </span>
          ))}
        </div>
        <p className="text-muted">{data.summary || '분석 요약 없음'}</p>
      </div>
    </div>
  );
}
