import yahooFinance from 'yahoo-finance2';

export async function getQuote(symbol) {
  try {
    return await yahooFinance.quote(symbol);
  } catch {
    return null;
  }
}

export async function getHistorical(symbol, period = '1mo', interval = '1d') {
  try {
    const end = new Date();
    const start = getPeriodStart(period);
    const data = await yahooFinance.chart(symbol, {
      period1: start.toISOString().slice(0, 10),
      period2: end.toISOString().slice(0, 10),
      interval
    });
    const quotes = data?.quotes || [];
    return quotes.filter(q => q.open != null && q.close != null).map(q => ({
      date: q.date,
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume
    }));
  } catch {
    return [];
  }
}

function getPeriodStart(period) {
  const d = new Date();
  if (period === '1d') d.setDate(d.getDate() - 1);
  else if (period === '5d') d.setDate(d.getDate() - 5);
  else if (period === '1mo') d.setMonth(d.getMonth() - 1);
  else if (period === '3mo') d.setMonth(d.getMonth() - 3);
  else if (period === '6mo') d.setMonth(d.getMonth() - 6);
  else if (period === '1y') d.setFullYear(d.getFullYear() - 1);
  else if (period === '2y') d.setFullYear(d.getFullYear() - 2);
  return d;
}

export async function search(query) {
  try {
    const results = await yahooFinance.search(query);
    return results?.quotes?.filter(q => q.symbol && q.quoteType === 'EQUITY')?.slice(0, 20) || [];
  } catch {
    return [];
  }
}

export async function getQuoteSummary(symbol) {
  try {
    return await yahooFinance.quoteSummary(symbol);
  } catch {
    return null;
  }
}
