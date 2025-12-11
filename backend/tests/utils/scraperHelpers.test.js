const {
  cleanText,
  extractPrice,
  isValidUrl,
  delay
} = require('../../src/utils/scraperHelpers');

describe('Scraper Helpers', () => {
  describe('cleanText', () => {
    test('should remove extra whitespace', () => {
      expect(cleanText('  Hello   World  ')).toBe('Hello World');
    });

    test('should handle newlines', () => {
      expect(cleanText('Hello\n\nWorld')).toBe('Hello World');
    });

    test('should return empty string for null', () => {
      expect(cleanText(null)).toBe('');
    });
  });

  describe('extractPrice', () => {
    test('should extract price from IDR format', () => {
      expect(extractPrice('Rp 1.500.000')).toBe(1500000);
    });

    test('should extract price from USD format', () => {
      expect(extractPrice('$1,500.99')).toBe(1500.99);
    });

    test('should return null for invalid price', () => {
      expect(extractPrice('invalid')).toBeNull();
    });
  });

  describe('isValidUrl', () => {
    test('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com/path')).toBe(true);
    });

    test('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('delay', () => {
    test('should delay execution', async () => {
      const start = Date.now();
      await delay(100);
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(100);
    });
  });
});