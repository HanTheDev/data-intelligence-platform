require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection successful!');
    
    // Test query
    const [results] = await sequelize.query('SELECT NOW()');
    console.log('✓ Database query successful:', results);
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();