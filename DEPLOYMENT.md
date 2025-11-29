# Deployment Guide for Vercel

This guide explains how to deploy your Whot game to Vercel.

## Important: Two Separate Deployments Required

Your project consists of:
1. **Frontend** (React app) - Deploy to Vercel
2. **Backend** (Socket.io server) - Deploy separately (Railway, Render, Fly.io, etc.)

**You need to deploy the server FIRST** to get its URL, then use that URL in your frontend deployment.

---

## Step 1: Deploy the Server

The Socket.io server requires a persistent connection, so it cannot run on Vercel's serverless functions. Deploy it to one of these platforms:

### Option A: Railway (Recommended - Easy Setup)

1. Go to [Railway.app](https://railway.app) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect the server folder
5. Set environment variables:
   - `APP_FRONTEND_URL` = Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
6. Railway will provide a URL like `https://your-app.railway.app`
7. **Note the server URL** - you'll need it for Step 2

### Option B: Render

1. Go to [Render.com](https://render.com) and sign up/login
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js` (or `ts-node index.ts` if needed)
   - **Environment**: Node
5. Set environment variables:
   - `APP_FRONTEND_URL` = Your Vercel frontend URL
6. Render will provide a URL - **Note this URL**

### Option C: Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. In the `server` directory, run: `fly launch`
3. Follow the prompts
4. Set environment variable: `fly secrets set APP_FRONTEND_URL=https://your-app.vercel.app`
5. Deploy: `fly deploy`
6. **Note the server URL**

### Option D: Heroku

1. Install Heroku CLI
2. In the `server` directory:
   ```bash
   heroku create your-app-name
   heroku config:set APP_FRONTEND_URL=https://your-app.vercel.app
   git push heroku main
   ```

---

## Step 2: Deploy Frontend to Vercel

### Method 1: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. In your project root, run:
   ```bash
   vercel
   ```

3. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No** (for first deployment)
   - Project name? (Enter a name or press Enter)
   - Directory? **./** (current directory)
   - Override settings? **No**

4. When prompted for environment variables, add:
   - `REACT_APP_SOCKET_URL` = Your server URL from Step 1 (e.g., `https://your-server.railway.app`)

5. After deployment, Vercel will give you a URL like `https://your-app.vercel.app`

### Method 2: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - `REACT_APP_SOCKET_URL` = Your server URL from Step 1

6. Click "Deploy"

---

## Step 3: Update Server CORS Settings

After deploying the frontend, update your server's `APP_FRONTEND_URL` environment variable to your Vercel URL:

- Go back to your server hosting platform (Railway/Render/etc.)
- Update the `APP_FRONTEND_URL` environment variable to: `https://your-app.vercel.app`
- Restart/redeploy the server

---

## Step 4: Update Frontend Socket URL (if needed)

If you deployed the frontend before the server, update the environment variable:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `REACT_APP_SOCKET_URL` to your server URL
3. Redeploy (or it will auto-redeploy)

---

## Environment Variables Summary

### Frontend (Vercel)
- `REACT_APP_SOCKET_URL` = Your server URL (e.g., `https://your-server.railway.app`)

### Backend (Railway/Render/etc.)
- `APP_FRONTEND_URL` = Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

---

## Troubleshooting

### Socket Connection Issues
- Make sure both URLs are using HTTPS (not HTTP)
- Check that CORS is properly configured on the server
- Verify environment variables are set correctly on both platforms

### Build Failures
- Make sure all dependencies are in `package.json`
- Check that the build command works locally: `npm run build`

### Server Not Starting
- Check server logs on your hosting platform
- Ensure the server is listening on the correct port (Railway/Render usually provide a `PORT` env var)
- You may need to update `server/index.ts` to use `process.env.PORT || 8080`

---

## Quick Checklist

- [ ] Server deployed and running
- [ ] Server URL noted
- [ ] Frontend deployed to Vercel
- [ ] `REACT_APP_SOCKET_URL` set in Vercel
- [ ] `APP_FRONTEND_URL` set in server platform
- [ ] Both URLs use HTTPS
- [ ] Test multiplayer functionality

---

## Need Help?

If you encounter issues:
1. Check the server logs on your hosting platform
2. Check Vercel deployment logs
3. Test locally with the production URLs in your `.env` file

