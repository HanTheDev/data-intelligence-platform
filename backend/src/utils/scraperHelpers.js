const axios = require('axios');
const logger = require('../config/logger');

/**
 * Delay execution for specified milliseconds
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate random delay to mimic human behavior
 */
const randomDelay = (min = 1000, max = 3000) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(ms);
};

/**
 * Retry function with exponential backoff
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delayMs = baseDelay * Math.pow(2, i);
      logger.warn(`Retry ${i + 1}/${maxRetries} after ${delayMs}ms`, {
        error: error.message
      });
      await delay(delayMs);
    }
  }
};

/**
 * Get random user agent
 */
const getRandomUserAgent = () => {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

/**
 * Clean and normalize text
 */
const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();
};

/**
 * Extract price from string
 */
const extractPrice = (priceString) => {
  if (!priceString) return null;
  
  const cleaned = priceString.replace(/[^\d.,]/g, '');
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  const price = parseFloat(normalized);
  
  return isNaN(price) ? null : price;
};

/**
 * Safe axios GET request with error handling
 */
const safeRequest = async (url, options = {}) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...options.headers
      },
      timeout: options.timeout || 30000,
      ...options
    });
    return response;
  } catch (error) {
    logger.error('Request failed', {
      url,
      error: error.message,
      status: error.response?.status
    });
    throw error;
  }
};

/**
 * Check if URL is valid
 */
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

module.exports = {
  delay,
  randomDelay,
  retryWithBackoff,
  getRandomUserAgent,
  cleanText,
  extractPrice,
  safeRequest,
  isValidUrl
};