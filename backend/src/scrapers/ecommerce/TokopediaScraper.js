const puppeteer = require('puppeteer');
const BaseScraper = require('../BaseScraper');
const { cleanText, extractPrice, delay } = require('../../utils/scraperHelpers');
const { ScrapedData } = require('../../models');
const logger = require('../../config/logger');

class TokopediaScraper extends BaseScraper {
  constructor(config) {
    super(config);
    this.dataType = 'product';
  }

  async scrape() {
    let browser;
    
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--window-size=1920,1080'
        ]
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
      });

      const maxPages = this.options.maxPages || 1;
      const allProducts = [];

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          const url = `${this.targetUrl}&page=${pageNum}`;
          logger.info(`Scraping page ${pageNum}: ${url}`);
          
          await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 60000 
          });

          // Wait for products
          await page.waitForSelector('div.css-5wh65g', { timeout: 15000 });
          
          // Scroll to load more
          await this.autoScroll(page);
          await delay(2000);

          // Extract products
          const pageProducts = await page.evaluate(() => {
            const products = [];
            const containers = document.querySelectorAll('div.css-5wh65g');
            
            containers.forEach(container => {
              try {
                const allText = container.innerText || '';
                const lines = allText.split('\n').filter(line => line.trim());
                
                // Get URL
                const link = container.querySelector('a');
                const url = link ? link.href : '';
                
                // Extract data using pattern matching
                let title = '';
                let price = '';
                let rating = '';
                let sold = '';
                let shop = '';
                let location = '';
                
                lines.forEach(line => {
                  const trimmed = line.trim();
                  
                  // Price
                  if (trimmed.startsWith('Rp') && trimmed.length < 20 && !price) {
                    price = trimmed;
                  }
                  
                  // Rating
                  else if (trimmed.match(/^\d+\.?\d*$/) && !rating) {
                    rating = trimmed;
                  }
                  
                  // Sold
                  else if (trimmed.includes('terjual') && !sold) {
                    sold = trimmed;
                  }
                  
                  // Shop/Location (short non-numeric text)
                  else if (trimmed.length > 2 && trimmed.length < 30 && 
                           !trimmed.startsWith('Rp') && 
                           !trimmed.match(/^\d+\.?\d*$/) &&
                           !trimmed.includes('terjual')) {
                    
                    if (!shop) {
                      shop = trimmed;
                    } else if (!location && trimmed !== shop) {
                      location = trimmed;
                    }
                  }
                });
                
                // Title: longest line that's not already categorized
                const titleCandidates = lines.filter(line => {
                  const trimmed = line.trim();
                  return trimmed.length > 30 && 
                         trimmed !== price &&
                         trimmed !== rating &&
                         trimmed !== sold &&
                         trimmed !== shop &&
                         trimmed !== location &&
                         !trimmed.startsWith('Rp') &&
                         !trimmed.match(/^\d+\.?\d*$/);
                });
                
                if (titleCandidates.length > 0) {
                  titleCandidates.sort((a, b) => b.length - a.length);
                  title = titleCandidates[0];
                }
                
                // Image
                const img = container.querySelector('img');
                const imageUrl = img ? img.src : '';
                
                if (title && url) {
                  products.push({
                    title,
                    priceText: price,
                    url,
                    imageUrl,
                    rating,
                    sold,
                    shop,
                    location
                  });
                }
                
              } catch (error) {
                console.error('Error parsing product:', error);
              }
            });
            
            return products;
          });
          
          allProducts.push(...pageProducts);
          logger.info(`Found ${pageProducts.length} products on page ${pageNum}`);
          
          if (pageNum < maxPages) {
            await delay(3000);
          }
          
        } catch (error) {
          logger.error(`Error on page ${pageNum}:`, { error: error.message });
        }
      }
      
      await page.close();
      
      // Save to database
      await this.saveProducts(allProducts);
      
      return allProducts;
      
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async autoScroll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 300;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          
          if (totalHeight >= 1500) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }

  async saveProducts(products) {
    let savedCount = 0;
    
    for (const product of products) {
      try {
        const price = extractPrice(product.priceText);
        const externalId = this.generateExternalId(product.url);
        
        await ScrapedData.upsert({
          scraperConfigId: this.scraperConfigId,
          dataType: this.dataType,
          externalId,
          title: cleanText(product.title),
          price: price,
          currency: 'IDR',
          url: product.url,
          imageUrl: product.imageUrl,
          metadata: {
            rating: cleanText(product.rating),
            sold: cleanText(product.sold),
            shop: cleanText(product.shop),
            location: cleanText(product.location),
            source: 'tokopedia'
          },
          scrapedAt: new Date()
        });
        
        savedCount++;
        
        if (savedCount <= 3) {
          logger.debug(`Saved: ${cleanText(product.title).substring(0, 40)}...`);
        }
        
      } catch (error) {
        logger.error('Error saving product', {
          title: product.title,
          error: error.message
        });
      }
    }
    
    logger.info(`Saved ${savedCount} products to database`);
  }

  generateExternalId(url) {
    if (!url) return `tokopedia-${Date.now()}`;
    
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const match = pathname.match(/\/([^\/?]+)(?:\?|$)/);
      return match ? `tokopedia-${match[1]}` : `tokopedia-${Date.now()}`;
    } catch (error) {
      return `tokopedia-${Date.now()}`;
    }
  }
}

module.exports = TokopediaScraper;