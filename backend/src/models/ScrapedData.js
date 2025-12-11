const { DataTypes, Op } = require('sequelize');

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
            allowNull: true,  // Explicitly allow null if not always present
            field: 'external_id'
        },
        title: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true  // Key change: allow null for non-ecommerce data
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: true  // Key change: allow null for non-ecommerce data
        },
        url: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        imageUrl: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'image_url'
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        scrapedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
            field: 'scraped_at'
        }
    }, {
        tableName: 'scraped_data',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            {
                unique: true,
                fields: ['scraper_config_id', 'external_id'],
                where: { external_id: { [Op.ne]: null } },
                name: 'scraped_data_scraper_external_unique'
            }
        ]
    });

    return ScrapedData;
};