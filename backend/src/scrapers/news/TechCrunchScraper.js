const puppeteer = require('puppeteer'); // Switch to Puppeteer
const BaseScraper = require('../BaseScraper');
const { cleanText, delay } = require('../../utils/scraperHelpers');
const { ScrapedData } = require('../../models');
const logger = require('../../config/logger');

class TechCrunchScraper extends BaseScraper {
  constructor(config) {
    super(config);
    this.dataType = 'article';
  }

  async scrape() {
    let browser;

    try {
      // Use Puppeteer for reliable scraping
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      await page.goto(this.targetUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for content
      await delay(2000);

      // Extract articles
      const articles = await page.evaluate(() => {
        const articles = [];

        // Method 1: Look for article elements
        const articleSelectors = [
          'article',
          '[class*="article"]',
          '[class*="post-"]',
          '[class*="story"]',
          'div[class*="post"]',
          'div[class*="article"]',
          'div[class*="content"]'
        ];

        let articleElements = [];
        for (const selector of articleSelectors) {
          const elements = Array.from(document.querySelectorAll(selector));
          if (elements.length > 5) { // Likely real articles
            articleElements = elements;
            break;
          }
        }

        // Method 2: Look for article links
        if (articleElements.length === 0) {
          const articleLinks = Array.from(document.querySelectorAll('a[href*="techcrunch.com/"]'));
          articleLinks.forEach(link => {
            const href = link.href;
            // Check if it's an article link (has date pattern)
            if (href.match(/\/\d{4}\/\d{2}\/\d{2}\//)) {
              // Find parent article container
              let parent = link;
              for (let i = 0; i < 5; i++) {
                parent = parent.parentElement;
                if (parent && (parent.tagName === 'ARTICLE' || parent.tagName === 'DIV')) {
                  if (!articleElements.includes(parent)) {
                    articleElements.push(parent);
                  }
                  break;
                }
              }
            }
          });
        }

        // Extract data from articles
        articleElements.forEach(element => {
          try {
            // Find title
            let title = '';
            const heading = element.querySelector('h2, h3, h4') ||
              element.querySelector('[class*="title"]') ||
              element.querySelector('[class*="headline"]');

            if (heading) {
              title = heading.innerText.trim();
            }

            // Find link
            let url = '';
            const link = element.querySelector('a[href*="techcrunch.com/"]');
            if (link) {
              url = link.href;
            }

            // Find description/excerpt
            let description = '';
            const excerpt = element.querySelector('p') ||
              element.querySelector('[class*="excerpt"]') ||
              element.querySelector('[class*="summary"]');

            if (excerpt) {
              description = excerpt.innerText.trim();
            }

            // Find image
            let imageUrl = '';
            const img = element.querySelector('img');
            if (img) {
              imageUrl = img.src || img.getAttribute('data-src') || '';
            }

            // Find author
            let author = '';
            const authorElement = element.querySelector('[class*="author"]') ||
              element.querySelector('[class*="byline"]') ||
              element.querySelector('[class*="writer"]');

            if (authorElement) {
              author = authorElement.innerText.trim();
            }

            // Find date
            let date = '';
            const dateElement = element.querySelector('time') ||
              element.querySelector('[class*="date"]') ||
              element.querySelector('[class*="time"]');

            if (dateElement) {
              date = dateElement.innerText.trim() || dateElement.getAttribute('datetime');
            }

            // Filter and add article
            if (title && url && title.length > 10) {
              articles.push({
                title: title.substring(0, 200),
                description: description.substring(0, 300),
                url,
                imageUrl,
                author,
                date
              });
            }

          } catch (error) {
            console.error('Error extracting article:', error);
          }
        });

        // Remove duplicates
        const uniqueArticles = [];
        const seenUrls = new Set();

        articles.forEach(article => {
          if (article.url && !seenUrls.has(article.url)) {
            seenUrls.add(article.url);
            uniqueArticles.push(article);
          }
        });

        return uniqueArticles.slice(0, 20); // Limit to 20 articles
      });

      await page.close();

      logger.info(`Found ${articles.length} articles from TechCrunch`);

      // Save to database
      await this.saveArticles(articles);

      return articles;

    } finally {
      if (browser) {
        await browser.close();
      }
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
          metadata: {
            author: cleanText(article.author),
            publishedDate: article.date,
            source: 'techcrunch'
          },
          scrapedAt: new Date()
        });

      } catch (error) {
        logger.error('Error saving article', {
          article: article.title,
          error: error.name + ': ' + error.message,
          details: error.errors ? error.errors.map(e => ({ field: e.path, msg: e.message })) : 'No details'
        });
      }
    }
  }

  generateExternalId(url) {
    // Extract slug from TechCrunch URL
    const match = url.match(/techcrunch\.com\/(.+)/);
    if (match) {
      // Remove query parameters and hash
      const path = match[1].split('?')[0].split('#')[0];
      return `tc-${path.replace(/\//g, '-')}`;
    }
    return `tc-${Date.now()}`;
  }
}

module.exports = TechCrunchScraper;