# TRENDSETTER - 3D Feature Recognition Machining Cost Calculator

## Project Overview

**Project Name:** Trendsetter  
**Domain:** track.costinghub.com  
**Type:** B2B SaaS Application  
**Core Problem Solved:** Automated feature recognition from uploaded CAD files (.step, .stp) to instantly calculate accurate machining costs.

**Target Audience:**
- Small machine shop owners
- Cost estimation engineers
- Technical engineers

**Launch Date:** New Year 2027  
**Database:** Cloudflare D1 (SQLite)  
**Hosting:** Cloudflare Pages

---

## 1. Technology Stack

### Frontend & Backend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **3D Viewer:** React Three Fiber + Three.js
- **State Management:** Zustand

### Database
- **Primary:** Cloudflare D1 (SQLite) - FREE
- **File Storage:** Cloudflare R2 / AWS S3

### Deployment
- **Hosting:** Cloudflare Pages (track.costinghub.com)
- **CI/CD:** GitHub Actions

---

## 2. Core Features

### 2.1 Authentication
- [x] Email/Password registration & login
- [x] Password reset
- [ ] Google OAuth (activate later)
- [ ] WhatsApp OTP (future)
- [ ] SSO (enterprise plan)

### 2.2 3D Model Processing
- [x] Upload .step, .stp, .iges, .stl files
- [x] 3D model viewer
- [x] Feature recognition engine
- [x] Model image generation

### 2.3 Feature Recognition
Auto-detects:
- [x] Holes (through, blind, counterbore, countersink)
- [x] Pockets (rectangular, circular)
- [x] Slots (keyway, T-slot, general)
- [x] Bosses (cylindrical, rectangular)
- [x] Threads (internal/external)
- [x] Turning operations

### 2.4 Machine Database
- [x] CRUD operations
- [x] MHR (Machine Hour Rate)
- [x] Setup cost
- [x] Efficiency factor
- [x] Work envelope
- [x] Import/Export Excel

### 2.5 Cost Calculation
- [x] Machining time calculation
- [x] Material cost
- [x] Tooling cost
- [x] Secondary processes (painting, plating, heat treatment, etc.)
- [x] Overhead & profit markup
- [x] Multi-setup support

### 2.6 Report Generation
- [x] **Excel Export** (full multi-sheet report)
- [ ] PDF Export (future)
- [ ] CSV Export (future)

#### Excel Report Contents:
1. **Summary Sheet** - Total costs, customer info, validity
2. **Model Info** - Dimensions, volume, surface area, images
3. **Features** - All recognized features with dimensions
4. **Operations** - Detailed operation list with cycle times
5. **Machine Utilization** - Per-machine cost breakdown
6. **Secondary Processes** - Additional services
7. **Cost Breakdown** - Line-item costs

### 2.7 Multi-tenancy
- [x] Organization-based isolation
- [x] Role-based access (Owner, Admin, Estimator, Viewer)
- [x] Tenant-specific settings

### 2.8 Payments
- [x] PayPal integration ✅ (Configured with Sandbox credentials)
- [ ] Subscription management
- [ ] Invoice generation

#### PayPal Configuration
- **App Name:** Trendsetter
- **Mode:** LIVE ✅
- **Client ID:** ATZ-Fd4SaRgZUMmCbJXfVmOJPstFSppWKRcM7JP-9BycBNj_zQhdKYYnGTGFVLN-SlcrtumAIHUgWzOU

**Live Plan IDs:**
| Plan | PayPal Plan ID |
|------|---------------|
| Starter (₹499/mo) | P-9X279748U0723413DNJS5LWI |
| Professional (₹999/mo) | P-69544072LW9580120NJS5MRA |
| Enterprise (₹2,499/mo) | P-3S360357G5696312UNJS5NCA |

**Webhook ID:** `24996274KH4619641`

---

## 3. Pricing Plans

| Feature | **FREE** | **STARTER** ₹499/mo | **PRO** ₹999/mo | **ENTERPRISE** ₹2,499/mo |
|---------|----------|---------------------|------------------|--------------------------|
| Calculations | 5/mo | 25/mo | Unlimited | Unlimited |
| Feature Recognition | Basic | Advanced | Advanced | Advanced |
| Machines | 2 | 5 | Unlimited | Unlimited |
| Excel Export | ❌ | ✅ | ✅ | ✅ |
| Model Images | ❌ | ✅ | ✅ | ✅ |
| Secondary Processes | 3 | 5 | All | All |
| Multi-user | ❌ | 2 | 5 | Unlimited |
| PayPal | ❌ | ✅ | ✅ | ✅ |

---

## 4. Monthly Operating Costs

| Service | Cost |
|---------|------|
| Cloudflare Pages | ₹0 (free) |
| Cloudflare D1 | ₹0 (5MB free) |
| File Storage | ₹0-100 |
| Email | ₹0 |
| Domain | Already owned |
| **Total** | **₹0-100/mo** |

---

## 5. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare CDN                           │
│                 (track.costinghub.com)                       │
└─────────────────────────────┬───────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Cloudflare   │    │  Cloudflare   │    │   Python CAD  │
│    Pages      │    │      D1       │    │   Processor   │
│  (Next.js)    │    │   (SQLite)    │    │   (Optional)  │
└───────────────┘    └───────────────┘    └───────────────┘
                              │
                              ▼
                     ┌───────────────┐
                     │  Cloudflare   │
                     │      R2       │
                     │ (File Storage)│
                     └───────────────┘
```

---

## 6. Files Created

```
/workspace/project/trendsetter/
├── SPEC.md                    # This file
├── README.md                  # Project documentation
├── DEPLOYMENT.md              # Cloudflare deployment guide
├── package.json
├── wrangler.toml              # Cloudflare config
├── cloudflare-pages.json
├── .env.example
├── .env                       # Local development
├── drizzle/
│   └── schema.sql            # D1 database schema
├── prisma/
│   └── schema.prisma         # (legacy - using D1 instead)
├── src/
│   ├── app/
│   │   ├── page.tsx          # Landing page
│   │   ├── auth/             # Auth pages
│   │   └── (dashboard)/      # Dashboard pages
│   ├── lib/
│   │   ├── d1.ts            # D1 database client
│   │   ├── cad/             # Feature recognition
│   │   ├── cost/             # Cost calculator
│   │   └── report/           # Excel export
│   └── types/
└── python-services/
    └── cad-processor/        # Python CAD service
```

---

## 7. Development Status

| Component | Status |
|-----------|--------|
| Project Setup | ✅ Complete |
| Database (D1) | ✅ Schema Ready |
| Authentication | ✅ Basic Complete |
| Landing Page | ✅ Complete |
| Dashboard | ✅ Complete |
| Upload & Analysis | ✅ Complete |
| Machine Database | ✅ Complete |
| Cost Calculator | ✅ Complete |
| Excel Reports | ✅ Complete |
| PayPal Integration | ✅ **Configured (Sandbox)** |
| Subscription Pages | ✅ Complete |
| Email Service | ⏳ Pending |
| Google OAuth | ⏳ Future |

---

## 8. Next Steps

1. [x] ~~Add PayPal credentials~~ ✅ Done!
2. [ ] Create D1 database on Cloudflare
3. [ ] Push schema to D1
4. [ ] Deploy to Cloudflare Pages
5. [ ] Configure track.costinghub.com
6. [ ] Configure email service (user will do later)
7. [ ] Test all features
8. [ ] Create PayPal products/plans (in PayPal Dashboard)
9. [ ] Launch! 🚀

---

**Ready for deployment!** 🚀
