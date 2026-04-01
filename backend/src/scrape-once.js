import 'dotenv/config';
import { scrape } from './scraper.js';
import { getAllParksidePages } from './db.js';

const result = await scrape();
console.log('\nResult:', result);

const pages = getAllParksidePages();
console.log(`\n${pages.length} Parkside pages in database:`);
for (const p of pages) {
  console.log(`  Page ${p.page_number} | ${p.date_range} | ${p.detected_by} | ${p.image_url.slice(0, 80)}...`);
}
