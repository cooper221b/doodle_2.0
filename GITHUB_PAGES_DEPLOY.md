# Deploy to GitHub Pages - Complete Guide

Follow these steps to deploy your app to GitHub Pages and test it live (no local setup needed).

## Overview

- **Frontend**: Auto-deploys to GitHub Pages via GitHub Actions
- **Backend**: One-time setup on Railway (free tier, 5 minutes)
- **Database**: Automatically provisioned on Railway

## Step-by-Step Instructions

### Step 1: Deploy Backend to Railway (One-time, 5 min)

Railway hosts your backend and database for free. You only do this once.

1. **Create Railway account**:
   - Go to https://railway.app
   - Click "Login" → "Login with GitHub"
   - Authorize Railway

2. **Create new project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `cooper221b/doodle_2.0`
   - Click "Deploy Now"

3. **Add PostgreSQL database**:
   - In your project dashboard, click "+ New"
   - Select "Database" → "Add PostgreSQL"
   - Wait 30 seconds for it to provision

4. **Configure your backend service**:
   - Click on your `doodle_2.0` service (not the database)
   - Go to "Variables" tab
   - Click "+ New Variable" and add each of these:

   ```
   NODE_ENV=production
   PORT=3001
   ```

   - For JWT_SECRET, run this in Railway's terminal OR use any random string:
     - Click "Settings" tab → scroll to "Service" → click "Deploy Logs"
     - Or just use: `my-super-secret-jwt-key-change-this-later-12345678`

   ```
   JWT_SECRET=my-super-secret-jwt-key-change-this-later-12345678
   SESSION_SECRET=my-super-secret-session-key-change-this-later-12345678
   ```

5. **Update start command**:
   - Still in your service, click "Settings" tab
   - Scroll to "Deploy"
   - Under "Custom Start Command", enter:
   ```
   cd server && npx prisma db push && npm start
   ```
   - Click "Update"

6. **Get your backend URL**:
   - Click "Settings" tab
   - Scroll to "Networking"
   - Click "Generate Domain" if you don't have one
   - Copy the domain (e.g., `your-app-production.up.railway.app`)
   - **Test it**: Visit `https://your-app-production.up.railway.app/api/health`
   - You should see: `{"status":"ok"}`

### Step 2: Configure GitHub Pages (One-time, 2 min)

1. **Enable GitHub Pages**:
   - Go to your GitHub repo: `https://github.com/cooper221b/doodle_2.0`
   - Click "Settings" (top menu)
   - Click "Pages" (left sidebar)
   - Under "Source", select "GitHub Actions"
   - Click "Save" (if prompted)

2. **Set API URL variable**:
   - Still in Settings, click "Secrets and variables" → "Actions" (left sidebar)
   - Click the "Variables" tab (not Secrets)
   - Click "New repository variable"
   - Name: `VITE_API_URL`
   - Value: `https://your-app-production.up.railway.app/api`
     (⚠️ Replace with YOUR Railway domain + `/api`)
   - Click "Add variable"

### Step 3: Deploy Frontend (Automatic)

1. **Merge to main branch**:
   ```bash
   # In your terminal (or use GitHub UI)
   git checkout main
   git merge claude/build-scheduling-app-011CUy5hxA7vtN4ZqNjF1wSv
   git push origin main
   ```

   **OR use GitHub UI**:
   - Go to your repo on GitHub
   - Click "Pull requests" → "New pull request"
   - Base: `main`, Compare: `claude/build-scheduling-app-011CUy5hxA7vtN4ZqNjF1wSv`
   - Create PR and merge it

2. **Watch the deployment**:
   - Go to "Actions" tab in GitHub
   - You'll see "Deploy to GitHub Pages" workflow running
   - Wait 2-3 minutes for it to complete
   - Green checkmark = successful deployment

3. **Access your live app**:
   - Once deployed, visit:
   ```
   https://cooper221b.github.io/doodle_2.0/
   ```

## Testing Your Deployed App

### 1. Test Backend
Visit: `https://your-app-production.up.railway.app/api/health`

Should return: `{"status":"ok"}`

### 2. Test Frontend
Visit: `https://cooper221b.github.io/doodle_2.0/`

Should show the home page.

### 3. Test Full Flow
1. Click "Sign Up"
2. Create an account
3. Create a poll or booking page
4. Share the public URL and test voting/booking

## After Initial Setup

Once setup is complete, future updates are automatic:

1. Push code to `main` branch
2. GitHub Actions automatically rebuilds and deploys frontend
3. Railway automatically rebuilds and deploys backend
4. Changes live in 2-3 minutes

## Troubleshooting

### Frontend shows "Failed to fetch" or network errors

**Check 1**: Is your backend running?
- Visit `https://your-railway-url.railway.app/api/health`
- Should return `{"status":"ok"}`

**Check 2**: Is VITE_API_URL set correctly?
- Go to GitHub repo → Settings → Secrets and variables → Actions → Variables
- Verify `VITE_API_URL` = `https://your-railway-url.railway.app/api`
- Must include `/api` at the end
- Must be HTTPS

**Check 3**: Did the GitHub Action deploy successfully?
- Go to Actions tab
- Check latest "Deploy to GitHub Pages" workflow
- Look for errors in the logs

### Backend not responding

**Check Railway logs**:
- Go to Railway project → your service
- Click "Deployments" tab
- Click latest deployment → "View Logs"
- Look for errors

**Common issues**:
- Database not connected: Make sure PostgreSQL is added to project
- Environment variables missing: Check Variables tab
- Build failed: Check deployment logs

### GitHub Pages shows 404

- Make sure Pages is enabled (Settings → Pages → Source: GitHub Actions)
- Check Actions tab for deployment status
- May take 2-3 minutes after deployment

## Important URLs

Save these for reference:

- **Live App**: `https://cooper221b.github.io/doodle_2.0/`
- **Backend API**: `https://your-railway-url.railway.app/api`
- **Backend Health**: `https://your-railway-url.railway.app/api/health`
- **Railway Dashboard**: https://railway.app/dashboard
- **GitHub Actions**: https://github.com/cooper221b/doodle_2.0/actions

## Summary Checklist

- [ ] Railway account created
- [ ] Backend deployed to Railway
- [ ] PostgreSQL database added to Railway
- [ ] Environment variables set (NODE_ENV, JWT_SECRET, SESSION_SECRET)
- [ ] Start command configured
- [ ] Backend URL obtained and tested
- [ ] GitHub Pages enabled
- [ ] VITE_API_URL variable set in GitHub
- [ ] Code merged to main branch
- [ ] Frontend deployed successfully
- [ ] App tested and working

## Need Help?

If you run into issues:
1. Check the troubleshooting section above
2. Review Railway logs for backend issues
3. Review GitHub Actions logs for frontend issues
4. Verify all environment variables are set correctly
