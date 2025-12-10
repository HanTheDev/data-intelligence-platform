const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ScraperConfig = sequelize.define('ScraperConfig', {
    // ScraperConfig model definition
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    scraperType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'scraper_type'
    },
    targetUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'target_url'
    },
    scheduleCron: {
      type: DataTypes.STRING,
      field: 'schedule_cron'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    configJson: {
      type: DataTypes.JSONB,
      field: 'config_json'
    },
    lastRunAt: {
      type: DataTypes.DATE,
      field: 'last_run_at'
    },
    nextRunAt: {
      type: DataTypes.DATE,
      field: 'next_run_at'
    }
  }, {
    tableName: 'scraper_configs',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return ScraperConfig;
};