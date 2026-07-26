# Trendsetter - 3D Feature Recognition Machining Cost Calculator

**SaaS Application for Instant Machining Cost Estimation**

Trendsetter is a B2B SaaS application that automates machining cost estimation by analyzing 3D CAD files (.step, .stp, .iges, .stl) and recognizing manufacturing features automatically.

## 🚀 Features

### Core Features
- **Automatic Feature Recognition** - AI-powered detection of holes, pockets, slots, bosses, threads
- **Machine Database** - User-editable database with MHR, setup costs, efficiency factors
- **Cycle Time Calculation** - Accurate machining time based on geometry and machine capabilities
- **Multi-Setup Support** - Handle complex parts with multiple setups
- **Secondary Processes** - Support for painting, plating, heat treatment, inspection, etc.
- **Markup Configuration** - Editable overhead, profit, and sales margins

### Report Generation
- **Excel Export** - Multi-sheet reports with:
  - Summary with total costs
  - Model information (dimensions, volume, surface area)
  - Feature recognition results
  - Operation breakdown with cycle times
  - Machine utilization summary
  - Detailed cost breakdown
  - Model images (top, front, isometric views)

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Three Fiber** (3D Viewer)
- **Zustand** (State Management)

### Backend
- **Node.js** (API)
- **Python FastAPI** (CAD Processing)
- **Prisma** (ORM)
- **PostgreSQL** (Database)

## 📁 Project Structure

```
trendsetter/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # Authentication pages
│   │   ├── (dashboard)/       # Dashboard pages
│   │   └── api/              # API routes
│   ├── components/           # React components
│   ├── lib/                  # Utilities
│   │   ├── cad/              # CAD parsing
│   │   ├── cost/             # Cost calculation
│   │   └── report/           # Report generation
│   └── types/                # TypeScript types
├── prisma/
│   └── schema.prisma         # Database schema
├── python-services/
│   └── cad-processor/        # Python CAD service
└── SPEC.md                   # Detailed specification
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL

### Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Start development server
npm run dev
```

## 📊 Cost Estimation Flow

1. **Upload CAD File** - User uploads .step, .stp, .iges, or .stl file
2. **Feature Recognition** - System identifies machining features
3. **Machine Selection** - Select appropriate machines from database
4. **Cycle Time Calculation** - Calculate machining time
5. **Cost Calculation** - Apply MHR, overhead, and profit margins
6. **Report Generation** - Export Excel report with all details

## 💰 Pricing Plans

| Feature | Free | Professional | Enterprise |
|---------|------|--------------|------------|
| Calculations/month | 5 | Unlimited | Unlimited |
| Excel Export | ✓ | ✓ | ✓ |
| Multi-user | - | - | ✓ |

---

Built for machine shops worldwide

**© 2027 Trendsetter**
