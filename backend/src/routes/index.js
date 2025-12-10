const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const scraperRoutes = require('./scraperRoutes');
const dataRoutes = require('./dataRoutes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/scrapers', scraperRoutes);
router.use('/data', dataRoutes);

module.exports = router;