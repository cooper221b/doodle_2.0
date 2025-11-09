# Quick Start - Deploy in 10 Minutes

Follow these steps to get your scheduling app live on the internet!

## Step 1: Deploy Backend (5 minutes)

### Using Railway (Recommended)

1. **Sign up**: Go to https://railway.app and sign in with GitHub

2. **Create project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `doodle_2.0`

3. **Add Database**:
   - In your project, click "New" → "Database" → "PostgreSQL"
   - Wait for it to deploy (30 seconds)

4. **Set Environment Variables**:
   - Click on your service → "Variables" tab
   - Add these variables:
     ```
     NODE_ENV=production
     JWT_SECRET=<paste-random-string-here>
     SESSION_SECRET=<paste-random-string-here>
     ```

   **Generate random strings** (run in your terminal):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Configure deployment**:
   - Go to "Settings" → "Deploy"
   - Set start command to:
     ```
     cd server && npx prisma db push && npm start
     ```

6. **Get your URL**:
   - Go to "Settings" → "Networking" → "Public Networking"
   - Copy your public URL (e.g., `https://your-app.railway.app`)
   - Test it: Visit `https://your-app.railway.app/api/health`
   - You should see: `{"status":"ok"}`

## Step 2: Deploy Frontend (5 minutes)

1. **Enable GitHub Pages**:
   - Go to your GitHub repo
   - Click "Settings" → "Pages"
   - Under "Source", select "GitHub Actions"

2. **Set API URL**:
   - Go to "Settings" → "Secrets and variables" → "Actions" → "Variables" tab
   - Click "New repository variable"
   - Name: `VITE_API_URL`
   - Value: `https://your-app.railway.app/api` (your Railway URL + /api)
   - Click "Add variable"

3. **Merge to main branch** (if not already):
   ```bash
   git checkout main
   git merge claude/build-scheduling-app-011CUy5hxA7vtN4ZqNjF1wSv
   git push origin main
   ```

4. **Wait for deployment**:
   - Go to "Actions" tab
   - Watch the "Deploy to GitHub Pages" workflow
   - Takes 2-3 minutes

5. **Access your app**:
   - Once complete, visit: `https://cooper221b.github.io/doodle_2.0/`

## Done! 🎉

Your app is now live! Here's what you can do:

1. **Create an account** on your deployed app
2. **Create a poll** or **booking page**
3. **Share the public URL** with others

## Testing Your Deployment

### Test the Backend
```bash
curl https://your-app.railway.app/api/health
# Should return: {"status":"ok"}
```

### Test the Frontend
1. Visit your GitHub Pages URL
2. Click "Sign Up"
3. Create an account
4. Create a poll or booking page

## Troubleshooting

**Frontend shows "Failed to fetch"**
- Check that `VITE_API_URL` is set correctly in GitHub variables
- Verify backend health endpoint works

**Backend not responding**
- Check Railway deployment logs
- Verify all environment variables are set
- Make sure database is connected

**Need more help?**
- See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed troubleshooting
- Check the "Issues" tab on GitHub

## What's Next?

- Customize the app for your needs
- Share with friends and colleagues
- Monitor usage in Railway dashboard
- Consider upgrading if you exceed free tier limits

## Important Notes

- **Free tiers**: Both Railway and GitHub Pages offer generous free tiers
- **Data persistence**: Your database is persistent on Railway
- **Custom domain**: You can add a custom domain in both Railway and GitHub Pages settings
- **Monitoring**: Check Railway dashboard for backend logs and metrics

Enjoy your scheduling app! 🚀
