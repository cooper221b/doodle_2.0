# Deployment Guide

This guide covers deploying the Scheduling App to production using GitHub Pages (frontend) and Railway/Render (backend).

## Architecture

- **Frontend**: Deployed to GitHub Pages (static site)
- **Backend**: Deployed to Railway or Render (with PostgreSQL database)

## Prerequisites

- GitHub account
- Railway account (https://railway.app) OR Render account (https://render.com)
- Both services offer free tiers suitable for this app

---

## Part 1: Deploy Backend to Railway

Railway is recommended for its simplicity and generous free tier.

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub

### Step 2: Deploy Backend
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Select your `doodle_2.0` repository
4. Railway will auto-detect the configuration from `railway.json`

### Step 3: Add PostgreSQL Database
1. In your Railway project, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway will automatically create a database and set the `DATABASE_URL` environment variable

### Step 4: Configure Environment Variables
1. Go to your backend service → **"Variables"** tab
2. Add the following variables:
   ```
   NODE_ENV=production
   JWT_SECRET=<generate-random-string>
   SESSION_SECRET=<generate-random-string>
   PORT=3001
   ```

   **To generate secure random strings:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. The `DATABASE_URL` should already be set automatically by Railway

### Step 5: Run Database Migration
1. In Railway, go to your service → **"Settings"** → **"Deploy"**
2. Add a **"Custom Start Command"**:
   ```bash
   cd server && npx prisma db push && npm start
   ```

### Step 6: Deploy
1. Railway will automatically deploy when you push to your repo
2. Note your backend URL (e.g., `https://your-app.railway.app`)
3. Test it by visiting: `https://your-app.railway.app/api/health`

---

## Part 2: Deploy Frontend to GitHub Pages

### Step 1: Enable GitHub Pages
1. Go to your GitHub repository
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **"GitHub Actions"**

### Step 2: Configure GitHub Secrets/Variables
1. Go to **Settings** → **Secrets and variables** → **Actions** → **Variables**
2. Click **"New repository variable"**
3. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-app.railway.app/api` (your Railway backend URL + /api)

### Step 3: Deploy Frontend
The GitHub Action is already configured. To trigger deployment:

#### Option A: Push to main/master branch
```bash
# Make sure you're on the main branch
git checkout main

# Merge your changes
git merge claude/build-scheduling-app-011CUy5hxA7vtN4ZqNjF1wSv

# Push
git push origin main
```

#### Option B: Manually trigger workflow
1. Go to **Actions** tab in GitHub
2. Select **"Deploy to GitHub Pages"** workflow
3. Click **"Run workflow"** → Select branch → **"Run workflow"**

### Step 4: Access Your App
Once deployed (takes 2-3 minutes), your app will be available at:
```
https://cooper221b.github.io/doodle_2.0/
```

---

## Alternative: Deploy Backend to Render

If you prefer Render over Railway:

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub

### Step 2: Deploy Using Blueprint
1. Click **"New"** → **"Blueprint"**
2. Connect your GitHub repository
3. Render will detect `render.yaml` and create:
   - PostgreSQL database
   - Web service for backend

### Step 3: Configure Environment
The `render.yaml` file already configures most things, but verify:
1. Go to your web service → **"Environment"**
2. Ensure these variables are set:
   - `DATABASE_URL` (auto-set from database)
   - `JWT_SECRET` (auto-generated)
   - `SESSION_SECRET` (auto-generated)
   - `NODE_ENV=production`
   - `PORT=3001`

### Step 4: Run Migration
After first deployment:
1. Go to your web service → **"Shell"**
2. Run:
   ```bash
   cd server && npx prisma db push
   ```

### Step 5: Note Backend URL
Your backend URL will be: `https://your-app.onrender.com`

Update the GitHub variable `VITE_API_URL` to: `https://your-app.onrender.com/api`

---

## Troubleshooting

### Frontend Issues

**Problem**: App shows "Failed to fetch" errors
- **Solution**: Check that `VITE_API_URL` GitHub variable is set correctly
- **Solution**: Verify backend is running by visiting `/api/health` endpoint

**Problem**: 404 on GitHub Pages
- **Solution**: Make sure GitHub Pages is enabled and set to "GitHub Actions"
- **Solution**: Check the Actions tab for deployment errors

### Backend Issues

**Problem**: Database connection errors
- **Solution**: Verify `DATABASE_URL` is set correctly
- **Solution**: Run `npx prisma db push` to create tables

**Problem**: CORS errors
- **Solution**: Backend is configured to allow `https://cooper221b.github.io`
- **Solution**: If using custom domain, add it to `allowedOrigins` in `server/src/index.ts`

**Problem**: App crashes on startup
- **Solution**: Check Railway/Render logs
- **Solution**: Ensure all environment variables are set
- **Solution**: Verify build succeeded (check build logs)

---

## Environment Variables Reference

### Backend (Railway/Render)
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Auto-set by platform |
| `JWT_SECRET` | Secret for JWT tokens | Random 64-char string |
| `SESSION_SECRET` | Secret for sessions | Random 64-char string |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3001` |

### Frontend (GitHub Actions)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-app.railway.app/api` |

---

## Updating After Changes

### To Update Frontend
1. Push changes to main branch
2. GitHub Actions will automatically rebuild and deploy

### To Update Backend
1. Push changes to main branch
2. Railway/Render will automatically rebuild and deploy
3. If database schema changed, run migrations:
   ```bash
   # In Railway/Render shell
   cd server && npx prisma db push
   ```

---

## Monitoring

### Railway
- Dashboard: https://railway.app/dashboard
- View logs in real-time
- Monitor usage and costs

### Render
- Dashboard: https://dashboard.render.com
- View deployment logs
- Monitor service health

### GitHub Actions
- Actions tab in repository
- View deployment history and logs

---

## Costs

### Free Tier Limits

**Railway**
- $5 of usage per month free
- Includes database and web service
- Should be sufficient for development/testing

**Render**
- Free tier for web services (with limitations)
- Free PostgreSQL database (expires after 90 days)
- Services may sleep after inactivity

**GitHub Pages**
- Completely free for public repositories
- 100GB bandwidth per month
- 1GB storage

---

## Security Recommendations

1. **Never commit secrets** to the repository
2. **Use strong JWT secrets** (generate with crypto.randomBytes)
3. **Enable HTTPS** (automatic on Railway/Render/GitHub Pages)
4. **Regularly update dependencies**
5. **Monitor usage** to avoid unexpected costs

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review deployment logs in Railway/Render/GitHub Actions
3. Verify all environment variables are set correctly
4. Test backend health endpoint: `https://your-backend/api/health`
