const request = require('supertest');
const express = require('express');
const routes = require('../../src/routes');
const { ScraperConfig, User } = require('../../src/models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use('/api', routes);

let authToken;
let testUser;

beforeEach(async () => {
  // Create test user
  const passwordHash = await bcrypt.hash('password123', 10);
  testUser = await User.create({
    email: 'test@example.com',
    passwordHash,
    fullName: 'Test User'
  });

  // Generate auth token
  authToken = jwt.sign(
    { userId: testUser.id, email: testUser.email },
    process.env.JWT_SECRET || 'test-secret'
  );
});

describe('Scraper API', () => {
  describe('GET /api/scrapers', () => {
    test('should return empty array when no scrapers exist', async () => {
      const response = await request(app)
        .get('/api/scrapers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    test('should return list of scrapers', async () => {
      await ScraperConfig.create({
        name: 'Test Scraper',
        scraperType: 'ecommerce',
        targetUrl: 'https://example.com'
      });

      const response = await request(app)
        .get('/api/scrapers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Test Scraper');
    });

    test('should require authentication', async () => {
      const response = await request(app).get('/api/scrapers');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/scrapers', () => {
    test('should create a new scraper', async () => {
      const scraperData = {
        name: 'New Scraper',
        scraperType: 'ecommerce',
        targetUrl: 'https://example.com/products',
        scheduleCron: '0 */6 * * *',
        isActive: true
      };

      const response = await request(app)
        .post('/api/scrapers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(scraperData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Scraper');
      expect(response.body.data.id).toBeDefined();
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/scrapers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test'
          // missing scraperType and targetUrl
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/scrapers/:id', () => {
    test('should update scraper', async () => {
      const scraper = await ScraperConfig.create({
        name: 'Test Scraper',
        scraperType: 'ecommerce',
        targetUrl: 'https://example.com'
      });

      const response = await request(app)
        .put(`/api/scrapers/${scraper.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Scraper',
          scraperType: 'ecommerce',
          targetUrl: 'https://example.com',
          isActive: false
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Scraper');
      expect(response.body.data.isActive).toBe(false);
    });

    test('should return 404 for non-existent scraper', async () => {
      const response = await request(app)
        .put('/api/scrapers/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated',
          scraperType: 'ecommerce',
          targetUrl: 'https://example.com'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/scrapers/:id', () => {
    test('should delete scraper', async () => {
      const scraper = await ScraperConfig.create({
        name: 'Test Scraper',
        scraperType: 'ecommerce',
        targetUrl: 'https://example.com'
      });

      const response = await request(app)
        .delete(`/api/scrapers/${scraper.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify deletion
      const deletedScraper = await ScraperConfig.findByPk(scraper.id);
      expect(deletedScraper).toBeNull();
    });
  });
});