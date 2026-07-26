# Deployment Architecture - Trendsetter

## ⚠️ CRITICAL: Cloudflare Workers + Python

### The Problem
Cloudflare Workers use **V8 JavaScript isolates** and **cannot run Python code**.

Your Python CAD processor (`python-services/cad-processor/`) will **NOT work** in Cloudflare Workers.

### Solution Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Trendsetter Deployment                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐     ┌──────────────────┐                 │
│  │  Cloudflare Pages │     │  Google Cloud Run │                │
│  │   (Next.js App)   │     │  (Python CAD)    │                │
│  │                   │     │                  │                │
│  │ track.costinghub  │────▶│ cad-api.costinghub│                │
│  │    .com           │     │   .com            │                │
│  └──────────────────┘     └──────────────────┘                 │
│           │                         │                           │
│           │                         │                           │
│           ▼                         ▼                           │
│  ┌──────────────────────────────────────────────┐              │
│  │              Cloudflare D1                     │              │
│  │              (SQLite Database)                  │              │
│  └──────────────────────────────────────────────┘              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Recommended Deployment

### Frontend: Cloudflare Pages ✅
- **URL:** track.costinghub.com
- **Build:** `npm run build` → `.next` folder
- **Status:** Ready

### CAD Processor: Google Cloud Run ✅
- **Language:** Python 3.10+
- **Features:** OpenCASCADE, STEP parsing, Image generation
- **Cost:** ~$0-10/month (free tier)
- **Alternative:** Railway, Render, VPS

### Database: Cloudflare D1 ✅
- **Storage:** SQLite
- **Size:** 5MB free
- **Status:** Schema ready

---

## OpenCASCADE Status

### Current: NOT INSTALLED ❌
- `pythonocc-core` is commented out in requirements.txt
- Requires system dependencies (OpenGL, etc.)

### Options:
1. **Docker Container** - Full OCCT support
2. **Cloud Run** - Docker + Cloud Run deployment
3. **Alternative:** Use web-based CAD parsing libraries

---

## Cost Estimate (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| Cloudflare Pages | Free | ₹0 |
| Cloudflare D1 | 5MB | ₹0 |
| Google Cloud Run | Always Free | ₹0-100 |
| Domain | Annual | ₹800/year |
| **Total** | | **₹0-100/month** |

---

## Next Steps

1. [ ] Deploy Next.js to Cloudflare Pages
2. [ ] Deploy Python CAD service (Cloud Run recommended)
3. [ ] Create D1 database
4. [ ] Configure custom domain
5. [ ] Test end-to-end flow
