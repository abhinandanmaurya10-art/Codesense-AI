# CodeSense AI - Frontend

React + TypeScript frontend for AI-powered code review platform.

## Features

- **Modern UI** - Built with Radix UI components and Tailwind CSS
- **Routing** - TanStack Router for client-side routing
- **Authentication** - JWT token management with OAuth support
- **Code Review** - Interactive code editor and review workspace
- **Responsive Design** - Mobile-friendly interface
- **Type Safe** - Full TypeScript coverage

## Technology Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite 7.x
- **Routing**: TanStack Router 1.x
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **HTTP Client**: Fetch API with custom wrapper
- **Icons**: Lucide React

## Installation

```bash
# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

## Environment Variables

See `.env.example` for template.

**Required:**
- `VITE_API_BASE_URL` - Backend API base URL (for local dev `http://localhost:5001/api`; for Vercel same-project deployment use `/api` or `https://your-project.vercel.app/api`)

## Project Structure

```
src/
├── components/      # React components
│   ├── ui/         # Radix UI component wrappers
│   ├── site-header.tsx
│   ├── dashboard-shell.tsx
│   ├── review-workspace.tsx
│   └── ...
├── routes/         # Page components and routing
│   ├── __root.tsx
│   ├── index.tsx
│   ├── login.tsx
│   ├── dashboard.tsx
│   ├── review.tsx
│   └── auth/
├── lib/            # Utilities and API clients
│   ├── api.ts      # HTTP client
│   ├── auth.ts     # Auth utilities
│   ├── review.ts   # Review API
│   └── utils.ts
├── hooks/          # Custom React hooks
├── router.tsx      # Router configuration
└── styles.css      # Global styles
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server on localhost:5173

# Build
npm run build        # Build for production
npm run build:dev    # Build in development mode

# Preview & Testing
npm preview          # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## Component Architecture

### Layout Components
- `SiteHeader` - Navigation and user menu
- `DashboardShell` - Main app layout with sidebar

### Feature Components
- `ReviewWorkspace` - Code review interface
- `CodeReviewDemo` - Demo/preview component
- `GithubLoginButton` - GitHub OAuth button
- `GoogleLoginButton` - Google OAuth button

### Page Routes
- `/` - Home page
- `/login` - Login page
- `/dashboard` - User dashboard
- `/review` - Code review page
- `/history` - Review history
- `/settings` - User settings

## Authentication Flow

```
Login Page
   ↓
Email/Password or OAuth
   ↓
Backend Authentication
   ↓
JWT Token Generation
   ↓
Store Token in localStorage
   ↓
Redirect to Dashboard
```

## API Integration

All API calls go through `lib/api.ts` which handles:
- Base URL configuration
- Authentication headers
- Error handling
- Request/response transformation

Example usage:
```typescript
import { createReview } from '@/lib/review';

const result = await createReview({
  code: '...',
  language: 'javascript',
  title: 'My Review'
});
```

## Styling

- **Tailwind CSS** for utility styles
- **CSS Variables** for theme customization
- **Radix UI** for unstyled components
- Mobile-first responsive design

## Type Safety

- Full TypeScript coverage
- Type definitions for API responses
- Strict mode enabled
- Component prop validation

## Development Workflow

1. Create feature branch
2. Develop in `npm run dev`
3. Test responsive design
4. Run `npm run lint` and `npm run format`
5. Build with `npm run build`
6. Commit and push

## Production Build

```bash
# Build optimized bundle
npm run build

# Output is in dist/ folder
# Serve with: npx serve dist

# Or use Nginx/Apache to serve
```

## Performance Optimization

- Code splitting via Vite
- Lazy loading with React.lazy
- Image optimization
- CSS minification
- Tree-shaking unused code

## Browser Support

- Chrome/Edge latest 2 versions
- Firefox latest 2 versions
- Safari 14+
- Mobile browsers

## Troubleshooting

**API Connection Issues:**
- Verify `VITE_API_BASE_URL` in `.env`
- Check backend is running on correct port
- Check CORS configuration in backend

**Authentication Issues:**
- Clear localStorage and cookies
- Check token expiration
- Verify OAuth credentials in backend

**Build Issues:**
- Clear `node_modules` and reinstall
- Check Node version is 18+
- Clear Vite cache: `rm -rf .vite`

## Deployment

See `DEPLOYMENT.md` for production deployment guide.

## Support

For issues and questions, refer to the main project documentation.
