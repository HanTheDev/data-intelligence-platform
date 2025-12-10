const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ScrapingLog = sequelize.define('ScrapingLog', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        scraperConfigId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'scraper_config_id'
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        itemsScraped: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'items_scraped'
        },
        errorMessage: {
            type: DataTypes.TEXT,
            field: 'error_message'
        },
        executionTimeMs: {
            type: DataTypes.INTEGER,
            field: 'execution_time_ms'
        },
        startedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'started_at'
        },
        completedAt: {
            type: DataTypes.DATE,
            field: 'completed_at'
        }
    }, {
        tableName: 'scraping_logs',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return ScrapingLog;
};