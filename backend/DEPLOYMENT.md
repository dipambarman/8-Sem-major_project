# Smart Canteen Backend — Render Deployment Guide

This guide covers deploying the Smart Canteen backend to **Render**, which supports WebSockets (Socket.IO), persistent processes, and PostgreSQL.

## Why Render?

- ✅ **WebSocket support** — Socket.IO works perfectly
- ✅ **Persistent server** — runs as a Node.js web service (spins down after 15 min of inactivity on free tier, but wakes up on request)
- ✅ **Free tier available** — completely free to deploy Web Services
- ✅ **Simple GitHub integration** — auto-deploys when you push to `main` or `develop`

## Prerequisites

- [Render account](https://render.com) (sign up with GitHub)
- GitHub repository with your backend code pushed
- Node.js 18+ locally

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
cd backend
git add .
git commit -m "chore: prepare backend for Render deployment"
git push
```

### 2. Create a Render Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** and select **"Web Service"**
3. Choose **"Build and deploy from a Git repository"**
4. Connect your GitHub account and select your repository
5. Fill in the details:
   - **Name**: `smart-canteen-backend`
   - **Root Directory**: `./backend` (if your code is in a `backend` folder, otherwise leave empty if it's the root)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run prisma:generate`
   - **Start Command**: `npm start`
   - **Instance Type**: Select the **Free** tier

### 3. Configure Environment Variables

Scroll down to **Environment Variables** and add:

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres.utrrpysg...` | Your Supabase pooler URL |
| `DIRECT_URL` | `postgresql://postgres.utrrpysg...` | Your Supabase direct URL |
| `JWT_SECRET` | `<strong-random-string>` | Use a long random string |
| `RAZORPAY_KEY_ID` | `rzp_test_...` or `rzp_live_...` | Your Razorpay key |
| `RAZORPAY_KEY_SECRET` | `<your-secret>` | Your Razorpay secret |
| `NODE_ENV` | `production` | |
| `FRONTEND_URL` | `*` | Or your specific frontend URL for CORS |
| `LOG_LEVEL` | `info` | |

### 4. Deploy

Click **"Create Web Service"** at the bottom. Render will now clone your code, run the build command, and start your server.

### 5. Run Prisma Migrations

After the first deploy, you need to run migrations against your production database:

```bash
# Locally in your backend folder, with your production DATABASE_URL
DATABASE_URL="your_production_db_url" npx prisma migrate deploy
```

### 6. Get Your Production URL

After deployment, Render gives you a URL like:
```
https://smart-canteen-backend.onrender.com
```

### 7. Update Mobile App

Update your mobile app's `.env`:
```
EXPO_PUBLIC_API_URL=https://smart-canteen-backend.onrender.com
```

## Testing the Deployment

```bash
# Health check
curl https://smart-canteen-backend.onrender.com/health

# Should return:
# { "success": true, "message": "Smart Canteen API is running", ... }
```

## Troubleshooting

### Socket.IO not connecting
- Ensure `FRONTEND_URL` is set correctly (or `*` for all origins)
- Check that the mobile app points to the Render URL
- Note that Render's free tier sleeps after 15 mins. The first request will wake it up (takes ~30-60 seconds), so the socket might take a moment to connect initially.

### Database connection errors
- Verify `DATABASE_URL` has `?pgbouncer=true&connect_timeout=30` for Supabase pooler
- Ensure `DIRECT_URL` uses port `5432` (session mode) for migrations

### Build failures
- Check logs in the Render dashboard
- Ensure your Root Directory is correct if your project is in a subfolder (`backend`)
