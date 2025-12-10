const TokopediaScraper = require('./ecommerce/TokopediaScraper');
const GlintsScraper = require('./jobs/GlintsScraper');
const TechCrunchScraper = require('./news/TechCrunchScraper');
const logger = require('../config/logger');

class ScraperFactory {
  static createScraper(config) {
    const { scraperType, targetUrl } = config;

    // Determine scraper based on type and URL
    if (scraperType === 'ecommerce') {
      if (targetUrl.includes('tokopedia.com')) {
        return new TokopediaScraper(config);
      }
      // Add more ecommerce scrapers here
    }

    if (scraperType === 'jobs') {
      if (targetUrl.includes('glints.com')) {
        return new GlintsScraper(config);
      }
      // Add more job scrapers here
    }

    if (scraperType === 'news') {
      if (targetUrl.includes('techcrunch.com')) {
        return new TechCrunchScraper(config);
      }
      // Add more news scrapers here
    }

    logger.error(`No scraper found for type: ${scraperType}, URL: ${targetUrl}`);
    throw new Error(`Unsupported scraper configuration`);
  }
}

module.exports = ScraperFactory;