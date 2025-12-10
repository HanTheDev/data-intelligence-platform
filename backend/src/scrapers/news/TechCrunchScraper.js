const cheerio = require('cheerio');
const BaseScraper = require('../BaseScraper');
const { safeRequest, cleanText } = require('../../utils/scraperHelpers');
const { ScrapedData } = require('../../models');
const logger = require('../../config/logger');

class TechCrunchScraper extends BaseScraper {
  constructor(config) {
    super(config);
    this.dataType = 'article';
  }

  async scrape() {
    try {
      const response = await safeRequest(this.targetUrl);
      const $ = cheerio.load(response.data);
      const articles = [];

      // TechCrunch article selector
      $('article.post-block').each((index, element) => {
        if (index >= (this.options.maxArticles || 20)) return false;

        try {
          const $article = $(element);

          const title = cleanText($article.find('h2.post-block__title').text());
          const description = cleanText($article.find('.post-block__content').text());
          const url = $article.find('a.post-block__title__link').attr('href');
          const imageUrl = $article.find('img').attr('src');
          const author = cleanText($article.find('.river-byline__authors').text());
          const date = $article.find('time').attr('datetime');

          if (title && url) {
            articles.push({
              title,
              description,
              url,
              imageUrl,
              metadata: {
                author,
                publishedDate: date,
                source: 'techcrunch'
              }
            });
          }

        } catch (error) {
          logger.warn('Error parsing article', { error: error.message });
        }
      });

      await this.saveArticles(articles);
      logger.info(`Scraped ${articles.length} articles from TechCrunch`);

      return articles;

    } catch (error) {
      logger.error('Failed to scrape TechCrunch', { error: error.message });
      throw error;
    }
  }

  async saveArticles(articles) {
    for (const article of articles) {
      try {
        const externalId = this.generateExternalId(article.url);

        await ScrapedData.upsert({
          scraperConfigId: this.scraperConfigId,
          dataType: this.dataType,
          externalId,
          title: article.title,
          description: article.description,
          url: article.url,
          imageUrl: article.imageUrl,
          metadata: article.metadata,
          scrapedAt: new Date()
        });

      } catch (error) {
        logger.error('Error saving article', {
          article: article.title,
          error: error.message
        });
      }
    }
  }

  generateExternalId(url) {
    const match = url.match(/\/(\d{4}\/\d{2}\/\d{2}\/[^\/]+)/);
    return match ? `tc-${match[1]}` : url.substring(url.length - 50);
  }
}

module.exports = TechCrunchScraper;