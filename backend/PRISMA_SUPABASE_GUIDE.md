# Complete Guide: Prisma + Supabase Setup

## PART 1: Understanding Prisma

### What is Prisma?
Prisma is an ORM (Object-Relational Mapping) tool that:
- Manages your database schema
- Handles database migrations (schema changes)
- Seeds your database with initial data
- Provides a type-safe way to query your database

### Your Current Setup
Your backend has:
- **schema.prisma** - Defines all database tables and relationships
- **migrations/** - Records of all schema changes
- **seed.js** - Script to populate test data

### Prisma Commands You'll Use

```bash
# 1. Generate Prisma Client (required after any schema change)
npm run prisma:generate

# 2. Create/update database tables based on schema
npm run prisma:deploy

# 3. Run seed script (create admin user, test data)
npm run prisma:seed

# 4. All-in-one setup (do all above)
npm run db:setup
```

---

## PART 2: Create Supabase Database (Step-by-Step)

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Sign Up"
3. Use GitHub or Email to register
4. Verify your email

### Step 2: Create a New Project
1. After login, click "New Project"
2. Fill in:
   - **Project Name:** `smart-canteen` (or any name)
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free tier is fine
3. Click "Create new project"
4. **Wait 2-3 minutes** for database to be created

### Step 3: Get Your Database Connection String
1. In Supabase dashboard, go to **Settings** (bottom left)
2. Click **Database** tab
3. Scroll to "Connection pooling" or "Connection string"
4. Click the copy icon next to PostgreSQL connection string
5. Choose "Connection pooling" (recommended for Vercel)

Your connection string looks like:
```
postgresql://postgres:YOUR_PASSWORD@db.RANDOM_ID.supabase.co:6543/postgres
```

---

## PART 3: Connect Backend to Supabase

### Option A: Local Testing (Recommended First)

1. **Update local .env file:**
```bash
cd 8-Sem-major_project/backend
```

Edit `.env`:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.RANDOM_ID.supabase.co:6543/postgres"
NODE_ENV=development
```

2. **Generate Prisma Client:**
```bash
npm run prisma:generate
```

3. **Create tables in Supabase:**
```bash
npm run prisma:deploy
```

4. **Seed test data:**
```bash
npm run prisma:seed
```

5. **Test connection:**
```bash
npm run dev
```
Visit: http://localhost:3000/health

### Option B: Deploy Directly to Vercel

1. **Push code to GitHub:**
```bash
git add .
git commit -m "chore: configure PostgreSQL database"
git push origin main
```

2. **Go to Vercel Dashboard**
   - Select your project
   - Go to **Settings** → **Environment Variables**
   - Add these:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Supabase connection string |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Generate with: `openssl rand -base64 32` |
| `RAZORPAY_KEY_ID` | Your key from Razorpay |
| `RAZORPAY_KEY_SECRET` | Your secret from Razorpay |
| `FRONTEND_URL` | Your frontend URL (e.g., https://your-app.vercel.app) |

3. **Redeploy on Vercel:**
   - Go to Deployments
   - Click "Redeploy" on latest deployment
   - Or push new commit to trigger auto-deploy

4. **Run migrations on Vercel database:**
```bash
vercel exec "npm run prisma:deploy"
```

5. **Seed data (optional):**
```bash
vercel exec "npm run prisma:seed"
```

---

## PART 4: Verify Everything Works

### Check Local Setup
```bash
npm run dev
# Visit: http://localhost:3000/health
# Should see: {"success": true, "message": "Smart Canteen API is running"}
```

### Check Vercel Setup
1. Go to your Vercel deployment URL
2. Add `/health` → `https://your-backend.vercel.app/health`
3. Should see same success message

### Verify Database
```bash
# View your Supabase data
# In Supabase Dashboard:
# - Go to SQL Editor
# - Run: SELECT * FROM users;
# Should see your admin user
```

---

## Common Issues & Solutions

### ❌ "Cannot find module 'dotenv'"
```bash
npm install
```

### ❌ "Database connection refused"
- Check DATABASE_URL is correct
- Check password is correct
- Check Supabase project is active

### ❌ "relation 'users' does not exist"
```bash
npm run prisma:deploy
npm run prisma:seed
```

### ❌ "JWT_SECRET not set"
Generate one:
```bash
openssl rand -base64 32
# Copy output to environment variables
```

---

## Summary of Commands

```bash
# LOCAL DEVELOPMENT
npm run prisma:generate    # Required first
npm run prisma:deploy      # Create tables
npm run prisma:seed        # Add test data
npm run dev                # Start server

# VERCEL DEPLOYMENT
vercel exec "npm run prisma:deploy"   # Create tables on Vercel DB
vercel exec "npm run prisma:seed"     # Add test data on Vercel DB
```

---

## Next Steps

1. ✅ Create Supabase account and project
2. ✅ Get connection string
3. ✅ Update local .env with PostgreSQL
4. ✅ Run: `npm run prisma:generate && npm run prisma:deploy`
5. ✅ Test locally: `npm run dev`
6. ✅ Deploy to Vercel with env variables
7. ✅ Run: `vercel exec "npm run prisma:deploy"`
8. ✅ Test: Visit your Vercel URL + `/health`
