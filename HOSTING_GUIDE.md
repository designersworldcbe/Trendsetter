# Trendsetter - Hosting & Deployment Guide

## ⚠️ Important: Cloudflare Pages + OpenCASCADE

**Cloudflare Pages CANNOT run OpenCASCADE Technology!**

| Component | Cloudflare Pages | CAD Processing (Python) |
|-----------|-----------------|------------------------|
| Technology | Node.js | Python + OpenCASCADE |
| Runtime | V8 JavaScript | Python 3.10+ |
| System Libraries | No | Yes (OpenGL, etc.) |

### The Solution: Split Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              Recommended: Split Architecture                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐     ┌──────────────────────┐         │
│  │   Cloudflare Pages   │     │   Railway/Render     │         │
│  │   (Frontend Only)    │────▶│   (CAD Processor)    │         │
│  │                      │     │   + OpenCASCADE 8.0  │         │
│  └──────────────────────┘     └──────────────────────┘         │
│           │                              │                       │
│           └──────────────┬───────────────┘                       │
│                          ▼                                      │
│                 ┌──────────────────┐                           │
│                 │  Cloudflare D1   │                           │
│                 │   (Database)     │                           │
│                 └──────────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Option 1: Railway (RECOMMENDED - Easiest)

### Why Railway?
- ✅ Python + system libraries supported
- ✅ Built-in PostgreSQL/MySQL (or use D1 separately)
- ✅ Auto-deploys from GitHub
- ✅ Free tier available
- ✅ Easy OpenCASCADE installation

### Steps:
1. Go to [Railway.app](https://railway.app)
2. Connect GitHub repo
3. Create new "Python" project
4. Add environment variables
5. Railway auto-detects and deploys!

### Railway Configuration:
```python
# Start command
uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## Option 2: Render (Free Tier)

### Steps:
1. Go to [Render.com](https://render.com)
2. Connect GitHub repo
3. Create "Web Service"
4. Set:
   - **Runtime:** Python
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## Option 3: Google Cloud Run (Free Tier)

### Steps:
```bash
# 1. Build Docker image
docker build -t gcr.io/YOUR_PROJECT/cad-processor:latest .

# 2. Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT/cad-processor:latest

# 3. Deploy to Cloud Run
gcloud run deploy cad-processor \
  --image gcr.io/YOUR_PROJECT/cad-processor:latest \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated
```

---

## Option 4: VPS (DigitalOcean/AppInSeconds)

For ₹400-800/month:
- 2GB RAM, 1 vCPU
- Full control
- Install anything

### Steps:
```bash
# SSH to your VPS
ssh root@your-server-ip

# Install Python and dependencies
apt update && apt install python3 python3-pip docker.io

# Clone your repo
git clone https://github.com/your-repo/cad-processor.git
cd cad-processor

# Install with system dependencies
apt install libgl1-mesa-glx libglu1-mesa libfreetype6-dev tcl8.6 tk8.6
pip install -r requirements.txt

# Run
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## Frontend: Cloudflare Pages (Frontend Only)

### Deploy Next.js Frontend:
```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy
wrangler pages deploy .next --project-name=trendsetter

# Or with custom domain
wrangler pages domain create trendsetter track.costinghub.com
```

### Environment Variables in Cloudflare Pages:
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://track.costinghub.com` |
| `CAD_API_URL` | `https://your-cad-api.railway.app` (or Railway URL) |
| `DATABASE_URL` | `file:local.db` (D1 binding) |

---

## Database: Cloudflare D1

### Create D1 Database:
```bash
# Install Wrangler if not already
npm install -g wrangler

# Login
wrangler login

# Create database
wrangler d1 create trendsetter-db

# Push schema
wrangler d1 execute trendsetter-db --remote --file=./drizzle/schema.sql
```

---

## Complete Deployment Checklist

### 1. Frontend (Cloudflare Pages)
- [ ] Deploy Next.js app
- [ ] Add custom domain (track.costinghub.com)
- [ ] Set environment variables
- [ ] Test: https://track.costinghub.com

### 2. CAD Processor (Railway/Render)
- [ ] Deploy Python CAD service
- [ ] Note the URL (e.g., https://cad-processor.up.railway.app)
- [ ] Test endpoint: https://cad-processor.up.railway.app/health

### 3. Database (Cloudflare D1)
- [ ] Create D1 database
- [ ] Push schema
- [ ] Note database ID

### 4. Connect Everything
- [ ] Update frontend env var: `CAD_API_URL`
- [ ] Update backend env var: `DATABASE_URL`
- [ ] Test full flow

### 5. PayPal
- [x] Webhook ID configured: `24996274KH4619641`
- [ ] Verify webhook in PayPal dashboard

---

## Cost Summary (Monthly)

| Component | Service | Cost |
|-----------|---------|------|
| Frontend | Cloudflare Pages | ₹0 |
| CAD Processing | Railway (Starter) | ₹0-400 |
| Database | Cloudflare D1 | ₹0 |
| Domain | track.costinghub.com | Already owned |
| **Total** | | **₹0-400/month** |

---

## Quick Start: Railway + Cloudflare

### Step 1: Deploy CAD Processor to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub"
4. Select `python-services/cad-processor` folder
5. Add environment variables
6. Wait for deployment → Copy URL

### Step 2: Deploy Frontend to Cloudflare
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Create Pages project
3. Connect GitHub
4. Set build output: `.next`
5. Add environment variable:
   - `CAD_API_URL` = Railway URL from Step 1
6. Deploy!

### Step 3: Create D1 Database
```bash
wrangler d1 create trendsetter-db
wrangler d1 execute trendsetter-db --remote --file=./drizzle/schema.sql
```

---

## Support

Need help? Check:
- [Railway Docs](https://docs.railway.app)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [D1 Docs](https://developers.cloudflare.com/d1/)
