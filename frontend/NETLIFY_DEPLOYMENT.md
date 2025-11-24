# Deploy Frontend to Netlify

This guide shows you how to deploy the Student Photo Capture frontend to Netlify while keeping the backend API on your server.

## Architecture Overview

- **Frontend (Netlify)**: `https://your-site.netlify.app` or custom domain
- **Backend API (Your Server)**: `https://api.studentscapture.boboyii.app`

The frontend will be hosted on Netlify's global CDN, while API requests go to your backend server.

---

## Prerequisites

1. ✅ GitHub/GitLab account (to connect your repository)
2. ✅ Netlify account (free tier works fine)
3. ✅ Backend API deployed and accessible at `https://api.studentscapture.boboyii.app`

---

## Deployment Steps

### Step 1: Prepare Your Repository

Your repository is already configured for Netlify deployment with:
- ✅ `netlify.toml` - Build configuration
- ✅ `.nvmrc` - Node version specification
- ✅ `next.config.js` - Next.js configuration (supports both Docker and Netlify)

### Step 2: Deploy to Netlify

#### Option A: Deploy via Netlify UI (Recommended)

1. **Go to Netlify**: https://app.netlify.com

2. **Click "Add new site" → "Import an existing project"**

3. **Connect your Git provider** (GitHub, GitLab, or Bitbucket)

4. **Select your repository**: `student-id-capture`

5. **Configure build settings**:
   ```
   Base directory: frontend
   Build command: npm install && npm run build
   Publish directory: frontend/.next
   ```

6. **Add environment variable**:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://api.studentscapture.boboyii.app`

7. **Click "Deploy site"**

8. Wait 2-3 minutes for the build to complete

#### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Navigate to frontend directory
cd frontend

# Deploy
netlify deploy --prod

# Follow the prompts:
# - Create & configure a new site
# - Build command: npm run build
# - Publish directory: .next
```

### Step 3: Configure Environment Variables

In Netlify Dashboard:

1. Go to **Site settings → Environment variables**

2. Add these variables:
   ```
   NEXT_PUBLIC_API_URL = https://api.studentscapture.boboyii.app
   NODE_VERSION = 18
   NEXT_TELEMETRY_DISABLED = 1
   ```

3. Click **Save**

4. **Redeploy** the site for changes to take effect:
   - Go to **Deploys** tab
   - Click **Trigger deploy → Deploy site**

### Step 4: Configure Custom Domain (Optional)

If you want to use your own domain instead of `*.netlify.app`:

1. Go to **Site settings → Domain management**

2. Click **Add custom domain**

3. Enter your domain (e.g., `studentscapture.boboyii.app`)

4. Update your DNS settings:
   ```
   Type: CNAME
   Name: studentscapture (or @)
   Value: your-site.netlify.app
   ```

5. Wait for DNS propagation (5-30 minutes)

6. Netlify will automatically provision SSL certificate

### Step 5: Update Backend CORS

Update your backend to allow requests from your Netlify domain:

**On your server**, edit `docker-compose.yml`:

```yaml
backend:
  environment:
    - FRONTEND_URL=https://your-site.netlify.app
```

Or if using custom domain:

```yaml
backend:
  environment:
    - FRONTEND_URL=https://studentscapture.boboyii.app
```

Then restart the backend:

```bash
docker compose restart backend
```

---

## Verify Deployment

1. **Access your Netlify site**: `https://your-site.netlify.app`

2. **Test functionality**:
   - ✅ Page loads without errors
   - ✅ Camera permissions work
   - ✅ Can create classes
   - ✅ Can capture and upload photos
   - ✅ Admin dashboard accessible

3. **Check browser console** (F12):
   - No CORS errors
   - API requests going to `https://api.studentscapture.boboyii.app`

---

## Continuous Deployment

Once connected, Netlify will automatically deploy when you push to your repository:

1. **Push changes** to your main branch
2. **Netlify detects changes** and starts building
3. **New version deployed** automatically in 2-3 minutes

You can see deployment status at: `https://app.netlify.com/sites/your-site/deploys`

---

## Troubleshooting

### Build Fails with "Module not found"

**Solution**: Check that all dependencies are in `package.json`:
```bash
cd frontend
npm install
```

### API Requests Failing (CORS errors)

**Solution**: Verify backend CORS configuration includes your Netlify domain:
```yaml
# docker-compose.yml
- FRONTEND_URL=https://your-site.netlify.app
```

### Camera Not Working

**Solution**: Netlify provides HTTPS by default, which is required for camera access. Make sure you're accessing via `https://` not `http://`.

### Environment Variables Not Applied

**Solution**:
1. Check variables in **Site settings → Environment variables**
2. **Trigger a new deploy** after adding/changing variables
3. Variables must start with `NEXT_PUBLIC_` to be accessible in the browser

### Build Takes Too Long or Times Out

**Solution**: Netlify has a 15-minute build limit on free tier. Your build should complete in 2-3 minutes. If not:
1. Check for unnecessary dependencies
2. Clear build cache: **Site settings → Build & deploy → Clear cache and retry deploy**

---

## Folder Structure

```
student-id-capture/
├── frontend/                  # Netlify deploys from here
│   ├── netlify.toml          # ✅ Netlify configuration
│   ├── .nvmrc                # ✅ Node version
│   ├── next.config.js        # ✅ Next.js config (Netlify-compatible)
│   ├── package.json
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── public/
└── backend/                   # Stays on your server
    └── ...
```

---

## Production Checklist

Before going live:

- [ ] Backend API is accessible at `https://api.studentscapture.boboyii.app`
- [ ] Backend health endpoint returns 200: `curl https://api.studentscapture.boboyii.app/health`
- [ ] Environment variable `NEXT_PUBLIC_API_URL` is set in Netlify
- [ ] Backend CORS allows your Netlify domain
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (Netlify handles this automatically)
- [ ] Camera permissions work on the deployed site
- [ ] Photo upload works end-to-end
- [ ] Admin dashboard accessible and functional

---

## Cost Estimate

**Netlify Free Tier Includes:**
- ✅ 100 GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Automatic HTTPS
- ✅ Continuous deployment
- ✅ 1 concurrent build

This is sufficient for small to medium deployments (thousands of students).

**When to Upgrade:**
- High traffic (>100GB/month bandwidth)
- Need more build minutes
- Want faster build times with multiple concurrent builds

---

## Support

- **Netlify Docs**: https://docs.netlify.com
- **Netlify Community**: https://answers.netlify.com
- **Next.js on Netlify**: https://docs.netlify.com/integrations/frameworks/next-js/

---

## Benefits of Netlify Deployment

✅ **Global CDN** - Fast loading worldwide
✅ **Auto SSL** - HTTPS by default
✅ **Git Integration** - Auto-deploy on push
✅ **Preview Deploys** - Test before going live
✅ **Rollback** - Instant rollback to previous versions
✅ **Free Tier** - Perfect for getting started
✅ **No Server Maintenance** - Netlify handles infrastructure
