const puppeteer = require('puppeteer');
const BaseScraper = require('../BaseScraper');
const { cleanText, delay } = require('../../utils/scraperHelpers');
const { ScrapedData } = require('../../models');
const logger = require('../../config/logger');

class GlintsScraper extends BaseScraper {
    constructor(config) {
        super(config);
        this.dataType = 'job';
        this.browser = null;
    }

    async scrape() {
        try {
            // Launch browser
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const jobs = await this.scrapeJobs();
            await this.saveJobs(jobs);

            return jobs;

        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }

    async scrapeJobs() {
        const page = await this.browser.newPage();

        // Set user agent
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        );

        // Navigate to jobs page
        await page.goto(this.targetUrl, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for job listings to load
        await page.waitForSelector('.JobCard', { timeout: 10000 });

        // Scroll to load more jobs
        await this.autoScroll(page);

        // Extract job data
        const jobs = await page.evaluate(() => {
            const jobCards = Array.from(document.querySelectorAll('.JobCard'));
            return jobCards.map(card => {
                const title = card.querySelector('.JobCard__title')?.textContent?.trim();
                const company = card.querySelector('.CompanyCard__name')?.textContent?.trim();
                const location = card.querySelector('.JobCard__location')?.textContent?.trim();
                const salary = card.querySelector('.JobCard__salary')?.textContent?.trim();
                const jobType = card.querySelector('.JobCard__type')?.textContent?.trim();
                const url = card.querySelector('a')?.href;
                const logo = card.querySelector('.CompanyCard__logo img')?.src;

                return {
                    title,
                    company,
                    location,
                    salary,
                    jobType,
                    url,
                    logo
                };
            }).filter(job => job.title && job.url);
        });

        logger.info(`Found ${jobs.length} jobs from Glints`);
        return jobs;
    }
    async autoScroll(page) {
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if (totalHeight >= scrollHeight || totalHeight >= 3000) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });

        await delay(2000);
    }
    async saveJobs(jobs) {
        for (const job of jobs) {
            try {
                const externalId = this.generateExternalId(job.url);
                await ScrapedData.upsert({
                    scraperConfigId: this.scraperConfigId,
                    dataType: this.dataType,
                    externalId,
                    title: job.title,
                    description: `${job.company} - ${job.location}`,
                    url: job.url,
                    imageUrl: job.logo,
                    metadata: {
                        company: job.company,
                        location: job.location,
                        salary: job.salary,
                        jobType: job.jobType,
                        source: 'glints'
                    },
                    scrapedAt: new Date()
                });

            } catch (error) {
                logger.error('Error saving job', {
                    job: job.title,
                    error: error.message
                });
            }
        }
    }
    generateExternalId(url) {
        const match = url.match(/\/(\d+)$/);
        return match ? `glints-${match[1]}` : url.substring(url.length - 50);
    }
}
module.exports = GlintsScraper;