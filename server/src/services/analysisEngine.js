import { getQuote, getHistorical, getQuoteSummary } from './yahooFinance.js';

// Graham Number: √(22.5 × BVPS × EPS)
export function grahamNumber(bvps, eps) {
  if (!bvps || !eps || bvps <= 0 || eps <= 0) return null;
  return Math.sqrt(22.5 * bvps * eps);
}

// Graham Formula: V = EPS × (8.5 + 2g)
export function grahamFormula(eps, growthRate) {
  if (!eps || eps <= 0) return null;
  const g = Math.min(Math.max(growthRate || 0, 0), 0.25);
  return eps * (8.5 + 2 * g);
}

// PEG = P/E ÷ 성장률 (growthRate in %, e.g. 15 for 15%)
export function pegRatio(pe, growthRatePct) {
  if (!pe || !growthRatePct || growthRatePct <= 0) return null;
  return pe / growthRatePct;
}

// Lynch Fair Value = EPS × 성장률
export function lynchFairValue(eps, growthRate) {
  if (!eps || !growthRate || growthRate <= 0) return null;
  return eps * growthRate;
}

// RSI 계산
export function calcRSI(prices, period = 14) {
  if (!prices || prices.length < period + 1) return null;
  let gains = 0, losses = 0;
  for (let i = prices.length - period; i < prices.length - 1; i++) {
    const diff = prices[i + 1] - prices[i];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Chowder: 배당수익률 + 5년 배당성장률
export function chowderNumber(dividendYield, dividendGrowth5y) {
  if (dividendYield == null) return null;
  return (dividendYield * 100 || 0) + (dividendGrowth5y || 0);
}

export async function analyzeStock(symbol) {
  const quote = await getQuote(symbol);
  const summary = await getQuoteSummary(symbol);
  const historical = await getHistorical(symbol, '3mo');

  if (!quote) return null;

  const result = {
    symbol,
    name: quote.shortName || quote.longName || symbol,
    currentPrice: quote.regularMarketPrice,
    market: symbol.endsWith('.KS') || symbol.endsWith('.KQ') ? 'KR' : 'US',
    strategies: [],
    peRatio: quote.trailingPE,
    pegRatio: null,
    roe: null,
    grahamNumber: null,
    targetPrice: null,
    stopLoss: null,
    score: 0,
    shortTermScore: 0,
    rsi: null,
    summary: ''
  };

  const summaryData = summary?.result?.[0];
  const eps = quote.trailingEps ?? summaryData?.defaultKeyStatistics?.trailingEps;
  const bvps = summaryData?.defaultKeyStatistics?.bookValue;
  const growthRate = summaryData?.earningsTrend?.trend?.[0]?.growth ?? 0.1;
  const dividendYield = quote.dividendYield ?? summaryData?.summaryDetail?.dividendYield;
  const dividendGrowth = summaryData?.summaryDetail?.dividendGrowth;

  // Graham
  if (bvps && eps && bvps > 0 && eps > 0) {
    const gn = grahamNumber(bvps, eps);
    result.grahamNumber = gn;
    if (quote.regularMarketPrice && gn && quote.regularMarketPrice < gn * 0.7) {
      result.strategies.push('graham');
      result.score += 25;
    }
  }

  // Lynch PEG - growthRate from API is decimal (0.15 = 15%)
  const growthPct = (growthRate && typeof growthRate === 'number') ? growthRate * 100 : 10;
  if (result.peRatio && growthPct > 0) {
    const peg = pegRatio(result.peRatio, growthPct);
    result.pegRatio = peg;
    if (peg && peg < 1) {
      result.strategies.push('lynch');
      result.score += 25;
    }
    const lfv = lynchFairValue(eps, growthPct);
    if (lfv) result.targetPrice = Math.round(lfv * 100) / 100;
  }

  // ROE (Buffett style)
  const roe = summaryData?.financialData?.returnOnEquity ?? summaryData?.defaultKeyStatistics?.returnOnEquity;
  result.roe = roe ? roe * 100 : null;
  if (result.roe && result.roe >= 15) {
    result.strategies.push('buffett');
    result.score += 20;
  }

  // Chowder (배당주)
  if (dividendYield != null && dividendYield > 0) {
    const chowder = chowderNumber(dividendYield, dividendGrowth);
    result.chowderNumber = chowder;
    const threshold = dividendYield >= 0.03 ? 12 : 15;
    if (chowder && chowder >= threshold) {
      result.strategies.push('chowder');
      result.score += 15;
    }
  }

  // Stop loss (현재가 대비 -7%)
  if (result.currentPrice) {
    result.stopLoss = Math.round(result.currentPrice * 0.93 * 100) / 100;
  }

  // RSI (단타)
  const closes = historical.map(q => q.close).filter(Boolean);
  result.rsi = calcRSI(closes);
  if (result.rsi != null) {
    if (result.rsi < 30) {
      result.shortTermScore += 30;
      result.strategies.push('short_term');
    } else if (result.rsi > 70) {
      result.shortTermScore -= 20;
    }
  }

  result.score = Math.min(result.score, 100);
  result.summary = buildSummary(result);

  return result;
}

function buildSummary(r) {
  const parts = [];
  if (r.strategies.includes('graham')) parts.push('그레이엄 가치 기준 저평가');
  if (r.strategies.includes('lynch')) parts.push('린치 PEG 기준 매력적');
  if (r.strategies.includes('buffett')) parts.push('버핏 스타일 ROE 양호');
  if (r.strategies.includes('chowder')) parts.push('배당 성장주');
  if (r.strategies.includes('short_term')) parts.push('RSI 과매도 구간');
  if (parts.length === 0) return '종합 분석 진행 중';
  return parts.join(', ');
}
