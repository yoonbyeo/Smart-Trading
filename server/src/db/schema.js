import Database from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function initDb(dbPath) {
  const dataDir = join(__dirname, '../../data');
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

  const db = new Database(dbPath || join(dataDir, 'analysis.db'));

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS daily_analysis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      analysis_date DATE UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS daily_stocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      analysis_id INTEGER REFERENCES daily_analysis(id),
      symbol TEXT,
      name TEXT,
      market TEXT,
      current_price REAL,
      target_price REAL,
      stop_loss REAL,
      score REAL,
      short_term_score REAL,
      strategies TEXT,
      summary TEXT,
      short_term_signal TEXT,
      pe_ratio REAL,
      peg_ratio REAL,
      roe REAL,
      graham_number REAL,
      roic REAL,
      ebit_ev_yield REAL,
      chowder_number REAL,
      rsi REAL,
      macd_signal TEXT,
      raw_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stock_news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT,
      title TEXT,
      url TEXT,
      source TEXT,
      published_at DATETIME,
      sentiment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS market_regime (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      regime_date DATE UNIQUE,
      us_regime TEXT,
      kr_regime TEXT,
      sp500_ma50 REAL,
      sp500_ma200 REAL,
      kospi_ma50 REAL,
      kospi_ma200 REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS portfolio_holdings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      symbol TEXT,
      quantity REAL,
      avg_cost REAL,
      purchased_at DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_daily_stocks_analysis ON daily_stocks(analysis_id);
    CREATE INDEX IF NOT EXISTS idx_portfolio_user ON portfolio_holdings(user_id);
  `);

  return db;
}
