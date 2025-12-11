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
        let browser;
        
        try {
            // Launch browser
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const jobs = await this.scrapeJobs(browser);
            await this.saveJobs(jobs);

            return jobs;

        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    async scrapeJobs(browser) {
        const page = await browser.newPage();

        // Set realistic user agent
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        // Navigate to jobs page
        await page.goto(this.targetUrl, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // Wait for content to load - use more flexible selectors
        const selectors = [
            '[data-cy="job-card"]',
            '.JobSearchCard',
            '.job-card',
            '.opportunity-card',
            'article',
            'div[class*="job"]',
            'div[class*="Job"]'
        ];

        let foundSelector = null;
        for (const selector of selectors) {
            try {
                await page.waitForSelector(selector, { timeout: 5000 });
                foundSelector = selector;
                logger.info(`Found jobs using selector: ${selector}`);
                break;
            } catch (error) {
                // Try next selector
            }
        }

        if (!foundSelector) {
            // If no specific selector works, wait for some content
            await page.waitForFunction(() => {
                return document.body.innerText.includes('Full-time') || 
                       document.body.innerText.includes('Remote') ||
                       document.querySelector('a[href*="/opportunities/jobs/"]') !== null;
            }, { timeout: 10000 });
        }

        // Scroll to load more jobs
        await this.autoScroll(page);

        // Extract job data
        const jobs = await page.evaluate(() => {
            const jobs = [];
            
            // Method 1: Look for job cards by specific selectors
            const selectors = [
                '[data-cy="job-card"]',
                '.JobSearchCard',
                '.job-card',
                '.opportunity-card',
                'article[class*="job"]',
                'div[class*="job-card"]'
            ];
            
            let jobElements = [];
            for (const selector of selectors) {
                jobElements = Array.from(document.querySelectorAll(selector));
                if (jobElements.length > 0) break;
            }
            
            // Method 2: If no specific selectors, look for job links
            if (jobElements.length === 0) {
                const jobLinks = Array.from(document.querySelectorAll('a[href*="/opportunities/jobs/"]'));
                jobLinks.forEach(link => {
                    // Find parent container that might be the job card
                    let parent = link;
                    for (let i = 0; i < 5; i++) { // Go up 5 levels
                        parent = parent.parentElement;
                        if (parent && (parent.tagName === 'DIV' || parent.tagName === 'ARTICLE' || parent.tagName === 'LI')) {
                            if (!jobElements.includes(parent)) {
                                jobElements.push(parent);
                            }
                            break;
                        }
                    }
                });
            }
            
            // Method 3: Look for elements containing job-like text
            if (jobElements.length === 0) {
                const allDivs = Array.from(document.querySelectorAll('div, article, li'));
                allDivs.forEach(element => {
                    const text = element.innerText || '';
                    const hasJobKeywords = text.includes('Full-time') || 
                                          text.includes('Part-time') || 
                                          text.includes('Remote') ||
                                          text.includes('Salary') ||
                                          text.includes('Experience') ||
                                          (text.includes('requirements') && text.length > 50);
                    
                    if (hasJobKeywords && text.length > 100 && text.length < 2000) {
                        jobElements.push(element);
                    }
                });
            }
            
            // Extract data from job elements
            jobElements.forEach(element => {
                try {
                    const text = element.innerText || '';
                    const lines = text.split('\n').filter(line => line.trim());
                    
                    // Find job link
                    const linkElement = element.querySelector('a[href*="/opportunities/jobs/"]') || element.querySelector('a');
                    const url = linkElement ? linkElement.href : '';
                    
                    // Extract job title (usually the longest line that's not a company name)
                    let title = '';
                    const titleCandidates = lines.filter(line => {
                        const trimmed = line.trim();
                        return trimmed.length > 10 && 
                               trimmed.length < 100 &&
                               !trimmed.includes('Full-time') &&
                               !trimmed.includes('Part-time') &&
                               !trimmed.includes('Remote') &&
                               !trimmed.includes('Salary') &&
                               !trimmed.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/); // Not just "John Doe"
                    });
                    
                    if (titleCandidates.length > 0) {
                        titleCandidates.sort((a, b) => b.length - a.length);
                        title = titleCandidates[0];
                    }
                    
                    // Extract company name (look for proper noun patterns)
                    let company = '';
                    lines.forEach(line => {
                        const trimmed = line.trim();
                        if (trimmed.length > 2 && trimmed.length < 30 && 
                            trimmed[0] === trimmed[0].toUpperCase() &&
                            !trimmed.includes('Full-time') &&
                            !trimmed.includes('Part-time') &&
                            !trimmed.includes('Remote') &&
                            trimmed !== title) {
                            company = trimmed;
                        }
                    });
                    
                    // Extract location
                    let location = '';
                    const locationKeywords = ['Jakarta', 'Surabaya', 'Bandung', 'Remote', 'Hybrid', 'On-site'];
                    lines.forEach(line => {
                        const trimmed = line.trim();
                        locationKeywords.forEach(keyword => {
                            if (trimmed.includes(keyword) && !location) {
                                location = trimmed;
                            }
                        });
                    });
                    
                    // Extract job type
                    let jobType = '';
                    lines.forEach(line => {
                        const trimmed = line.trim();
                        if (trimmed.includes('Full-time') || trimmed.includes('Part-time') || trimmed.includes('Contract')) {
                            jobType = trimmed;
                        }
                    });
                    
                    // Extract salary if present
                    let salary = '';
                    lines.forEach(line => {
                        const trimmed = line.trim();
                        if (trimmed.includes('Rp') || trimmed.includes('IDR') || trimmed.includes('Salary')) {
                            salary = trimmed;
                        }
                    });
                    
                    // Extract logo/image
                    const imgElement = element.querySelector('img');
                    const logo = imgElement ? imgElement.src : '';
                    
                    if (title && url) {
                        jobs.push({
                            title,
                            company,
                            location,
                            salary,
                            jobType,
                            url,
                            logo
                        });
                    }
                    
                } catch (error) {
                    console.error('Error extracting job:', error);
                }
            });
            
            return jobs;
        });

        await page.close();
        
        logger.info(`Found ${jobs.length} jobs from Glints`);
        return jobs;
    }

    async autoScroll(page) {
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 300;
                const timer = setInterval(() => {
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    
                    // Stop after 2000px or reaching bottom
                    if (totalHeight >= 2000 || totalHeight >= document.body.scrollHeight) {
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
                    description: `${job.company || ''} - ${job.location || ''} - ${job.jobType || ''}`.trim(),
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
        const match = url.match(/\/jobs\/(\d+)/) || url.match(/\/(\d+)$/);
        return match ? `glints-${match[1]}` : `glints-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

module.exports = GlintsScraper;