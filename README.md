# CodeSense AI - AI-Powered Code Review Platform

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node Version](https://img.shields.io/badge/node-18%2B-green)

An intelligent, AI-powered code review platform that leverages Google Gemini to provide automated, detailed code feedback and suggestions.

## Features

✨ **AI-Powered Reviews** - Google Gemini-powered code analysis  
🔐 **Secure Authentication** - JWT + OAuth2 (GitHub, Google)  
📝 **Multiple Input Methods** - Textarea, file upload, code marking  
🎨 **Modern UI** - React + TypeScript + Tailwind CSS  
🚀 **Production Ready** - Docker, rate limiting, input validation  
📊 **Code Dashboard** - Review history, statistics, analytics  
🌐 **Multi-Language Support** - JavaScript, Python, Java, C++, SQL, and more  

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone <repository-url>
cd CodeSense-AI-Powered-Code-Review-Platform

# Configure backend
cd backend
cp .env.example .env.production
# Edit .env.production with your OAuth credentials

# Run with Docker Compose
cd ..
docker-compose up -d

# Access at http://localhost
```

### Option 2: Development Setup

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
npm run dev  # http://localhost:5001
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev  # http://localhost:5173
```

## Project Structure

```
.
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── middleware/     # Express middleware
│   └── package.json
│
├── frontend/                # React + TypeScript
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── routes/         # Page routes
│   │   ├── lib/            # API clients
│   │   └── styles.css
│   └── package.json
│
├── docker-compose.yml      # Docker configuration
├── DEPLOYMENT.md           # Detailed deployment guide
└── DEPLOY_QUICK_START.md  # Quick deployment guide
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: Passport.js, JWT
- **AI**: Google Gemini API
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build**: Vite 7
- **Routing**: TanStack Router
- **UI**: Radix UI + Tailwind CSS
- **Forms**: React Hook Form

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB 7+ (local or Atlas)
- OAuth credentials:
  - [GitHub OAuth App](https://github.com/settings/developers)
  - [Google OAuth 2.0](https://console.cloud.google.com)

## Environment Configuration

### Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` with:
- MongoDB connection string
- Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
- OAuth credentials (GitHub & Google)
- JWT secrets

### Frontend Setup

```bash
cd frontend
cp .env.example .env
```

Set `VITE_API_BASE_URL` to your backend URL.

## OAuth Setup

### GitHub OAuth
1. Go to https://github.com/settings/developers
2. Create new OAuth App
3. Set Authorization callback URL to your backend callback URL, for example `https://your-backend-domain.com/api/auth/github/callback`
4. Copy Client ID & Secret to `.env`

### Google OAuth
1. Go to https://console.cloud.google.com
2. Create OAuth 2.0 credentials (Web Application)
3. Add redirect URI to your backend callback URL, for example `https://your-backend-domain.com/api/auth/google/callback`
4. Copy Client ID & Secret to `.env`

For detailed setup, see [OAUTH_SETUP.md](OAUTH_SETUP.md).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/github` - GitHub OAuth
- `GET /api/auth/google` - Google OAuth

### Code Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews` - List reviews
- `GET /api/reviews/:id` - Get review
- `DELETE /api/reviews/:id` - Delete review

### Dashboard
- `GET /api/dashboard/stats` - User statistics
- `GET /api/dashboard/recent` - Recent reviews

For complete API documentation, see [backend/README.md](backend/README.md).

## Development

### Install Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Run Development Servers
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3 (optional): Seed database
cd backend && npm run seed
```

### Code Quality
```bash
# Frontend linting
cd frontend && npm run lint && npm run format
```

## Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Production Deployment
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed options:
- Traditional VPS/EC2
- Vercel Monorepo
- DigitalOcean App Platform

## Production Checklist

- [ ] Configure production `.env` files
- [ ] Set strong JWT secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure MongoDB authentication
- [ ] Update OAuth callback URLs
- [ ] Set up automated backups
- [ ] Configure rate limiting
- [ ] Enable error monitoring
- [ ] Set up logging
- [ ] Configure CDN for static assets

## Security

- ✅ Passwords hashed with bcryptjs
- ✅ JWT tokens with expiration
- ✅ OAuth CSRF protection
- ✅ Input validation & sanitization
- ✅ CORS restricted to frontend
- ✅ Security headers via Helmet
- ✅ Rate limiting on API routes
- ✅ MongoDB injection protection

## Performance

- Code-split bundles with Vite
- Database indexes on key fields
- Connection pooling
- API rate limiting
- Gzip compression
- Static asset caching

## Troubleshooting

### Connection Issues
```bash
# Test MongoDB
mongosh "mongodb://localhost:27017/codesense-ai"

# Test API
curl http://localhost:5001/api/health
```

### OAuth Errors
- Verify callback URLs match exactly in OAuth apps
- Check `BACKEND_URL` and `FRONTEND_URL` in `.env`
- Ensure credentials are correct

### Build Issues
- Clear node_modules: `rm -rf node_modules`
- Reinstall: `npm install`
- Clear cache: `npm cache clean --force`

## Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## Documentation

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Quick Start Deploy](DEPLOY_QUICK_START.md)
- [OAuth Setup](OAUTH_SETUP.md)

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or suggestions:
- Check existing documentation
- Review GitHub issues
- Create detailed bug reports

## Roadmap

- [ ] Advanced code metrics
- [ ] Team collaboration features
- [ ] Code quality standards
- [ ] IDE extensions (VSCode, JetBrains)
- [ ] API rate analytics
- [ ] Custom review templates
- [ ] Slack/Teams integration

---

**Built with ❤️ for developers by developers**

Last Updated: August 2026
