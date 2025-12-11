const { ScrapedData, ScraperConfig } = require('../models');
const { Op, Sequelize } = require('sequelize');
const logger = require('../config/logger');

class DataController {
  // Get all scraped data
  async getAllData(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        dataType,
        scraperId,
        search,
        startDate,
        endDate,
        sortBy = 'scrapedAt',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      // Filters
      if (dataType) where.dataType = dataType;
      if (scraperId) where.scraperConfigId = scraperId;

      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (startDate || endDate) {
        where.scrapedAt = {};
        if (startDate) where.scrapedAt[Op.gte] = new Date(startDate);
        if (endDate) where.scrapedAt[Op.lte] = new Date(endDate);
      }

      const { count, rows } = await ScrapedData.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder]],
        include: [{
          model: ScraperConfig,
          as: 'scraperConfig',
          attributes: ['id', 'name', 'scraperType']
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

  // Get single scraped data item
  async getDataById(req, res, next) {
    try {
      const { id } = req.params;

      const data = await ScrapedData.findByPk(id, {
        include: [{
          model: ScraperConfig,
          as: 'scraperConfig',
          attributes: ['id', 'name', 'scraperType', 'targetUrl']
        }]
      });

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Data not found'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  // Get data statistics
  async getStatistics(req, res, next) {
    try {
      const { scraperId, days = 7 } = req.query;

      const where = {};
      if (scraperId) where.scraperConfigId = scraperId;

      // Date range for statistics
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      where.scrapedAt = { [Op.gte]: startDate };

      // 1. Total count
      const totalCount = await ScrapedData.count({ where });

      // 2. Count by data type - using raw query to avoid ambiguity
      const byTypeResult = await ScrapedData.sequelize.query(`
        SELECT data_type as "dataType", COUNT(*) as count
        FROM scraped_data
        WHERE scraped_at >= :startDate
        ${scraperId ? 'AND scraper_config_id = :scraperId' : ''}
        GROUP BY data_type
        ORDER BY count DESC
      `, {
        replacements: { 
          startDate, 
          ...(scraperId && { scraperId: parseInt(scraperId) }) 
        },
        type: Sequelize.QueryTypes.SELECT
      });

      // 3. Count by scraper
      const byScraperResult = await ScrapedData.sequelize.query(`
        SELECT 
          sd.scraper_config_id as "scraperId",
          sc.name as "scraperName",
          sc.scraper_type as "scraperType",
          COUNT(*) as count
        FROM scraped_data sd
        LEFT JOIN scraper_configs sc ON sd.scraper_config_id = sc.id
        WHERE sd.scraped_at >= :startDate
        ${scraperId ? 'AND sd.scraper_config_id = :scraperId' : ''}
        GROUP BY sd.scraper_config_id, sc.name, sc.scraper_type
        ORDER BY count DESC
      `, {
        replacements: { 
          startDate, 
          ...(scraperId && { scraperId: parseInt(scraperId) }) 
        },
        type: Sequelize.QueryTypes.SELECT
      });

      // 4. Daily counts for chart
      const dailyCountsResult = await ScrapedData.sequelize.query(`
        SELECT 
          DATE(scraped_at) as date,
          COUNT(*) as count
        FROM scraped_data
        WHERE scraped_at >= :startDate
        ${scraperId ? 'AND scraper_config_id = :scraperId' : ''}
        GROUP BY DATE(scraped_at)
        ORDER BY date ASC
      `, {
        replacements: { 
          startDate, 
          ...(scraperId && { scraperId: parseInt(scraperId) }) 
        },
        type: Sequelize.QueryTypes.SELECT
      });

      res.json({
        success: true,
        data: {
          totalCount,
          byType: byTypeResult,
          byScraper: byScraperResult,
          dailyCounts: dailyCountsResult
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete scraped data
  async deleteData(req, res, next) {
    try {
      const { id } = req.params;

      const data = await ScrapedData.findByPk(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Data not found'
        });
      }

      await data.destroy();

      logger.info('Scraped data deleted', { dataId: id });

      res.json({
        success: true,
        message: 'Data deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Bulk delete old data
  async bulkDeleteOldData(req, res, next) {
    try {
      const { days = 30 } = req.body;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

      const deletedCount = await ScrapedData.destroy({
        where: {
          scrapedAt: { [Op.lt]: cutoffDate }
        }
      });

      logger.info('Bulk deleted old data', {
        deletedCount,
        olderThanDays: days
      });

      res.json({
        success: true,
        message: `Deleted ${deletedCount} records older than ${days} days`
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DataController();