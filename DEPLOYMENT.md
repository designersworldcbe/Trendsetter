# Deployment Guide - Trendsetter
## track.costinghub.com on Cloudflare

This guide covers deploying Trendsetter to Cloudflare Pages with D1 database.

---

## Prerequisites

1. **Cloudflare Account** with:
   - Pages (free tier)
   - D1 Database (free tier up to 5MB)
   - Domain: costinghub.com

2. **Wrangler CLI** installed:
   ```bash
   npm install -g wrangler
   ```

3. **Node.js 18+**

---

## Step 1: Create D1 Database

```bash
# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create trendsetter-db

# Note the database_id from output
```

---

## Step 2: Initialize Database Schema

Create the schema file:

```bash
# Create migrations directory
mkdir -p drizzle

# Push schema to D1
wrangler d1 execute trendsetter-db --remote --file=./drizzle/schema.sql
```

Or use the CLI interactively:

```bash
wrangler d1 execute trendsetter-db --remote --command="
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    name TEXT,
    organization_id TEXT,
    role TEXT DEFAULT 'USER',
    created_at TEXT DEFAULT (datetime('now'))
  );
  -- Add more tables...
"
```

---

## Step 3: Configure Domain (track.costinghub.com)

### Option A: Cloudflare Pages (Recommended)

1. Go to **Cloudflare Dashboard → Pages**
2. Click **Create a project**
3. Connect your GitHub repository OR upload directly
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `.next`
5. Under **Custom domains**, add `track.costinghub.com`
6. Select your zone (costinghub.com)

### Option B: Workers + Pages

1. Create a Worker
2. Configure the Pages project
3. Add custom domain in **Settings → Domains**

---

## Step 4: Set Environment Variables

### In Cloudflare Dashboard:

Go to **Pages → Your Project → Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `file:local.db` (for D1 binding) |
| `DATABASE_AUTH_TOKEN` | Your D1 auth token |
| `D1_DATABASE_ID` | Your D1 database ID |
| `NEXT_PUBLIC_APP_URL` | `https://track.costinghub.com` |
| `NEXTAUTH_URL` | `https://track.costinghub.com` |
| `NEXTAUTH_SECRET` | Generate a secure random string |
| `PAYPAL_CLIENT_ID` | (from PayPal developer dashboard) |
| `PAYPAL_CLIENT_SECRET` | (from PayPal developer dashboard) |
| `PAYPAL_MODE` | `sandbox` or `live` |

### Set secrets via CLI:

```bash
wrangler secret put NEXTAUTH_SECRET
# Enter a secure random string

wrangler secret put DATABASE_AUTH_TOKEN
# Enter your D1 auth token
```

---

## Step 5: Update Configuration

Edit `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "trendsetter-db"
database_id = "your-actual-database-id"
```

---

## Step 6: Deploy

### Deploy to Preview:
```bash
wrangler pages deploy .next
```

### Deploy to Production:
```bash
wrangler pages deploy .next --project-name=trendsetter
```

Or push to GitHub and enable auto-deploy:

1. Push to GitHub
2. Go to **Pages → Your Project → Builds and deployments**
3. Enable **Cloudflare CI**
4. Set trigger: `main` branch

---

## Step 7: Verify Deployment

1. Visit `https://track.costinghub.com`
2. Test basic functionality
3. Check for console errors
4. Verify SSL certificate (should be automatic)

---

## Troubleshooting

### Database Connection Issues
```bash
# Check D1 status
wrangler d1 info trendsetter-db

# Test query
wrangler d1 execute trendsetter-db --remote --command="SELECT 1"
```

### Build Failures
```bash
# Check build locally
npm run build

# Clear cache
wrangler pages project delete trendsetter --no-confirm
```

### Environment Variables Not Loading
- Rebuild after adding environment variables
- Check variable names match exactly
- Use `NEXT_PUBLIC_` prefix for client-side variables

---

## PayPal Configuration

### ✅ LIVE MODE CONFIGURED!

| Setting | Value |
|---------|-------|
| **App Name** | Trendsetter |
| **Mode** | **LIVE** ✅ |
| **Client ID** | `ATZ-Fd4SaRgZUMmCbJXfVmOJPstFSppWKRcM7JP-9BycBNj_zQhdKYYnGTGFVLN-SlcrtumAIHUgWzOU` |
| **Secret Key** | `ED1EJL0Jwyn6qCMYl-UkLWgw80u-s6uLDYeSS1w8HAyR0uR7TDIsag-feOGAeX1TbOZWsMzJUTu4THGP` |

### Live Plan IDs:
| Plan | Price | PayPal Plan ID |
|------|-------|----------------|
| Starter | ₹499/month | `P-9X279748U0723413DNJS5LWI` |
| Professional | ₹999/month | `P-69544072LW9580120NJS5MRA` |
| Enterprise | ₹2,499/month | `P-3S360357G5696312UNJS5NCA` |

### Webhook Setup (Required for live payments):
1. Go to **Applications → Webhooks** in PayPal Dashboard
2. Create webhook for: `https://track.costinghub.com/api/paypal/webhook`
3. Subscribe to events:
   - `BILLING.SUBSCRIPTION.CREATED`
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `PAYMENT.SALE.COMPLETED`
4. Copy Webhook ID and add to environment:
   ```bash
   wrangler secret put PAYPAL_WEBHOOK_ID
   # Enter your webhook ID
   ```

---

## SMTP/Email Configuration

For production email sending:

### Option 1: Cloudflare Email Routing (Free)
1. Go to **Dashboard → Email → Email Routing**
2. Add `costinghub.com`
3. Create routing rules

### Option 2: Resend (Recommended for SaaS)
```bash
npm install resend
```
- Free tier: 100 emails/day
- Easy integration

### Option 3: SendGrid
```bash
npm install @sendgrid/mail
```

### Option 4: Gmail SMTP (Limited)
- Less reliable for bulk sending
- May have rate limits

---

## Monitoring & Analytics

- **Cloudflare Analytics**: Built-in dashboard
- **Error Tracking**: Use Sentry or Cloudflare Analytics
- **Performance**: Cloudflare Web Analytics (free)

---

## Cost Estimate (Monthly)

| Service | Free Tier | Paid (if needed |
|---------|-----------|----------------|
| Cloudflare Pages | ✅ Unlimited | - |
| Cloudflare D1 | 5MB | $5/GB |
| Bandwidth | Unlimited | - |
| SSL | ✅ | - |
| Email Routing | Free | - |
| **Total** | **$0** | **$0-5** |

---

## Next Steps After Deployment

1. ✅ Verify all pages load correctly
2. ✅ Test user registration/login
3. ✅ Test file upload functionality
4. ✅ Configure PayPal for payments
5. ✅ Set up custom email sender
6. ✅ Enable Google OAuth (optional)
7. ✅ Set up monitoring/alerts
8. ✅ Configure backup for D1

---

## Support

- **Cloudflare Docs**: https://developers.cloudflare.com/
- **D1 Docs**: https://developers.cloudflare.com/d1/
- **Pages Docs**: https://developers.cloudflare.com/pages/

---

Built with ❤️ for machine shops worldwide
**© 2027 Trendsetter**
