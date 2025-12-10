const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');
const { authenticateToken } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validation');
const { scraperConfigSchema, paginationSchema } = require('../utils/validators');
const { scraperLimiter } = require('../middleware/rateLimiter');

// All routes require authentication
router.use(authenticateToken);

// GET /api/scrapers - Get all scraper configurations
router.get('/', 
  validateQuery(paginationSchema),
  scraperController.getAllScrapers
);

// GET /api/scrapers/:id - Get single scraper
router.get('/:id', scraperController.getScraper);

// POST /api/scrapers - Create new scraper
router.post('/',
  validate(scraperConfigSchema),
  scraperController.createScraper
);

// PUT /api/scrapers/:id - Update scraper
router.put('/:id',
  validate(scraperConfigSchema),
  scraperController.updateScraper
);

// DELETE /api/scrapers/:id - Delete scraper
router.delete('/:id', scraperController.deleteScraper);

// POST /api/scrapers/:id/execute - Execute scraper manually
router.post('/:id/execute',
  scraperLimiter,
  scraperController.executeScraper
);

// GET /api/scrapers/:id/logs - Get scraping logs
router.get('/:id/logs',
  validateQuery(paginationSchema),
  scraperController.getScrapingLogs
);

module.exports = router;