# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Register

**POST** `/auth/register`

### Request Body:

```
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

### Response:

```
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Login

**POST** `/auth/login`

### Request Body:

```
{
  "email": "user@example.com",
  "password": "password123"
}
```

## Scrapers

### Get All Scrapers

**GET** `/scrapers?page=1&limit=20&isActive=true`

#### Query Parameters

* `page` (optional): Page number
* `limit` (optional): Items per page
* `isActive` (optional): Filter by active status

### Response:

```
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Tokopedia Phones",
      "scraperType": "ecommerce",
      "targetUrl": "https://tokopedia.com/search?q=smartphone",
      "scheduleCron": "0 */6 * * *",
      "isActive": true,
      "lastRunAt": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### Create Scraper

**POST** `/scrapers`

#### Request Body:

```
{
  "name": "New Scraper",
  "scraperType": "ecommerce",
  "targetUrl": "https://example.com",
  "scheduleCron": "0 */6 * * *",
  "isActive": true,
  "configJson": {
    "maxPages": 3
  }
}
```

### Update Scraper

**PUT** `/scrapers/:id`

### Delete Scraper

**DELETE** `/scrapers/:id`

### Execute Scraper

**POST** `/scrapers/:id/execute`

### Get Scraper Logs

**GET** `/scrapers/:id/logs?page=1&limit=20`

## Data

### Get Scraped Data

**GET** `/data?page=1&limit=20&dataType=product&search=phone`

#### Query Parameters:

* `page`: Page number
* `limit`: Items per page
* `dataType`: Filter by type (product, job, article)
* `scraperId`: Filter by scraper ID
* `search`: Search in title/description
* `startDate`: Filter by date range
* `endDate`: Filter by date range

### Get Statistics

**GET** `/data/statistics?days=7`

#### Response:

```
{
  "success": true,
  "data": {
    "totalCount": 1500,
    "byType": [
      { "type": "product", "count": 1000 },
      { "type": "job", "count": 300 },
      { "type": "article", "count": 200 }
    ],
    "byScraper": [...],
    "dailyCounts": [...]
  }
}
```

## Error Responses

All endpoints return errors in the following format:

```
{
  "success": false,
  "error": "Error message here"
}
```

### HTTP Status Codes

* `200`: Success
* `201`: Created
* `400`: Bad Request
* `401`: Unauthorized
* `404`: Not Found
* `409`: Conflict
* `500`: Internal Server Error