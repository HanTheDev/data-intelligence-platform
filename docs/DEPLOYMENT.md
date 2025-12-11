# Deployment Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Git

## Option 1: Docker Deployment (Recommended)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd data-intelligence-platform
```

### 2. Set environment variables
Create `.env` file in root:
```
JWT_SECRET=your-super-secret-jwt-key-here
```

### 3. Build and run with Docker Compose
```bash
docker-compose up -d
```

### 4. Access the application
- Frontend: http://localhost
- Backend API: http://localhost:5000

## Option 2: Railway Deployment

### Backend Deployment

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your backend repository

3. **Add PostgreSQL**
   - In your project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically set DATABASE_URL

4. **Set Environment Variables**
```
   NODE_ENV=production
   JWT_SECRET=your-secret-key
   PORT=5000
   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
   PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

5. **Deploy**
   - Railway will automatically deploy on git push
   - Note your backend URL (e.g., https://your-app.railway.app)

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
```bash
   npm install -g vercel
```

2. **Update Frontend Config**
   In `frontend/.env.production`:
```
   VITE_API_BASE_URL=https://your-backend.railway.app/api
```

3. **Deploy to Vercel**
```bash
   cd frontend
   vercel
```

4. **Configure Vercel**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## Option 3: Manual VPS Deployment

### Server Setup (Ubuntu 22.04)

1. **Update system**
```bash
   sudo apt update && sudo apt upgrade -y
```

2. **Install Node.js**
```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
```

3. **Install PostgreSQL**
```bash
   sudo apt install -y postgresql postgresql-contrib
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
```

4. **Install Nginx**
```bash
   sudo apt install -y nginx
   sudo systemctl start nginx
   sudo systemctl enable nginx
```

5. **Install PM2**
```bash
   sudo npm install -g pm2
```

### Database Setup
```bash
sudo -u postgres psql
CREATE DATABASE data_intelligence;
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE data_intelligence TO your_user;
\q
```

### Backend Deployment

1. **Clone repository**
```bash
   cd /var/www
   git clone <your-repo-url>
   cd data-intelligence-platform/backend
```

2. **Install dependencies**
```bash
   npm ci --production
```

3. **Create .env file**
```bash
   nano .env
```
   Add your environment variables

4. **Run database migrations**
```bash
   npm run migrate
```

5. **Start with PM2**
```bash
   pm2 start src/server.js --name data-intelligence-api
   pm2 save
   pm2 startup
```

### Frontend Deployment

1. **Build frontend**
```bash
   cd /var/www/data-intelligence-platform/frontend
   npm ci
   npm run build
```

2. **Configure Nginx**
```bash
   sudo nano /etc/nginx/sites-available/data-intelligence
```

   Add configuration:
```nginx
   server {
       listen 80;
       server_name your-domain.com;

       root /var/www/data-intelligence-platform/frontend/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
```

3. **Enable site**
```bash
   sudo ln -s /etc/nginx/sites-available/data-intelligence /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
```

4. **Setup SSL with Certbot (Optional)**
```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
```

## Environment Variables Reference

### Backend
```
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=data_intelligence
DB_USER=your_user
DB_PASSWORD=your_password
JWT_SECRET=your-super-secret-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
USER_AGENT=Mozilla/5.0...
SCRAPING_DELAY_MS=2000
MAX_RETRIES=3
LOG_LEVEL=info
```

### Frontend
```
VITE_API_BASE_URL=https://your-api-url.com/api
```

## Monitoring

### View PM2 Logs
```bash
pm2 logs data-intelligence-api
```

### View Nginx Logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Monitor Application
```bash
pm2 monit
```

## Troubleshooting

### Backend won't start
1. Check logs: `pm2 logs`
2. Verify database connection
3. Check environment variables
4. Ensure port 5000 is available

### Frontend shows API errors
1. Verify VITE_API_BASE_URL is correct
2. Check CORS settings in backend
3. Verify backend is running

### Scraping fails
1. Check if Chromium is installed
2. Verify PUPPETEER environment variables
3. Check memory limits (Puppeteer needs ~512MB)

## Backup

### Database Backup
```bash
pg_dump -U your_user data_intelligence > backup.sql
```

### Restore Database
```bash
psql -U your_user data_intelligence < backup.sql
```