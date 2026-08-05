# CodeSense AI - Deployment Quick Start

## Docker Deployment (Recommended)

### Prerequisites
- Docker & Docker Compose installed
- GitHub OAuth credentials
- Google OAuth credentials

### Setup

1. **Configure Environment:**

```bash
# Backend
cd backend
cp .env.example .env.production
# Edit .env.production with your credentials

# Return to root
cd ..
```

2. **Run with Docker Compose:**

```bash
# Build and start all services
docker-compose up -d

# Services will be available at:
# Frontend: http://localhost:80
# Backend API: http://localhost:5001
# MongoDB: localhost:27017
```

3. **Verify Services:**

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Test API
curl http://localhost:5001/api/health
```

### Common Docker Commands

```bash
# Stop services
docker-compose down

# Rebuild containers
docker-compose up -d --build

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Execute command in container
docker-compose exec backend npm run seed

# Access MongoDB shell
docker-compose exec mongo mongosh codesense-ai
```

## Manual Deployment on VPS/Server

### Prerequisites
- Node.js 18+
- MongoDB 7+
- Nginx (recommended)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Build (if applicable)
npm run build

# Start with PM2 (process manager)
npm install -g pm2
pm2 start server.js --name "codesense-backend" --env production
pm2 save
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Build production bundle
npm run build

# Serve with Nginx (see nginx.conf template)
sudo cp nginx.conf /etc/nginx/sites-available/codesense
sudo ln -s /etc/nginx/sites-available/codesense /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Nginx Configuration (Manual)

Save as `/etc/nginx/sites-available/codesense`:

```nginx
upstream backend {
    server 127.0.0.1:5001;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/codesense/dist;

    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Environment Variables for Production

**Backend (.env.production):**
```
NODE_ENV=production
PORT=5001
BACKEND_URL=https://your-domain.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/codesense-ai
JWT_ACCESS_SECRET=<strong-random-key>
JWT_REFRESH_SECRET=<strong-random-key>
GEMINI_API_KEY=<your-api-key>
FRONTEND_URL=https://your-domain.com
GITHUB_CLIENT_ID=<your-github-id>
GITHUB_CLIENT_SECRET=<your-github-secret>
GITHUB_CALLBACK_URL=https://your-domain.com/api/auth/github/callback
GOOGLE_CLIENT_ID=<your-google-id>
GOOGLE_CLIENT_SECRET=<your-google-secret>
GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback
```

## Health Checks

### Backend Health
```bash
curl http://your-domain.com/api/health
```

### MongoDB Connection
```bash
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/codesense-ai"
```

## Scaling

### Horizontal Scaling (Multiple Backends)

Use load balancer (HAProxy, Nginx):

```nginx
upstream backend_cluster {
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
    server 127.0.0.1:5003;
}
```

### Database Replication

Use MongoDB Atlas replica sets for automatic failover.

## Monitoring & Logging

### Enable Backend Logging
```bash
# Install Winston or Morgan for logging
npm install winston

# Logs stored in backend/logs/
```

### Monitor with PM2
```bash
pm2 monit
pm2 logs
```

### Docker Logs
```bash
docker-compose logs --tail=100 -f backend
```

## Backup Strategy

### MongoDB Backup
```bash
# Backup
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net" --out ./backup

# Restore
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net" ./backup
```

### Automated Backups
Set up cron job:
```bash
0 2 * * * mongodump --uri "mongodb+srv://..." --out /backups/$(date +\%Y\%m\%d)
```

## SSL/TLS Certificates

### Let's Encrypt (Free)
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com
sudo certbot renew --dry-run  # Test auto-renewal
```

## Troubleshooting

**500 Internal Server Error:**
- Check backend logs
- Verify MongoDB connection
- Check API configuration

**CORS Errors:**
- Update FRONTEND_URL in backend
- Verify CORS configuration

**OAuth Issues:**
- Verify callback URLs match exactly
- Check credentials in .env.production

**Performance Issues:**
- Monitor database queries
- Enable caching headers
- Use CDN for static assets

## Production Checklist

- [ ] Use HTTPS/SSL certificates
- [ ] Set NODE_ENV=production
- [ ] Use strong JWT secrets
- [ ] Enable MongoDB authentication
- [ ] Configure rate limiting
- [ ] Set up automated backups
- [ ] Enable error monitoring
- [ ] Configure CDN for static files
- [ ] Set up log aggregation
- [ ] Configure health checks
- [ ] Test OAuth flows
- [ ] Set up monitoring alerts

## Support

For detailed deployment options, see `DEPLOYMENT.md` in project root.
