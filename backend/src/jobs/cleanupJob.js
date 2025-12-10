const cron = require('node-cron');
const { ScrapedData, ScrapingLog } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

class CleanupJob {
  constructor() {
    this.job = null;
  }

  /**
   * Initialize cleanup job - runs daily at midnight
   */
  initialize() {
    this.job = cron.schedule('0 0 * * *', async () => {
      logger.info('Starting daily cleanup job');
      await this.cleanup();
    });

    logger.info('Cleanup job scheduled');
  }

  /**
   * Perform cleanup tasks
   */
  async cleanup() {
    try {
      // Delete scraped data older than 90 days
      const dataRetentionDays = 90;
      const dataCutoffDate = new Date();
      dataCutoffDate.setDate(dataCutoffDate.getDate() - dataRetentionDays);

      const deletedDataCount = await ScrapedData.destroy({
        where: {
          scrapedAt: { [Op.lt]: dataCutoffDate }
        }
      });

      logger.info(`Deleted ${deletedDataCount} old scraped data records`);

      // Delete logs older than 30 days
      const logRetentionDays = 30;
      const logCutoffDate = new Date();
      logCutoffDate.setDate(logCutoffDate.getDate() - logRetentionDays);

      const deletedLogCount = await ScrapingLog.destroy({
        where: {
          createdAt: { [Op.lt]: logCutoffDate }
        }
      });

      logger.info(`Deleted ${deletedLogCount} old scraping logs`);

      logger.info('Daily cleanup completed successfully');

    } catch (error) {
      logger.error('Cleanup job failed', { error: error.message });
    }
  }

  /**
   * Stop cleanup job
   */
  stop() {
    if (this.job) {
      this.job.stop();
      logger.info('Cleanup job stopped');
    }
  }
}

const cleanupJob = new CleanupJob();

module.exports = cleanupJob;