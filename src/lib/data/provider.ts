import { demoSource } from './demoSource';
import type { DataSource } from './source';

// For now the panel ships with a demo source. Real sources (API / Google Sheets)
// can be plugged here without touching the UI. See README for integration notes.
export function getDataSource(): DataSource {
  return demoSource;
}


