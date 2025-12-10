const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ScrapedData = sequelize.define('ScrapedData', {
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
        dataType: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'data_type'
        },
        externalId: {
            type: DataTypes.STRING,
            field: 'external_id'
        },
        title: {
            type: DataTypes.TEXT
        },
        description: {
            type: DataTypes.TEXT
        },
        price: {
            type: DataTypes.DECIMAL(10, 2)
        },
        currency: {
            type: DataTypes.STRING
        },
        url: {
            type: DataTypes.TEXT
        },
        imageUrl: {
            type: DataTypes.TEXT,
            field: 'image_url'
        },
        metadata: {
            type: DataTypes.JSONB
        },
        scrapedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'scraped_at'
        }
    }, {
        tableName: 'scraped_data',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return ScrapedData;
};