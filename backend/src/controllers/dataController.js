const { ScrapedData, ScraperConfig } = require('../models');
const { Op } = require('sequelize');
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

      // Total count
      const totalCount = await ScrapedData.count({ where });

      // Count by data type
      const byType = await ScrapedData.findAll({
        where,
        attributes: [
          'dataType',
          [ScrapedData.sequelize.fn('COUNT', ScrapedData.sequelize.col('id')), 'count']
        ],
        group: ['dataType']
      });

      // Count by scraper
      const byScraper = await ScrapedData.findAll({
        where,
        attributes: [
          'scraperConfigId',
          [ScrapedData.sequelize.fn('COUNT', ScrapedData.sequelize.col('id')), 'count']
        ],
        group: ['scraperConfigId'],
        include: [{
          model: ScraperConfig,
          as: 'scraperConfig',
          attributes: ['name', 'scraperType']
        }]
      });

      // Daily counts for chart
      const dailyCounts = await ScrapedData.findAll({
        where,
        attributes: [
          [ScrapedData.sequelize.fn('DATE', ScrapedData.sequelize.col('scraped_at')), 'date'],
          [ScrapedData.sequelize.fn('COUNT', ScrapedData.sequelize.col('id')), 'count']
        ],
        group: [ScrapedData.sequelize.fn('DATE', ScrapedData.sequelize.col('scraped_at'))],
        order: [[ScrapedData.sequelize.fn('DATE', ScrapedData.sequelize.col('scraped_at')), 'ASC']]
      });

      res.json({
        success: true,
        data: {
          totalCount,
          byType: byType.map(item => ({
            type: item.dataType,
            count: parseInt(item.dataValues.count)
          })),
          byScraper: byScraper.map(item => ({
            scraperId: item.scraperConfigId,
            scraperName: item.scraperConfig?.name,
            scraperType: item.scraperConfig?.scraperType,
            count: parseInt(item.dataValues.count)
          })),
          dailyCounts: dailyCounts.map(item => ({
            date: item.dataValues.date,
            count: parseInt(item.dataValues.count)
          }))
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