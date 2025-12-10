-- Drop existing tables if they exist
DROP TABLE IF EXISTS scraping_logs CASCADE;
DROP TABLE IF EXISTS scraped_data CASCADE;
DROP TABLE IF EXISTS scraper_configs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (for authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scraper configurations
CREATE TABLE scraper_configs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    scraper_type VARCHAR(50) NOT NULL, -- 'ecommerce', 'jobs', 'news'
    target_url TEXT NOT NULL,
    schedule_cron VARCHAR(100), -- e.g., '0 */6 * * *' for every 6 hours
    is_active BOOLEAN DEFAULT true,
    config_json JSONB, -- Additional configuration
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scraped data storage
CREATE TABLE scraped_data (
    id SERIAL PRIMARY KEY,
    scraper_config_id INTEGER REFERENCES scraper_configs(id) ON DELETE CASCADE,
    data_type VARCHAR(50) NOT NULL, -- 'product', 'job', 'article'
    external_id VARCHAR(255), -- ID from the source website
    title TEXT,
    description TEXT,
    price DECIMAL(10, 2),
    currency VARCHAR(10),
    url TEXT,
    image_url TEXT,
    metadata JSONB, -- Additional flexible data
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(scraper_config_id, external_id)
);

-- Scraping logs for monitoring
CREATE TABLE scraping_logs (
    id SERIAL PRIMARY KEY,
    scraper_config_id INTEGER REFERENCES scraper_configs(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- 'success', 'failed', 'partial'
    items_scraped INTEGER DEFAULT 0,
    error_message TEXT,
    execution_time_ms INTEGER,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_scraped_data_scraper_config ON scraped_data(scraper_config_id);
CREATE INDEX idx_scraped_data_type ON scraped_data(data_type);
CREATE INDEX idx_scraped_data_scraped_at ON scraped_data(scraped_at);
CREATE INDEX idx_scraping_logs_config ON scraping_logs(scraper_config_id);
CREATE INDEX idx_scraping_logs_status ON scraping_logs(status);
CREATE INDEX idx_scraper_configs_active ON scraper_configs(is_active);