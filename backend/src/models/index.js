const { sequelize } = require('../config/database');
const fs = require('fs');
const path = require('path');

const basename = path.basename(__filename);
const db = {};

// Read all model files and import them
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize);
    db[model.name] = model;
  });

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Manual associations (since we're not using associate method)
db.ScraperConfig.hasMany(db.ScrapedData, {
  foreignKey: 'scraperConfigId',
  as: 'scrapedData'
});

db.ScrapedData.belongsTo(db.ScraperConfig, {
  foreignKey: 'scraperConfigId',
  as: 'scraperConfig'
});

db.ScraperConfig.hasMany(db.ScrapingLog, {
  foreignKey: 'scraperConfigId',
  as: 'logs'
});

db.ScrapingLog.belongsTo(db.ScraperConfig, {
  foreignKey: 'scraperConfigId',
  as: 'scraperConfig'
});

db.sequelize = sequelize;

module.exports = db;