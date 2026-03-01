import { initDb } from './schema.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function resolveDbPath() {
  if (process.env.DB_PATH) return process.env.DB_PATH;
  // Render persistent disk
  const renderPath = '/opt/render/project/data';
  if (existsSync('/opt/render')) {
    if (!existsSync(renderPath)) mkdirSync(renderPath, { recursive: true });
    return join(renderPath, 'analysis.db');
  }
  return join(__dirname, '../../data/analysis.db');
}

export const db = initDb(resolveDbPath());
