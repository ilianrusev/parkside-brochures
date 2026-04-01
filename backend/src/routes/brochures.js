import { Router } from 'express';
import {
  getAllParksidePages,
  getBrochuresWithParksidePages,
  getParksidePagesByBrochure,
} from '../db.js';
import { scrape } from '../scraper.js';

const router = Router();

// GET /api/pages — all current Parkside pages (flat list for the mobile app)
router.get('/pages', (req, res) => {
  const pages = getAllParksidePages();
  res.json(pages);
});

// GET /api/brochures — brochures that have Parkside pages
router.get('/brochures', (req, res) => {
  const brochures = getBrochuresWithParksidePages();
  res.json(brochures);
});

// GET /api/brochures/:id/pages — Parkside pages for a specific brochure
router.get('/brochures/:id/pages', (req, res) => {
  const pages = getParksidePagesByBrochure(req.params.id);
  res.json(pages);
});

// POST /api/scrape — trigger a manual scrape
router.post('/scrape', async (req, res) => {
  try {
    const result = await scrape();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
