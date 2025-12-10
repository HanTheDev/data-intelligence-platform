const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const { authenticateToken } = require('../middleware/auth');
const { validateQuery } = require('../middleware/validation');
const { paginationSchema } = require('../utils/validators');

// All routes require authentication
router.use(authenticateToken);

// GET /api/data - Get all scraped data
router.get('/',
  validateQuery(paginationSchema),
  dataController.getAllData
);

// GET /api/data/statistics - Get statistics
router.get('/statistics', dataController.getStatistics);

// GET /api/data/:id - Get single data item
router.get('/:id', dataController.getDataById);

// DELETE /api/data/:id - Delete single data item
router.delete('/:id', dataController.deleteData);

// POST /api/data/bulk-delete - Bulk delete old data
router.post('/bulk-delete', dataController.bulkDeleteOldData);

module.exports = router;