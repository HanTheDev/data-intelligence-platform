-- Insert sample scraper configurations
INSERT INTO scraper_configs (name, scraper_type, target_url, schedule_cron, is_active, config_json) VALUES
('Tokopedia Phone Prices', 'ecommerce', 'https://www.tokopedia.com/search?q=smartphone', '0 */6 * * *', true, '{"category": "electronics", "max_pages": 3}'),
('Glints Tech Jobs', 'jobs', 'https://glints.com/id/opportunities/jobs/explore', '0 8 * * *', true, '{"job_type": "full-time", "location": "Jakarta"}'),
('TechCrunch Latest', 'news', 'https://techcrunch.com/latest/', '0 */2 * * *', true, '{"max_articles": 20}');

-- Insert sample user (password: 'admin123' - hashed with bcrypt)
INSERT INTO users (email, password_hash, full_name) VALUES
('admin@example.com', '$2b$10$rQZ5GJZ5GJZ5GJZ5GJZ5GJZ5GJZ5GJZ5GJZ5GJZ5GJZ5GJZ5G', 'Admin User');