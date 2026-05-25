# Smart Canteen Backend - Deployment Guide

This guide covers deploying the Smart Canteen backend to Vercel with PostgreSQL database.

## Prerequisites

- Vercel account (https://vercel.com)
- PostgreSQL database (we recommend Supabase or Railway for ease of setup)
- GitHub repository (for Vercel integration)

## Setup Steps

### 1. Prepare Your Repository

Ensure your backend code is pushed to GitHub:

```bash
git add .
git commit -m "feat: prepare backend for Vercel deployment"
git push origin main
```

### 2. Set Up PostgreSQL Database

#### Option A: Using Supabase (Recommended)

1. Go to https://supabase.com and sign up
2. Create a new project
3. Go to Settings → Database → Connection string
4. Copy the connection string (PostgreSQL format)
5. Save it somewhere safe - you'll need it for Vercel

#### Option B: Using Railway

1. Go to https://railway.app and sign up
2. Create a new PostgreSQL database
3. Copy the database connection string
4. Save it somewhere safe

#### Option C: Using Vercel Postgres

1. Create a Vercel account
2. Go to your dashboard and add a Postgres database
3. Copy the connection string

### 3. Deploy to Vercel

#### Method 1: Using Vercel CLI

```bash
npm install -g vercel
cd 8-Sem-major_project/backend
vercel
```

Follow the prompts and add environment variables when asked.

#### Method 2: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Select the `8-Sem-major_project/backend` directory as the root
5. Add environment variables (see below)
6. Click Deploy

### 4. Configure Environment Variables on Vercel

Add the following environment variables in Vercel Dashboard:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_PROVIDER` | `postgresql` | Database type for production |
| `DATABASE_URL` | Your PostgreSQL connection string | From Supabase/Railway |
| `NODE_ENV` | `production` | Production environment |
| `JWT_SECRET` | Generate a strong random string | Use `openssl rand -base64 32` |
| `RAZORPAY_KEY_ID` | Your Razorpay live key | Get from Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | Your Razorpay live secret | Get from Razorpay dashboard |
| `LOG_LEVEL` | `info` | Logging level |
| `FRONTEND_URL` | Your frontend URL | e.g., `https://your-frontend.vercel.app` |

### 5. Run Database Migrations

After deployment, run migrations:

```bash
# Using Vercel CLI
vercel exec "npm run prisma:deploy"
```

Or add a custom build script:

1. Create `migrate.sh` in the backend directory:

```bash
#!/bin/bash
npm run prisma:deploy
```

2. Update `vercel.json`:

```json
{
  "buildCommand": "npm run prisma:generate && npm run prisma:deploy"
}
```

### 6. Update Frontend Configuration

Update your frontend to use the new Vercel backend URL:

In `8-Sem-major_project/mobile/src/services/api/authApi.ts`:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  'https://your-backend.vercel.app';
```

Update `.env` in the mobile directory:

```
REACT_APP_API_URL=https://your-backend.vercel.app
```

## Common Issues & Troubleshooting

### CORS Errors

If you get CORS errors:

1. Ensure `FRONTEND_URL` environment variable is set correctly on Vercel
2. Verify your frontend URL is accessible
3. Check that your request includes proper headers

### Database Connection Issues

If you get database connection errors:

```bash
# Check connection string format
# Should be: postgresql://user:password@host:port/database?sslmode=require

# Test connection locally first:
DATABASE_URL="your_connection_string" npm run prisma:deploy
```

### Prisma Generation Timeout

If Prisma generation times out:

1. Increase function timeout in `vercel.json` to 60s
2. Pre-generate Prisma client locally and commit `node_modules/.prisma`

### Socket.io Not Working

Note: Real-time socket connections don't work well with Vercel's serverless functions. For real-time features:

- Use polling instead
- Use a dedicated WebSocket service (e.g., Railway, Render)
- Use Supabase Realtime

## Environment Variable Template

Copy `.env.example` to `.env` locally and fill in values:

```bash
cp .env.example .env
```

## Monitoring & Logs

View deployment logs on Vercel Dashboard:

1. Go to your project on Vercel
2. Click "Deployments"
3. Click the latest deployment
4. View logs in real-time

## Rollback

To rollback to a previous deployment:

1. Go to Vercel Dashboard
2. Find the deployment you want to restore
3. Click the three dots menu
4. Select "Promote to Production"

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Vercel Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Supabase Setup Guide](https://supabase.com/docs/guides/getting-started)
- [Railway Deployment](https://docs.railway.app/)

## Support

For deployment issues:

1. Check Vercel logs
2. Test database connection locally
3. Verify all environment variables are set
4. Check frontend FRONTEND_URL configuration
