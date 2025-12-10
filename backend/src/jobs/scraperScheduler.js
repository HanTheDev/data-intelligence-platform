const cron = require('node-cron');
const { ScraperConfig } = require('../models');
const ScraperFactory = require('../scrapers/ScraperFactory');
const logger = require('../config/logger');

class ScraperScheduler {
    constructor() {
        this.jobs = new Map();
    }

    /**
     * Initialize all scheduled scrapers
     */
    async initializeSchedules() {
        try {
            const scrapers = await ScraperConfig.findAll({
                where: { isActive: true }
            });

            logger.info(`Initializing ${scrapers.length} scheduled scrapers`);

            for (const scraper of scrapers) {
                if (scraper.scheduleCron) {
                    this.scheduleJob(scraper);
                }
            }

            logger.info('All scraper schedules initialized');
        } catch (error) {
            logger.error('Failed to initialize scraper schedules', {
                error: error.message
            });
        }
    }

    /**
     * Schedule a single scraper job
     */
    scheduleJob(config) {
        try {
            // Validate cron expression
            if (!cron.validate(config.scheduleCron)) {
                logger.error(`Invalid cron expression for scraper: ${config.name}`, {
                    cron: config.scheduleCron
                });
                return;
            }

            // Cancel existing job if it exists
            if (this.jobs.has(config.id)) {
                this.cancelJob(config.id)
            }
            // Create new scheduled job
            const job = cron.schedule(config.scheduleCron, async () => {
                logger.info(`Executing scheduled scraper: ${config.name}`, {
                    scraperId: config.id
                });

                try {
                    const scraper = ScraperFactory.createScraper(config);
                    await scraper.execute();

                    // Update last run time
                    await config.update({
                        lastRunAt: new Date(),
                        nextRunAt: this.calculateNextRun(config.scheduleCron)
                    });

                } catch (error) {
                    logger.error(`Scheduled scraper failed: ${config.name}`, {
                        scraperId: config.id,
                        error: error.message
                    });
                }
            });

            this.jobs.set(config.id, job);

            logger.info(`Scheduled scraper: ${config.name}`, {
                scraperId: config.id,
                schedule: config.scheduleCron
            });

        } catch (error) {
            logger.error(`Failed to schedule scraper: ${config.name}`, {
                error: error.message
            });
        }
    }
    /**
    
    Cancel a scheduled job
    */
    cancelJob(scraperId) {
        const job = this.jobs.get(scraperId);
        if (job) {
            job.stop();
            this.jobs.delete(scraperId);
            logger.info('Cancelled scheduled job', { scraperId });
        }
    }

    /**
    
    Reschedule a job (cancel and recreate)
    */
    async rescheduleJob(scraperId) {
        try {
            const config = await ScraperConfig.findByPk(scraperId);
            if (!config) {
                logger.error('Scraper not found for rescheduling', { scraperId });
                return;
            }
            this.cancelJob(scraperId);
            if (config.isActive && config.scheduleCron) {
                this.scheduleJob(config);
            }
        } catch (error) {
            logger.error('Failed to reschedule job', {
                scraperId,
                error: error.message
            });
        }
    }

    /**
    
    Calculate next run time based on cron expression
    */
    calculateNextRun(cronExpression) {
        // Simple calculation - in production, use a library like cron-parser
        const now = new Date();

        // Parse cron: minute hour day month dayOfWeek
        const parts = cronExpression.split(' ');

        // For simplicity, add 1 hour as estimate
        // In real implementation, use proper cron parser
        const nextRun = new Date(now.getTime() + 60 * 60 * 1000);

        return nextRun;
    }
    /**
    
    Stop all jobs
    */
    stopAll() {
        this.jobs.forEach((job, scraperId) => {
            job.stop();
            logger.info('Stopped scheduled job', { scraperId });
        });
        this.jobs.clear();
    }

    /**
    
    Get status of all scheduled jobs
    */
    getStatus() {
        return Array.from(this.jobs.keys()).map(scraperId => ({
            scraperId,
            isRunning: true
        }));
    }
}

// Create singleton instance
const scheduler = new ScraperScheduler();
module.exports = scheduler;