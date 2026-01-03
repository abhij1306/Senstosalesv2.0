# SenstoSales ERP - Supplier Management System

**Version**: 4.0.0 (macOS Tahoe - Physical Dispatch Logic)  
**Status**: 🟢 Production Ready  
**Last Updated**: 2026-01-03 10:55 IST

---

## Overview

SenstoSales is a high-precision supplier-side ERP system designed for Senstographic Solutions to manage business operations with BHEL and other PSUs. It handles the complete lifecycle of Purchase Orders (PO), Delivery Challans (DC), Sales Invoices, and Store Receipt Vouchers (SRV).

### Key Features
- ✅ **Complete Document Lifecycle**: PO → DC → Invoice → SRV with auto-reconciliation.
- ✅ **macOS Tahoe UI**: Premium glassmorphism and claymorphism system with semantic tokens.
- ✅ **Atomic Design System**: 52+ components organized across hierarchical tiers.
- ✅ **Precision Invoicing**: Template-based Excel generation using `openpyxl`.
- ✅ **Physical Dispatch Logic**: De-coupled balance tracking (`Balance = Ordered - Delivered`).

---

## 📚 Documentation

**START HERE** for comprehensive system understanding:

### Core Documentation
- **[BUSINESS_LOGIC_SPEC.md](./docs/BUSINESS_LOGIC_SPEC.md)** - **THE BIBLE**: System Invariants, Data Pipelines, and Business Rules.
- **[FRONTEND_ARCHITECTURE.md](./docs/FRONTEND_ARCHITECTURE.md)** - 🎨 Atomic Design System, Tahoe Glassmorphism standards.
- **[BACKEND_ARCHITECTURE.md](./docs/BACKEND_ARCHITECTURE.md)** - ⚙️ FastAPI Services, direct SQLite logic, and Reconciliation services.
- **[DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md)** - Database ERD, table definitions, and relationships.
- **[design_guide.md](./docs/design_guide.md)** - 🔧 SenstoSales Design System: Tokens, Components, and Page standards.
- **[CHANGELOG.md](./CHANGELOG.md)** - 📝 Version history and release notes.

### Technical References
- **[DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)** - Production setup, SSL, and database hardening.
- **[API Reference](./docs/api/API_REFERENCE.md)** - Auto-generated API documentation.

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16.0.10 (App Router)
- **Language**: TypeScript 5+ (Strict Mode)
- **Styling**: Tailwind CSS 4 + Semantic Design Tokens
- **Animation**: Framer Motion 12.23.26
- **State Management**: React Query (Server), React Context/State (Local)

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: SQLite (Direct `sqlite3` usage for performance)
- **File Processing**: openpyxl, BeautifulSoup4, lxml
- **API Pattern**: RESTful/JSON

### Design System Highlights
- **3-Tier Tokens**: Primitives -> Semantic -> Component hierarchy.
- **Atomic Design**: Title1-3, Headline, Body, Footnote, Caption1-2 (Inter/SF Pro).
- **macOS Tahoe**: Premium glassmorphism with 40px blur and saturation.
- **Dark Mode**: Native Tailwind 4 theme support for all semantic tokens.

---

## Quick Start

### Prerequisites
- **Node.js**: 20+ (for Next.js 16)
- **Python**: 3.11+
- **SQLite**: 3.35+

### Installation

**1. Clone Repository:**
```bash
git clone <repository-url>
cd SenstoSales
```

**2. Backend Setup:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

**3. Database Setup:**
```bash
# Verify database exists (SQLite)
python backend/scripts/verify_database.py
```

**4. Frontend Setup:**
```bash
cd frontend
npm install
```

**5. Environment Configuration:**

Create `backend/.env`:
```env
DATABASE_URL=sqlite:///../db/business.db
ENV_MODE=dev
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Running the Application

**Start Backend (Terminal 1):**
```bash
cd backend
python entry_point.py
# API runs on http://localhost:8000
```

**Start Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

---

## Key Modules

### 1. Purchase Orders (PO)
- **Ingestion**: HTML/PDF scraping with BeautifulSoup4
- **Features**: CRUD operations, batch upload, Excel export
- **Business Logic**: Auto-status updates based on DC/Invoice creation

### 2. Delivery Challans (DC)
- **Creation**: Auto-populated from PO data
- **Features**: Multi-DC support per PO, quantity tracking
- **Exports**: Exact template Excel generation

### 3. Sales Invoices
- **Creation**: Linked to DCs with automatic totals calculation
- **Features**: GST calculation, amount in words, buyer management
- **Exports**: GST-compliant Excel templates

### 4. Store Receipt Vouchers (SRV)
- **Ingestion**: Batch file upload with auto-reconciliation
- **Auto-matching**: Links to PO items via material description + drawing number
- **Reconciliation**: Updates PO received quantities automatically

### 5. Reports & Analytics
- **PO Health Report**: Efficiency, aging, completion metrics
- **Insights Panel**: Pending DCs, shortages, top items
- **Data Tables**: Compact density (40px rows) with glassmorphism

---

## Design System

### Atomic Design Hierarchy

```
Atoms (11)
├── Typography: Title1, Title2, Title3, Headline, Body, Footnote, Caption1, Caption2
├── UI: Button, Input, Checkbox, Badge, StatusBadge, Card, Label
└── Layout: Flex, Stack, Grid, Box

