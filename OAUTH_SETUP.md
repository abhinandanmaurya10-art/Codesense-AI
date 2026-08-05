# OAuth Configuration Guide for CodeSense AI

This guide will help you set up GitHub and Google OAuth authentication for the CodeSense AI platform.

## Quick Start

1. Copy `.env.example` to `.env` in the `backend/` directory
2. Add your OAuth credentials (see steps below)
3. Restart the backend server
4. Test login with OAuth buttons on the login page

---

## GitHub OAuth Setup

### Step 1: Create GitHub OAuth Application

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name**: `CodeSense AI`
   - **Homepage URL**: `http://localhost:5173` (or your frontend URL)
   - **Authorization callback URL**: `http://localhost:5001/api/auth/github/callback`
   
   > **Note**: If your backend runs on a different port, update the callback URL accordingly

4. Click "Register application"
5. Copy your credentials:
   - **Client ID** → Set as `GITHUB_CLIENT_ID` in `.env`
   - **Client Secret** → Set as `GITHUB_CLIENT_SECRET` in `.env`

### Step 2: Update Environment Variables

```bash
# In backend/.env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:5001/api/auth/github/callback
```

### Step 3: Test GitHub Login

1. Go to login page: `http://localhost:5173/login`
2. Click "Continue with GitHub" button
3. Authorize the application
4. You should be redirected to the dashboard

---

## Google OAuth Setup

### Step 1: Create Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project:
   - Click project dropdown → New Project
   - Name: `CodeSense AI`
   - Create

3. Enable OAuth 2.0:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - If prompted, configure OAuth consent screen first:
     - User Type: External
     - Fill in required fields (app name, user support email, etc.)
     - Scopes: Add `openid`, `profile`, `email`

4. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: `CodeSense AI Web`
   - Authorized JavaScript origins:
     ```
     http://localhost:5173
     http://localhost
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:5001/api/auth/google/callback
     ```
   - Click "Create"

5. Copy your credentials:
   - **Client ID** → Set as `GOOGLE_CLIENT_ID` in `.env`
   - **Client Secret** → Set as `GOOGLE_CLIENT_SECRET` in `.env`

### Step 2: Update Environment Variables

```bash
# In backend/.env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
```

### Step 3: Test Google Login

1. Go to login page: `http://localhost:5173/login`
2. Click "Continue with Google" button
3. Sign in with your Google account
4. Allow permissions
5. You should be redirected to the dashboard

---

## Troubleshooting

### Error: "OAuth is not configured"
**Solution**: Make sure your `.env` file has all required variables and the backend server has been restarted.

### Error: "Invalid OAuth state" or "Redirect URI mismatch"
**Solutions**:
1. Check that the callback URL in your OAuth app settings exactly matches the URL in `.env`
2. Make sure you're using the correct port (default: 5001, check with `PORT` in `.env`)
3. Clear browser cookies and try again

### Error: "Invalid credentials"
**Solution**: Double-check that your Client ID and Client Secret are copied correctly from the OAuth provider

### Google login not working
**Solutions**:
1. Verify the OAuth consent screen is configured
2. Make sure your app is not in development mode (add test users if needed)
3. Check that redirect URIs are added to Google Cloud Console

---

## Production Deployment

When deploying to production:

1. Update all URLs from `localhost` to your actual domain:
   ```bash
   FRONTEND_URL=https://yourdomain.com
   GITHUB_CALLBACK_URL=https://yourdomain.com/api/auth/github/callback
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
   ```

2. Update OAuth app settings:
   - GitHub: Update Authorization callback URL
   - Google: Update Authorized JavaScript origins and redirect URIs

3. Set `NODE_ENV=production`

---

## Features Implemented

✅ GitHub OAuth 2.0 authentication
✅ Google OAuth 2.0 authentication (Gmail login)
✅ Automatic user registration on first login
✅ Profile data sync (avatar, display name)
✅ Session tokens and refresh tokens
✅ CSRF protection with state tokens

---

## User Data Stored

When a user logs in via OAuth, the following data is stored:

**GitHub Login:**
- GitHub ID
- Username
- Display name
- Email
- Avatar URL
- Provider: `github`

**Google Login:**
- Google ID
- Display name
- Email
- Avatar URL
- Provider: `google`

All data is stored securely in MongoDB with password hashing for any local accounts.
