# CodeSense AI - Deployment Guide

## Project Structure

```
codesense-ai/
├── backend/              # Node.js Express API
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Request handlers
│   │   ├── models/      # MongoDB schemas
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Express middleware
│   │   └── utils/       # Utility functions
│   ├── .env.example     # Example environment variables
│   ├── .env.production  # Production template
│   └── package.json
│
├── frontend/            # React + TypeScript frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── routes/      # Page routes
│   │   ├── lib/         # API clients & utilities
│   │   └── styles.css
│   ├── .env.example
│   ├── .env.production
│   └── vite.config.ts
│
└── Documentation files
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local or Atlas)
- OAuth App Credentials (GitHub & Google)

## Environment Setup

### 1. Backend Configuration

```bash
cd backend
cp .env.example .env.production
```

Edit `.env.production` with:
- Production MongoDB URI (MongoDB Atlas)
- Strong JWT secrets
- Production OAuth credentials
- Production URLs

### 2. Frontend Configuration

```bash
cd frontend
cp .env.example .env.production
```

Update with production API URL.

### 3. OAuth Setup

**GitHub OAuth:**
1. Go to https://github.com/settings/developers
2. Create OAuth App with callback: `https://your-domain.com/api/auth/github/callback`
3. Save Client ID & Secret to `.env.production`

**Google OAuth:**
1. Go to https://console.cloud.google.com
2. Create OAuth 2.0 credentials (Web Application)
3. Add authorized redirect URI: `https://your-domain.com/api/auth/google/callback`
4. Save Client ID & Secret to `.env.production`

## Deployment Steps

### Option 1: Traditional Server (VPS/AWS EC2)

**Backend:**
```bash
cd backend
npm install
npm run build  # if applicable
NODE_ENV=production npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
# Serve dist/ folder with Nginx/Apache
```

**Nginx Configuration Example:**
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Frontend
    location / {
        root /var/www/frontend/dist;
        try_files $uri /index.html;
    }
}
```

### Option 2: Docker (Recommended)

**Dockerfile - Backend:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/src ./src
ENV NODE_ENV=production
EXPOSE 5001
CMD ["npm", "start"]
```

**Dockerfile - Frontend:**
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
      - PORT=5001
    env_file: backend/.env.production
    depends_on:
      - mongo
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
  
  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=codesense-ai

volumes:
  mongo_data:
```

### Option 3: Vercel (Frontend) + Heroku (Backend)

**Frontend on Vercel:**
```bash
cd frontend
vercel --prod
```

**Backend on Heroku:**
```bash
cd backend
heroku login
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set --from .env.production
git push heroku main
```

## Production Checklist

- [ ] Remove `.env` with credentials from repository
- [ ] Update OAuth callback URLs to production domain
- [ ] Enable CORS for production frontend URL only
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets (generate with `crypto.randomBytes(32).toString('hex')`)
- [ ] Enable HTTPS everywhere
- [ ] Set secure cookies (`secure: true, sameSite: 'strict'`)
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for all secrets
- [ ] Test OAuth flows with real credentials
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure CDN for static assets
- [ ] Set up CORS headers properly

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` instead
2. **Rotate secrets regularly** - Change JWT secrets quarterly
3. **Use HTTPS only** - Enable SSL/TLS certificates
4. **Database authentication** - Always use username/password
5. **Rate limiting** - Configured in `backend/src/middleware/rateLimit.js`
6. **Input validation** - Enforced via Zod schemas
7. **CORS policies** - Restricted to production frontend URL
8. **Helmet.js** - Security headers configured
9. **MongoDB Sanitization** - Prevents NoSQL injection
10. **Passport.js** - Secure OAuth implementation

## Monitoring & Maintenance

- Monitor error logs
- Track API response times
- Monitor database performance
- Set up alerting for high error rates
- Regular security updates for dependencies
- Review access logs monthly

## Troubleshooting

**MongoDB Connection Issues:**
```bash
# Test connection
mongosh "mongodb+srv://user:pass@cluster.mongodb.net"
```

**CORS Errors:**
- Verify `FRONTEND_URL` in backend .env
- Check browser console for exact error
- Update allowed origins in `backend/src/app.js`

**OAuth Callback Fails:**
- Verify callback URL matches exactly in OAuth apps
- Check `BACKEND_URL` configuration
- Ensure cookies are allowed

**Port Already in Use:**
```bash
# Find process using port 5001
lsof -i :5001
# Kill process
kill -9 <PID>
```

## Support & Documentation

- OAuth Setup: See `OAUTH_SETUP.md`
- API Documentation: See `backend/README.md`