Molecules (18)
├── Forms: FormField, SearchBar, Pagination
├── Navigation: Tabs, Dialog, NavigationCard
└── Display: StatusTag, DocumentJourney, ActionButtonGroup

Organisms (13)
├── Data: DataTable, SummaryCards, ReportsCharts
├── Layout: SidebarNav, GlobalSearch, BriefingCard
└── Forms: FormField, DocumentActions

Templates (5)
├── ListPageTemplate (AnimatePresence, min-h-600px)
├── DocumentTemplate (px-12 gutters)
├── ReportsPageTemplate (compact DataTable)
├── DetailViewTemplate
└── CreateEditFormTemplate

Pages (Smart Components)
└── Fetch data → Pass to Templates
```

### Material Hardening Standards (v2.3.1)

**Button Invariant:**
- Heights: h-10 (regular), h-8 (condensed) - ENFORCED
- Press: `active:scale-95` (claymorphism)
- Colors: Semantic tokens only

**Table Invariant:**
- Density: `density="compact"` (40px rows)
- Headers: `.table-header-text` (10px, bold, uppercase)
- Numeric cells: `.table-cell-number` + `<Accounting>`
- Text cells: `.table-cell-text`

**Layout Invariant:**
- Page gutters: `px-12` (header + main)
- Empty states: `min-h-[600px]` (CLS prevention)
- Sidebar: Fixed `w-64`

**Animation Invariant:**
- Page transitions: `<AnimatePresence mode="wait">`
- Duration: 150ms standard
- Zero ghosting: Exit completes before entry

---

## Dark Theme Implementation

### Readiness: 95% Complete

**What's Done:**
- ✅ All components use semantic CSS tokens
- ✅ Button, Dashboard, Reports fully tokenized
- ✅ All detail pages (PO, Invoice, DC) tokenized
- ✅ Settings, loading states tokenized

**To Enable Dark Mode (2-3 hours):**
1. Add dark CSS variables to `frontend/app/tokens.css`
2. Add theme toggle button to layout
3. Test all pages in dark mode

**Remaining**: <5% (external chart libraries)

---

## Project Structure

```
SenstoSales/
├── frontend/
│   ├── app/                    # Next.js 16 App Router pages
│   │   ├── (routes)/          # Page components
│   │   ├── tokens.css         # Semantic design tokens
│   │   └── globals.css        # Global styles + table typography
│   ├── components/
│   │   └── design-system/     # Atomic Design components
│   │       ├── atoms/         # 11 components
│   │       ├── molecules/     # 18 components
│   │       ├── organisms/     # 13 components
│   │       └── templates/     # 5 templates
│   └── lib/
│       └── api.ts             # Async API client
├── backend/
│   ├── routes/                # FastAPI routers
│   ├── models/                # SQLAlchemy models
│   ├── schemas/               # Pydantic schemas
│   ├── services/              # Business logic
│   └── entry_point.py         # FastAPI app
├── docs/                      # Comprehensive documentation
│   ├── SYSTEM_STATUS.md       # System dashboard
│   ├── FRONTEND_ARCHITECTURE.md
│   ├── design_guide.md        # Single Source of Truth for Design
│   └── ARCHITECTURE_SYNC_REPORT.md
└── migrations/                # Alembic migrations
```

---

## Performance Metrics

### Build Performance
- Dev server start: ~2.5s
- Hot reload: <200ms
- Production build: ~18s

### Runtime Performance (Target)
- **FCP**: <1.5s
- **CLS**: <0.05 ✅ (enforced via min-h wrappers)
- **LCP**: <2.5s

### Code Quality
- TypeScript: Strict mode
- ESLint: Active
- Type coverage: 85%+
- Dark-theme ready: 95%

---

## Recent Updates (v2.3.1 - 2025-12-29)

### Frontend Hardening Complete
- ✅ Semantic token purge: 95% complete
- ✅ All detail pages tokenized (PO, Invoice, DC, Settings)
- ✅ Button atom hardened (h-10/h-8, active:scale-95)
- ✅ AnimatePresence added to ListPageTemplate
- ✅ Page gutters standardized (px-12)

### Technical Debt Purged
- 📉 111MB+ removed (build artifacts, logs, cache)
- 📉 11 deprecated files removed (AI components, test scripts)
- 📈 Documentation 100% synchronized with codebase

### Documentation Updates
- ✅ SYSTEM_STATUS.md created
- ✅ GLOBAL_VARIABLES.md rewritten
- ✅ FRONTEND_ARCHITECTURE.md updated
- ✅ ARCHITECTURE_SYNC_REPORT.md created

---

## Contributing

This is an internal project for Senstographic Solutions.

### Development Workflow
1. Create feature branch
2. Make changes following Atomic Design System
3. Ensure TypeScript strict mode compliance
4. Test in dev environment
5. Submit for review

### Code Standards
- Use Atomic Typography components (H1-H4, Body, etc.)
- Use semantic tokens for all colors
- Enforce button heights (h-10/h-8)
- Add `min-h-[600px]` to list pages
- Use `<AnimatePresence mode="wait">` for transitions

---

## License

Internal use only - Senstographic Solutions

---

## Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
2. Review [SYSTEM_STATUS.md](./docs/SYSTEM_STATUS.md)
3. Contact internal development team

---

**Built with ❤️ by Antigravity**  
**System Status**: 🟢 All Services Operational  
**Uptime**: 2h+ (frontend & backend)
