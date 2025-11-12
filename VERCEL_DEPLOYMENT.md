# Vercel Deployment Fix for SPA Routing

## The Problem
When you navigate directly to routes like `/schedule` or `/dashboard`, Vercel returns a 404 because it's looking for those files/folders, but in a React SPA, all routes should be handled by `index.html`.

## Solution

### Option 1: vercel.json in Frontend Folder (Recommended)

If your **Root Directory** in Vercel is set to `frontend`:

1. Make sure `frontend/vercel.json` exists with this content:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

2. **Vercel Project Settings:**
   - Go to your project settings in Vercel
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Option 2: vercel.json in Project Root

If you're deploying from the project root:

1. Make sure `vercel.json` exists in the root with:
```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Steps to Fix

1. **Verify vercel.json location:**
   - If Root Directory = `frontend` → `frontend/vercel.json` should exist
   - If Root Directory = `.` (root) → `vercel.json` should exist in root

2. **Redeploy:**
   - Push changes to your repo, OR
   - Go to Vercel Dashboard → Your Project → Deployments → Click "Redeploy" on latest deployment

3. **Test:**
   - Visit `https://your-domain.vercel.app/schedule` directly
   - Should load the app instead of 404

## Troubleshooting

### If it still doesn't work:

1. **Check Vercel Build Logs:**
   - Make sure the build completes successfully
   - Check if `vercel.json` is being included

2. **Verify File Location:**
   ```bash
   # If deploying frontend folder
   ls frontend/vercel.json
   
   # If deploying root
   ls vercel.json
   ```

3. **Check Vercel Configuration:**
   - Go to Project Settings → General
   - Verify Root Directory matches where `vercel.json` is located

4. **Clear Cache and Redeploy:**
   - In Vercel Dashboard → Settings → General
   - Clear build cache
   - Redeploy

## Alternative: Use Vercel CLI

You can also test locally:
```bash
npm i -g vercel
cd frontend
vercel
```

This will use the `vercel.json` configuration automatically.

