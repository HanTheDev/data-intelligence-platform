const cheerio = require('cheerio');
const BaseScraper = require('../BaseScraper');
const { safeRequest, cleanText, extractPrice } = require('../../utils/scraperHelpers');
const { ScrapedData } = require('../../models');
const logger = require('../../config/logger');

class TokopediaScraper extends BaseScraper {
  constructor(config) {
    super(config);
    this.dataType = 'product';
  }

  async scrape() {
    const products = [];
    const maxPages = this.options.maxPages || 3;

    for (let page = 1; page <= maxPages; page++) {
      try {
        logger.info(`Scraping Tokopedia page ${page}/${maxPages}`);
        
        const pageProducts = await this.scrapePage(page);
        products.push(...pageProducts);

        // Save to database
        await this.saveProducts(pageProducts);

        // Delay between pages
        if (page < maxPages) {
          await this.addDelay();
        }

      } catch (error) {
        logger.error(`Error scraping page ${page}`, { error: error.message });
        // Continue with next page even if one fails
      }
    }

    return products;
  }

  async scrapePage(page) {
    const url = `${this.targetUrl}&page=${page}`;
    
    try {
      const response = await safeRequest(url);
      const $ = cheerio.load(response.data);
      const products = [];

      // Tokopedia product cards selector (this may need adjustment based on actual HTML)
      $('.css-5wh65g').each((index, element) => {
        try {
          const $product = $(element);

          // Extract product data
          const title = cleanText($product.find('.css-3um8ox').text());
          const priceText = $product.find('.css-o5uqvq').text();
          const price = extractPrice(priceText);
          const imageUrl = $product.find('img').attr('src');
          const productUrl = $product.find('a').attr('href');
          
          // Extract additional metadata
          const rating = $product.find('.css-t70v7i').text();
          const sold = $product.find('.css-1duhs3e').text();
          const location = $product.find('.css-1kdc32b').text();

          if (title && productUrl) {
            products.push({
              title,
              price,
              currency: 'IDR',
              url: productUrl.startsWith('http') ? productUrl : `https://www.tokopedia.com${productUrl}`,
              imageUrl,
              metadata: {
                rating: cleanText(rating),
                sold: cleanText(sold),
                location: cleanText(location),
                source: 'tokopedia',
                scrapedPage: page
              }
            });
          }

        } catch (error) {
          logger.warn('Error parsing product', { error: error.message });
        }
      });

      logger.info(`Found ${products.length} products on page ${page}`);
      return products;

    } catch (error) {
      logger.error(`Failed to scrape page ${page}`, { error: error.message });
      throw error;
    }
  }

  async saveProducts(products) {
    for (const product of products) {
      try {
        // Generate external ID from URL
        const externalId = this.generateExternalId(product.url);

        await ScrapedData.upsert({
          scraperConfigId: this.scraperConfigId,
          dataType: this.dataType,
          externalId,
          title: product.title,
          price: product.price,
          currency: product.currency,
          url: product.url,
          imageUrl: product.imageUrl,
          metadata: product.metadata,
          scrapedAt: new Date()
        });

      } catch (error) {
        logger.error('Error saving product', {
          product: product.title,
          error: error.message
        });
      }
    }
  }

  generateExternalId(url) {
    // Extract product ID from Tokopedia URL
    const match = url.match(/\/([^\/]+)$/);
    return match ? match[1] : url.substring(url.length - 50);
  }
}

module.exports = TokopediaScraper;