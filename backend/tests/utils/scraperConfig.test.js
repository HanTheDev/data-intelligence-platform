const { ScraperConfig } = require('../../src/models');

describe('ScraperConfig Model', () => {
  test('should create a scraper config', async () => {
    const scraper = await ScraperConfig.create({
      name: 'Test Scraper',
      scraperType: 'ecommerce',
      targetUrl: 'https://example.com',
      isActive: true
    });

    expect(scraper.id).toBeDefined();
    expect(scraper.name).toBe('Test Scraper');
    expect(scraper.scraperType).toBe('ecommerce');
  });

  test('should require name', async () => {
    await expect(
      ScraperConfig.create({
        scraperType: 'ecommerce',
        targetUrl: 'https://example.com'
      })
    ).rejects.toThrow();
  });

  test('should require scraperType', async () => {
    await expect(
      ScraperConfig.create({
        name: 'Test Scraper',
        targetUrl: 'https://example.com'
      })
    ).rejects.toThrow();
  });

  test('should set default isActive to true', async () => {
    const scraper = await ScraperConfig.create({
      name: 'Test Scraper',
      scraperType: 'ecommerce',
      targetUrl: 'https://example.com'
    });

    expect(scraper.isActive).toBe(true);
  });
});