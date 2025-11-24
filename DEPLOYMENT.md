# Vercel Deployment Guide

## Environment Variables

Set these in your Vercel project settings (Settings → Environment Variables):

### Production Environment Variables

**Server Variables:**
- `PORT` = `3001` (or leave empty, Vercel will assign)
- `JWT_SECRET` = `your-production-secret-key-here`
- `CLIENT_URL` = `https://your-app.vercel.app`

**Client Variables:**
- `VITE_API_URL` = `https://your-app.vercel.app`

## Deployment Steps

1. **Install Vercel CLI** (optional, for local testing):
   ```bash
   npm install -g vercel
   ```

2. **Connect to Vercel**:
   - Push your code to GitHub/GitLab/Bitbucket
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Vercel will auto-detect the configuration

3. **Set Environment Variables** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables listed above
   - Make sure to set them for "Production", "Preview", and "Development"

4. **Deploy**:
   - Vercel will automatically deploy on every push to main branch
   - Or manually trigger deployment from Vercel dashboard

## Important Notes

⚠️ **Database**: SQLite won't work on Vercel (serverless). You'll need to:
- Use a hosted database (PostgreSQL, MySQL, MongoDB)
- Or use Vercel's KV/Postgres offerings
- Update `server/src/db.js` accordingly

⚠️ **Socket.IO**: May have limitations on Vercel serverless. Consider:
- Using Vercel's Edge Functions
- Or deploying backend separately (Railway, Render, Heroku)

## Alternative: Split Deployment

For better Socket.IO support, consider:

**Frontend on Vercel:**
- Deploy only the `client` directory
- Set `VITE_API_URL` to your backend URL

**Backend on Railway/Render:**
- Deploy the `server` directory
- Better support for WebSockets and persistent connections
