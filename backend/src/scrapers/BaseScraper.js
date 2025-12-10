const logger = require('../config/logger');
const { ScrapingLog } = require('../models');
const { randomDelay, retryWithBackoff } = require('../utils/scraperHelpers');

class BaseScraper {
  constructor(config) {
    this.config = config;
    this.scraperConfigId = config.id;
    this.name = config.name;
    this.targetUrl = config.targetUrl;
    this.options = config.configJson || {};
  }

  /**
   * Main scrape method - to be implemented by child classes
   */
  async scrape() {
    throw new Error('scrape() method must be implemented by child class');
  }

  /**
   * Execute scraping with logging
   */
  async execute() {
    const startTime = Date.now();
    let logEntry = null;

    try {
      // Create log entry
      logEntry = await ScrapingLog.create({
        scraperConfigId: this.scraperConfigId,
        status: 'running',
        startedAt: new Date()
      });

      logger.info(`Starting scraper: ${this.name}`, {
        scraperId: this.scraperConfigId,
        url: this.targetUrl
      });

      // Execute scraping
      const results = await retryWithBackoff(
        () => this.scrape(),
        3,
        2000
      );

      const executionTime = Date.now() - startTime;

      // Update log entry with success
      await logEntry.update({
        status: 'success',
        itemsScraped: results.length,
        executionTimeMs: executionTime,
        completedAt: new Date()
      });

      logger.info(`Scraper completed: ${this.name}`, {
        scraperId: this.scraperConfigId,
        itemsScraped: results.length,
        executionTime: `${executionTime}ms`
      });

      return results;

    } catch (error) {
      const executionTime = Date.now() - startTime;

      logger.error(`Scraper failed: ${this.name}`, {
        scraperId: this.scraperConfigId,
        error: error.message,
        stack: error.stack
      });

      // Update log entry with failure
      if (logEntry) {
        await logEntry.update({
          status: 'failed',
          errorMessage: error.message,
          executionTimeMs: executionTime,
          completedAt: new Date()
        });
      }

      throw error;
    }
  }

  /**
   * Validate scraped data
   */
  validateData(data) {
    const required = ['title', 'url'];
    for (const field of required) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    return true;
  }

  /**
   * Add random delay between requests
   */
  async addDelay() {
    await randomDelay(1000, 3000);
  }
}

module.exports = BaseScraper;