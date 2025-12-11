const { ScraperConfig, ScrapedData, ScrapingLog } = require('../models');
const ScraperFactory = require('../scrapers/ScraperFactory');
const logger = require('../config/logger');
const { Op } = require('sequelize');

class ScraperController {
  // Get all scraper configurations
  async getAllScrapers(req, res, next) {
    try {
      const { page = 1, limit = 20, isActive } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const { count, rows } = await ScraperConfig.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        include: [{
          model: ScrapingLog,
          as: 'logs',
          limit: 1,
          order: [['created_at', 'DESC']],
          required: false
        }]
      });

      res.json({
        success: true,
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single scraper configuration
  async getScraper(req, res, next) {
    try {
      const { id } = req.params;

      const scraper = await ScraperConfig.findByPk(id, {
        include: [{
          model: ScrapingLog,
          as: 'logs',
          limit: 10,
          order: [['createdAt', 'DESC']]
        }]
      });

      if (!scraper) {
        return res.status(404).json({
          success: false,
          error: 'Scraper not found'
        });
      }

      res.json({
        success: true,
        data: scraper
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new scraper configuration
  async createScraper(req, res, next) {
    try {
      const scraperData = req.body;

      const scraper = await ScraperConfig.create(scraperData);

      logger.info('Scraper configuration created', {
        scraperId: scraper.id,
        name: scraper.name
      });

      res.status(201).json({
        success: true,
        data: scraper
      });
    } catch (error) {
      next(error);
    }
  }

  // Update scraper configuration
  async updateScraper(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const scraper = await ScraperConfig.findByPk(id);

      if (!scraper) {
        return res.status(404).json({
          success: false,
          error: 'Scraper not found'
        });
      }

      await scraper.update(updates);

      logger.info('Scraper configuration updated', {
        scraperId: scraper.id,
        name: scraper.name
      });

      res.json({
        success: true,
        data: scraper
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete scraper configuration
  async deleteScraper(req, res, next) {
    try {
      const { id } = req.params;

      const scraper = await ScraperConfig.findByPk(id);

      if (!scraper) {
        return res.status(404).json({
          success: false,
          error: 'Scraper not found'
        });
      }

      await scraper.destroy();

      logger.info('Scraper configuration deleted', {
        scraperId: id
      });

      res.json({
        success: true,
        message: 'Scraper deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Execute scraper manually
  async executeScraper(req, res, next) {
    try {
      const { id } = req.params;

      const config = await ScraperConfig.findByPk(id);

      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'Scraper not found'
        });
      }

      if (!config.isActive) {
        return res.status(400).json({
          success: false,
          error: 'Scraper is not active'
        });
      }

      // Execute scraper asynchronously
      const scraper = ScraperFactory.createScraper(config);
      
      // Don't wait for scraping to complete - return immediately
      scraper.execute().catch(err => {
        logger.error('Scraper execution failed', {
          scraperId: id,
          error: err.message
        });
      });

      // Update last run time
      await config.update({ lastRunAt: new Date() });

      res.json({
        success: true,
        message: 'Scraper execution started',
        scraperId: id
      });
    } catch (error) {
      next(error);
    }
  }

  // Get scraping logs
  async getScrapingLogs(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, status } = req.query;
      const offset = (page - 1) * limit;

      const where = { scraperConfigId: id };
      if (status) {
        where.status = status;
      }

      const { count, rows } = await ScrapingLog.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ScraperController();