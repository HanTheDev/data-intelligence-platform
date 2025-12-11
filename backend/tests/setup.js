const { sequelize } = require('../src/config/database');

// Setup before all tests
beforeAll(async () => {
  // Use test database
  process.env.NODE_ENV = 'test';
  process.env.DB_NAME = 'data_intelligence_test';
  
  // Connect and sync database
  await sequelize.sync({ force: true });
});

// Cleanup after all tests
afterAll(async () => {
  await sequelize.close();
});

// Clear database between tests
afterEach(async () => {
  const models = Object.values(sequelize.models);
  for (const model of models) {
    await model.destroy({ where: {}, force: true });
  }
});