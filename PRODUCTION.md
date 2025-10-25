# Production Deployment Recommendations

This document outlines recommendations for deploying VenueGenie to production.

## Security Enhancements

### 1. Rate Limiting

**Issue**: API endpoints lack rate limiting (identified by CodeQL)

**Solution**: Add express-rate-limit middleware

```bash
npm install express-rate-limit --save
```

**Implementation** (backend/server.js):

```javascript
const rateLimit = require('express-rate-limit');

// Create rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply to all API routes
app.use('/api/', apiLimiter);

// Stricter limit for emergency reports
const emergencyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit to 5 emergency reports per minute
});

app.post('/api/report', emergencyLimiter, ...);
```

### 2. Environment Variables

**Required for Production:**

```env
# Production Configuration
NODE_ENV=production
PORT=5000

# Database (Required in production)
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=venuegenie

# API Keys
GEMINI_API_KEY=your-production-api-key

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Session Secret (if using sessions)
SESSION_SECRET=your-random-secure-secret-key
```

### 3. CORS Configuration

Update `backend/server.js` for production:

```javascript
const cors = require('cors');

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 4. Helmet for Security Headers

```bash
npm install helmet --save
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 5. Input Validation

Add validation middleware using express-validator:

```bash
npm install express-validator --save
```

```javascript
const { body, validationResult } = require('express-validator');

router.post('/api/report',
  body('type').isIn(['fire', 'medical', 'security', 'evacuation', 'other']),
  body('description').trim().isLength({ min: 10, max: 500 }),
  body('location').trim().isLength({ min: 3, max: 255 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // ... rest of handler
  }
);
```

## Database

### 1. MySQL Setup

**Production Database Configuration:**

```sql
-- Create production user with limited privileges
CREATE USER 'venuegenie_prod'@'%' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT, UPDATE ON venuegenie.* TO 'venuegenie_prod'@'%';
FLUSH PRIVILEGES;

-- Create indexes for performance
ALTER TABLE alerts ADD INDEX idx_status_timestamp (status, timestamp);
ALTER TABLE events ADD INDEX idx_venue_start_time (venue_id, start_time);
```

### 2. Connection Pooling

Update `backend/config/database.js`:

```javascript
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};
```

## Frontend Build

### 1. Build for Production

```bash
cd frontend
npm run build
```

### 2. Serve from Backend

Update `backend/server.js`:

```javascript
if (process.env.NODE_ENV === 'production') {
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}
```

### 3. Environment Variables for Frontend

Create `.env.production` in frontend:

```env
REACT_APP_API_URL=https://api.yourdomain.com
```

## Logging

### 1. Install Winston

```bash
npm install winston --save
```

### 2. Setup Logger

Create `backend/utils/logger.js`:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
```

## Monitoring & Health Checks

### 1. Enhanced Health Check

```javascript
app.get('/api/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'ok',
    database: 'disconnected',
    memory: process.memoryUsage()
  };
  
  try {
    await db.execute('SELECT 1');
    health.database = 'connected';
  } catch (error) {
    health.database = 'error';
  }
  
  res.json(health);
});
```

### 2. Process Management with PM2

```bash
npm install pm2 -g
```

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'venuegenie-backend',
    script: './backend/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

Start with:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Deployment

### 1. Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

EXPOSE 5000

CMD ["node", "backend/server.js"]
```

### 2. Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: venuegenie
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    
  backend:
    build: .
    ports:
      - "5000:5000"
    depends_on:
      - mysql
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASSWORD: rootpassword
      DB_NAME: venuegenie
      GEMINI_API_KEY: ${GEMINI_API_KEY}

volumes:
  mysql_data:
```

### 3. Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## SSL/TLS

Use Let's Encrypt with Certbot:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Backup Strategy

### 1. Database Backups

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p venuegenie > backup_$DATE.sql
# Upload to S3 or backup location
```

### 2. Automated Backups with Cron

```bash
0 2 * * * /path/to/backup.sh
```

## Performance Optimization

### 1. Enable Compression

```javascript
const compression = require('compression');
app.use(compression());
```

### 2. Caching

```javascript
const apicache = require('apicache');
let cache = apicache.middleware;

// Cache static data for 1 hour
app.get('/data/venues.json', cache('1 hour'), (req, res) => {
  res.sendFile(path.join(__dirname, '../data/venues.json'));
});
```

## Checklist

Before deploying to production:

- [ ] Set all environment variables
- [ ] Add rate limiting
- [ ] Configure CORS properly
- [ ] Set up database with proper user privileges
- [ ] Enable HTTPS/SSL
- [ ] Add logging and monitoring
- [ ] Set up automated backups
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Test all features in production-like environment
- [ ] Set up CI/CD pipeline
- [ ] Document API endpoints
- [ ] Create incident response plan
- [ ] Set up alerts for critical errors
- [ ] Enable security headers with Helmet
- [ ] Add input validation
- [ ] Test with load testing tools

## Support

For production issues, refer to:
- Application logs: `/var/log/venuegenie/`
- Database logs: Check MySQL error logs
- PM2 logs: `pm2 logs`
- System logs: `journalctl -u venuegenie`
