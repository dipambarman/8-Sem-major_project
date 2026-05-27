# Smart Canteen Backend — Railway Deployment Guide

This guide covers deploying the Smart Canteen backend to **Railway**, which fully supports WebSockets (Socket.IO), persistent processes, and PostgreSQL.

## Why Railway (not Vercel)?

- ✅ **WebSocket support** — Socket.IO works out of the box
- ✅ **Persistent server** — runs as a long-lived Node.js process (not serverless)
- ✅ **Built-in PostgreSQL** — optional, or use your existing Supabase DB
- ✅ **Free tier available** — $5/month free credits (no credit card needed for trial)

## Prerequisites

- [Railway account](https://railway.app) (sign up with GitHub)
- GitHub repository with your backend code pushed
- Node.js 18+ locally

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
cd backend
git add .
git commit -m "chore: prepare backend for Railway deployment"
git push
```

### 2. Create a Railway Project

1. Go to [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub Repo"**
3. Select your repository
4. Railway will auto-detect it as a Node.js project

### 3. Configure Environment Variables

In your Railway project dashboard, go to **Variables** tab and add:

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres.utrrpysg...` | Your Supabase pooler URL |
| `DIRECT_URL` | `postgresql://postgres.utrrpysg...` | Your Supabase direct URL |
| `JWT_SECRET` | `<strong-random-string>` | Use a long random string |
| `RAZORPAY_KEY_ID` | `rzp_test_...` or `rzp_live_...` | Your Razorpay key |
| `RAZORPAY_KEY_SECRET` | `<your-secret>` | Your Razorpay secret |
| `NODE_ENV` | `production` | |
| `PORT` | `3000` | Railway injects its own PORT, this is a fallback |
| `FRONTEND_URL` | `*` | Or your specific frontend URL for CORS |
| `LOG_LEVEL` | `info` | |

### 4. Set the Start Command

Railway auto-detects `npm start`, which runs `node server.js`. This is already configured in your `package.json`.

If needed, you can override it in Railway settings:
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 5. Deploy

Railway auto-deploys when you push to your GitHub repo. You can also trigger a manual deploy from the dashboard.

### 6. Run Prisma Migrations

After the first deploy, run migrations against your production database:

```bash
# Locally, with your production DATABASE_URL
DATABASE_URL="your_production_db_url" npx prisma migrate deploy
```

Or use Railway's CLI:
```bash
npm install -g @railway/cli
railway login
railway run npx prisma migrate deploy
```

### 7. Get Your Production URL

After deployment, Railway gives you a URL like:
```
https://smart-canteen-backend-production.up.railway.app
```

You can also set a custom domain in the Railway dashboard under **Settings > Networking > Public Networking**.

### 8. Update Mobile App

Update your mobile app's `.env`:
```
EXPO_PUBLIC_API_URL=https://your-railway-url.up.railway.app
```

## Testing the Deployment

```bash
# Health check
curl https://your-railway-url.up.railway.app/health

# Should return:
# { "success": true, "message": "Smart Canteen API is running", ... }
```

## Alternative: Render

[Render](https://render.com) is another great option with similar features:

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Set:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables (same as above)
5. Render gives you a URL like `https://smart-canteen-backend.onrender.com`

> **Note**: Render's free tier spins down after 15 min of inactivity (cold starts ~30s). Railway's free tier stays running.

## Troubleshooting

### Socket.IO not connecting
- Ensure `FRONTEND_URL` is set correctly (or `*` for all origins)
- Check that the mobile app points to the Railway/Render URL (not localhost)

### Database connection errors
- Verify `DATABASE_URL` has `?pgbouncer=true&connect_timeout=30` for Supabase pooler
- Ensure `DIRECT_URL` uses port `5432` (session mode) for migrations

### Build failures
- Check logs in Railway dashboard
- Ensure `prisma generate` runs during `postinstall`
