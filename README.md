# Data Intelligence Platform

A production-ready web scraping platform built with Node.js, React, and PostgreSQL. This platform enables automated data collection from multiple sources with scheduling, monitoring, and data management capabilities.

![Dashboard Screenshot](https://drive.google.com/uc?export=view&id=1pJFFPcOx8OXYjT77bANSH8ETFPC6Pq0w)

## 🚀 Features

### Core Functionality
- **Multi-Source Scraping**: Support for e-commerce, job listings, and news articles
- **Automated Scheduling**: Cron-based scheduling for periodic data collection
- **Real-time Monitoring**: Track scraping jobs with detailed execution logs
- **Data Management**: Browse, filter, search, and export collected data
- **RESTful API**: Well-documented API for integration

### Technical Highlights
- **Robust Error Handling**: Retry mechanisms with exponential backoff
- **Rate Limiting**: Built-in request throttling to prevent bans
- **User Agent Rotation**: Mimic human browsing behavior
- **Concurrent Scraping**: Multiple scrapers running simultaneously
- **Data Deduplication**: Automatic detection of duplicate entries
- **Scalable Architecture**: Modular design for easy expansion

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15+
- **ORM**: Sequelize
- **Scraping**: Puppeteer, Cheerio, Axios
- **Scheduling**: node-cron
- **Authentication**: JWT
- **Logging**: Winston

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📋 Prerequisites

- Node.js 18 or higher
- PostgreSQL 15 or higher
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/data-intelligence-platform.git
cd data-intelligence-platform
```

### 2. Database Setup
```bash
# Create database
createdb data_intelligence

# Run schema
psql -d data_intelligence -f database/schema.sql

# (Optional) Seed initial data
psql -d data_intelligence -f database/seeds/initial_scrapers.sql
```

### 3. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Start development server
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📖 Documentation

- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)

## 🏗️ Project Structure
```
data-intelligence-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── scrapers/        # Scraper implementations
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   ├── jobs/            # Scheduled jobs
│   │   └── server.js        # Entry point
│   ├── tests/               # Test files
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Helper functions
│   │   └── App.jsx          # Root component
│   └── package.json
├── database/
│   ├── schema.sql           # Database schema
│   └── seeds/               # Seed data
└── docs/                    # Documentation
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                  # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚢 Deployment

### Docker (Recommended)
```bash
docker-compose up -d
```

### Railway + Vercel
See [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions.

## 📊 Key Features Demo

### 1. Create Scraper Configuration
```javascript
POST /api/scrapers
{
  "name": "Tokopedia Phones",
  "scraperType": "ecommerce",
  "targetUrl": "https://www.tokopedia.com/search?q=smartphone",
  "scheduleCron": "0 */6 * * *",
  "isActive": true
}
```

### 2. Execute Scraper
```javascript
POST /api/scrapers/:id/execute
```

### 3. View Scraped Data
```javascript
GET /api/data?page=1&limit=20&dataType=product
```

## 🎯 Use Cases

1. **E-commerce Price Monitoring**: Track product prices across multiple platforms
2. **Job Market Research**: Aggregate job listings from various sources
3. **News Aggregation**: Collect articles from news websites
4. **Competitive Analysis**: Monitor competitor activities
5. **Market Research**: Gather data for analysis and insights

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- SQL injection prevention (Sequelize ORM)
- XSS protection (React)
- CORS configuration
- Environment variable management

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](docs/CONTRIBUTING.md) before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

👤 Author
Ilhan Firka Najia

GitHub: @HanTheDev

## 🙏 Acknowledgments

Built as a portfolio project for my full-stack engineering skills

Inspired by modern web scraping best practices

Thanks to the open-source community

## 📧 Contact
For questions or feedback, please reach out at hanfirka1@gmail.com

Note: This project is for educational and portfolio purposes. Always respect websites' robots.txt and terms of service when scraping.
