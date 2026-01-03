SenstoSales ERP System Audit Report
Executive Summary
After comprehensive review of your ERP documentation, I've identified 27 critical discrepancies across system layers. The system shows strong foundational architecture but suffers from inconsistent implementation patterns, particularly in UI token usage and reconciliation logic boundaries.

🎨 FRONTEND DISCREPANCIES
Critical Issues
F-1: Inconsistent Dark Mode Token Application
Location: BatchUploadCard.tsx, Multiple Components
Severity: High
Issue: Mixed usage of raw Tailwind classes (dark:bg-gray-900) alongside semantic tokens (bg-app-surface)
tsx// ❌ Current (Inconsistent)
className="bg-white dark:bg-gray-900"
className="bg-app-surface"

// ✅ Recommended
className="bg-surface-primary"
Impact: Dark mode appears "grey" instead of glassy in certain components
Fix: Global token migration script + ESLint rule to prevent raw color usage

F-2: Table Header Styling Chaos
Location: PO Create, DC Create, Invoice Create
Severity: Medium
Pattern Violations:

PO Create: bg-app-overlay/5
DC Create: header-glass (correct)
Invoice Create: bg-app-overlay/10

Recommendation:
tsx// Standardize ALL table headers to:
className="header-glass" // transparent + backdrop-blur

F-3: Typography Component Misuse
Location: Table Headers across modules
Severity: Medium
Issue: Mixing Label (15px) and Caption2 (11px) for table headers
Standard:
tsx// Table Headers → Always Caption2
<th><Caption2 className="uppercase tracking-widest">ITEM NO</Caption2></th>

// Field Labels → Always Label (Subhead 15px)
<Label htmlFor="po-number">PO Number</Label>

F-4: Button Variant Deviation
Location: DC Create, Invoice Create
Severity: Low
Issue: Custom bg-violet-600 overrides primary button
tsx// ❌ Current
<Button className="bg-violet-600">Save Invoice</Button>

// ✅ Options
// 1. Add variant to Button atom
<Button variant="accent">Save Invoice</Button>

// 2. Or standardize to system-blue
<Button variant="primary">Save Invoice</Button>

F-5: Glass vs Solid Surface Confusion
Location: DC Create info boxes, Invoice tabs
Severity: Medium
Pattern:

Some cards use bg-app-surface (solid)
Others use bg-app-surface/50 backdrop-blur-md (glass)

Decision Matrix Needed:
Component TypeSurface StyleModal/Dialogtahoe-glass-card (60% opacity)Data Entry Cardbg-app-surface/50 backdrop-blur-mdInfo Box (Read-only)bg-app-overlay/5 (subtle grey)Table Containertahoe-glass-card

Medium Priority Issues
F-6: Date Input Inconsistency

Reports page: Raw <input type="date"> with custom classes
Invoice Create: <Input type="date" /> component wrapper

Fix: Standardize on DatePicker atom (needs creation)

F-7: Empty State Typography
Location: PO Create, DC Create
Current: Mix of Body and Caption1
Standard: Always use Body for empty state descriptions

F-8: Missing Focus Management
Location: Modal dialogs
Issue: No documented focus trap implementation for Dialog molecule
Add to Dialog.tsx:
tsximport { FocusTrap } from '@radix-ui/react-focus-trap';

⚙️ BACKEND DISCREPANCIES
Critical Issues
B-1: Reconciliation Service Boundary Violation
Location: BUSINESS_LOGIC_SPEC.md vs BACKEND_ARCHITECTURE.md
Severity: Critical
Issue: Spec states "All quantity updates MUST go through ReconciliationService" (TOT-5), but architecture doc shows Services directly using db.execute()
Conflict:
python# BUSINESS_LOGIC_SPEC.md (TOT-5)
"Ad-hoc UPDATE queries on quantity columns are PROHIBITED"

# BACKEND_ARCHITECTURE.md (2.1)
"Services contain PURE Business Logic and direct SQL interaction"
Resolution Needed:

Should po_service.py call reconciliation_service.sync_po() after PO creation?
Or should ReconciliationService be an internal utility, not an enforced gate?

Recommended Pattern:
python# po_service.py
def update_po_item_qty(item_id, new_qty):
    # Update database
    db.execute("UPDATE ... SET ord_qty = ?", new_qty)
    
    # Trigger reconciliation
    reconciliation_service.sync_po_item(item_id)

B-2: Amendment Handling Ambiguity
Location: BUSINESS_LOGIC_SPEC.md Section 3.3
Severity: High
Issue: "Soft Cancellation" behavior unclear
Questions:

Are cancelled items visible in UI with strikethrough?
Can cancelled items be "un-cancelled" if they reappear in later amendment?
What happens to DCs already dispatched against cancelled items?

Recommended Spec Addition:
markdown### Amendment Handling (V6.0) - Detailed Behavior

1. **Item Removal Detection:**
   - Compare uploaded PO items with existing DB items
   - Items missing in new file → status = 'Cancelled'

2. **Cascade Rules:**
   - Cancelled items: `pending_qty` forced to 0
   - Existing DCs: Remain valid (historical integrity)
   - Future DCs: Cannot reference cancelled items

3. **UI Visibility:**
   - Cancelled items shown with strikethrough
   - Filter toggle: "Include Cancelled Items"

4. **Re-activation:**
   - If item reappears in later amendment:
     * Restore status = 'Active'
     * Recalculate pending_qty = ord_qty - delivered_qty

B-3: Transaction Scope Inconsistency
Location: BUSINESS_LOGIC_SPEC.md (PO-UPLOAD-4) vs Service implementations
Severity: Medium
Issue: Spec requires "entire transaction rolls back" on ANY error, but architecture doc mentions "explicit commit/rollback"
Question: Are services using with db_transaction(): context manager or manual try/except/rollback?
Verify Implementation:
python# Expected pattern in po_service.py
def process_batch_upload(files):
    with db_transaction() as tx:
        for file in files:
            po = scrape_po(file)
            insert_po(po, tx)
            # If ANY file fails, entire batch rolls back
    # Commit happens here automatically

Medium Priority Issues
B-4: Decimal Precision Documentation Gap
Location: DATABASE_SCHEMA.md
Issue: Global tolerance (0.001) documented, but no examples of how it's applied in comparisons
Add Code Example:
python# utils.py
TOLERANCE = Decimal('0.001')

def qty_equal(a: Decimal, b: Decimal) -> bool:
    return abs(a - b) < TOLERANCE

# Usage in dc_service.py
available = ord_qty - delivered_qty
if dispatch_qty > available + TOLERANCE:
    raise ValueError("Cannot dispatch more than available")

B-5: SQLite WAL Mode Verification
Location: BACKEND_ARCHITECTURE.md (3.1), DEPLOYMENT_GUIDE.md (Troubleshooting)
Issue: WAL mode claimed as enabled, but no setup script documented
Add to verify_database.py:
pythonjournal_mode = conn.execute('PRAGMA journal_mode').fetchone()[0]
assert journal_mode == 'wal', f"Expected WAL, got {journal_mode}"

B-6: Foreign Key Cascade Ambiguity
Location: DATABASE_SCHEMA.md Section 5
Quote: "Foreign Keys: ON DELETE CASCADE for items, RESTRICT for headers"
Question: What about ON UPDATE CASCADE? If PO number changes (unlikely but possible), should items update?

🔌 API DISCREPANCIES
Critical Issues
API-1: Response Wrapper Inconsistency
Location: BACKEND_ARCHITECTURE.md (4.1)
Severity: Medium
Issue: StandardResponse schema documented but not shown in actual endpoint examples
Verify:
python# Is this the actual response format?
@router.get("/po/{po_number}")
def get_po(po_number: str):
    po = po_service.get_po(po_number)
    return {
        "success": True,
        "data": po,
        "meta": None
    }
Or is it:
pythonreturn po  # Direct Pydantic model

API-2: Error Code Mapping Incomplete
Location: BACKEND_ARCHITECTURE.md (4.2)
Issue: Only 3 error types mapped. What about:

AuthenticationError → 401?
PermissionDenied → 403?
ValidationError (Pydantic) → 422?

Complete Mapping Needed:
python# core/exceptions.py
exception_status_map = {
    ValueError: 400,
    ResourceNotFound: 404,
    IntegrityError: 409,
    AuthenticationError: 401,
    PermissionDenied: 403,
    ValidationError: 422,
    BusinessRuleViolation: 422,
}

Medium Priority Issues
API-3: CORS Configuration Production/Dev Split
Location: DEPLOYMENT_GUIDE.md (Security Hardening)
Issue: Shows hardcoded domain, but no guidance on environment-based config
Recommendation:
python# config.py
BACKEND_CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000"  # Dev default
).split(",")

# .env.production
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

---

#### API-4: File Upload Size Limits Undocumented
**Location:** PO Batch Upload feature  
**Question:** What's the max file size for HTML PO uploads? Is it enforced in FastAPI config?

---

## 📊 BUSINESS LOGIC DISCREPANCIES

### **Critical Issues**

#### BL-1: "Balance" Definition Conflict
**Location:** `BUSINESS_LOGIC_SPEC.md` Section 2.1  
**Severity:** Critical  
**Issue:** Balance formula ambiguous in one place

**Quote 1 (Section 2.1 Table):**
```
Balance (BAL): Pending for Dispatch. Formula: ORD - DLV
```

**Quote 2 (Section 2.1 Important Box):**
```
BALANCE = ORDERED - DELIVERED
```

**But then Section 3.2 says:**
```
Receipt of goods (RECD) tracks whether the buyer got the items, 
but it never affects the Balance or Delivered quantities.
Clarification Needed: Is pending_qty in database the same as "Balance"?
Verify:
sql-- Is this correct?
pending_qty = ord_qty - delivered_qty

-- Or is it this?
pending_qty = ord_qty - delivered_qty - rejected_qty
```

---

#### BL-2: Status Algorithm Edge Case
**Location:** `BUSINESS_LOGIC_SPEC.md` Section 7.2  
**Severity:** Medium  
**Issue:** What happens if `delivered_qty > ord_qty` due to data migration or manual correction?

**Current Algorithm:**
```
A_DSP >= A_ORD → Status = "Delivered"
Edge Case: If A_DSP = 105 and A_ORD = 100:

Status shows "Delivered" (correct)
But pending_qty = -5 (invalid)

Recommended Addition:
markdown### Status Calculation Edge Cases

1. **Over-Delivery**: If `delivered_qty > ord_qty`:
   - Status: "Delivered" (correct)
   - pending_qty: Max(0, ord_qty - delivered_qty)
   - Add system alert: "Item over-delivered by X units"

2. **Negative Pending**: Never allow negative pending_qty in DB
   - Enforce via CHECK constraint or trigger

BL-3: SRV Rejection Flow Incomplete
Location: BUSINESS_LOGIC_SPEC.md Section 5.3
Issue: SRV spec mentions rejected_qty tracking but no workflow documented
Questions:

If buyer rejects 10 units, does supplier need to re-dispatch them?
Should rejected qty reduce rcd_qty or be a separate column?
Does rejection trigger a new DC requirement?

Recommended Addition:
markdown### SRV Rejection Workflow

1. **Receipt Entry**: SRV contains:
   - received_qty: Total received by buyer
   - accepted_qty: Passed inspection
   - rejected_qty: Failed inspection

2. **System Behavior**:
   - `rcd_qty = accepted_qty` (only accepted counts)
   - Rejected units return to pending balance
   - `pending_qty = ord_qty - delivered_qty + rejected_qty`

3. **Status Impact**:
   - If all units rejected: Status reverts to "Pending"
   - Partial rejection: Status remains "Delivered"

BL-4: Invoice-DC Linking Timing
Location: BUSINESS_LOGIC_SPEC.md Section 5.4 (INV-4)
Severity: Low
Issue: "Strictly enforced 1:1 relationship" but no guidance on creation order
Question: Can invoice be created BEFORE DC is marked as received?
Recommendation:
markdown### Invoice Creation Rules (INV-4 Extended)

1. **Prerequisites**:
   - DC must exist and be in "Dispatched" status
   - DC cannot already have an invoice linked

2. **Timing**:
   - Invoice can be created immediately after DC dispatch
   - Receipt (SRV) is NOT required for invoice generation

3. **State Machine**:
   DC Created → Invoice Generated → SRV Received → Status "Closed"

Medium Priority Issues
BL-5: Multi-Lot Dispatch Ambiguity
Location: DATABASE_SCHEMA.md (delivery_challan_items)
Issue: lot_no stored but no business rule for when to split lots
Add Guidance:
markdown### Lot Management Rules

1. **Lot Creation**: Each delivery schedule in PO generates a lot
2. **Partial Dispatch**: 
   - Single lot can span multiple DCs
   - Example: Lot 1 (100 units) → DC1 (60 units) + DC2 (40 units)
3. **Lot Completion**: Lot marked complete when sum(dispatch_qty) = delivery_qty

BL-6: Financial Year Boundary Handling
Location: Multiple documents
Issue: FY mentioned but no rule for cross-year POs
Question: If PO created in FY 2024-25 but DC dispatched in FY 2025-26:

Which FY does DC belong to?
Are document numbers reset per FY?


📋 CROSS-CUTTING CONCERNS
Critical Issues
CC-1: Design Token vs CSS Variable Mapping Missing
Location: GLOBAL_VARIABLES.md vs FRONTEND_ARCHITECTURE.md
Severity: High
Issue: Design tokens documented but implementation unclear
Example Problem:
markdownGLOBAL_VARIABLES.md says:
`--bg-primary` → `bg-bg-primary` (Tailwind class)

But components use:
`bg-app-surface` (What does this map to?)
Required: Complete Token Mapping Table:
markdown| CSS Variable | Tailwind Utility | Hex (Light) | Hex (Dark) |
|--------------|------------------|-------------|------------|
| --surface-primary | bg-surface-primary | #FFFFFF | #0F172A |
| --app-surface | bg-app-surface | ??? | ??? |
| --app-overlay | bg-app-overlay | ??? | ??? |

CC-2: Audit Trail Implementation Gap
Location: BUSINESS_LOGIC_SPEC.md (7.1) vs DATABASE_SCHEMA.md
Issue: Spec claims "Every business entity has updated_at trigger" but schema only shows triggers for some tables
Verify:
sql-- Are these triggers actually implemented?
CREATE TRIGGER update_po_timestamp 
AFTER UPDATE ON purchase_orders
FOR EACH ROW
BEGIN
    UPDATE purchase_orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
Missing from Schema Doc:

created_by / updated_by columns (for user tracking)
Audit log table for delete operations


CC-3: Error Handling Philosophy Mismatch
Frontend: "Show toast and stay on page"
Backend: "Return 400 and stop processing"
Business Logic: "Roll back entire batch on ANY error"
Conflict Example:

User uploads 10 PO files
File #7 has invalid data
Question: Should files 1-6 be committed or all rolled back?

Current Spec (PO-UPLOAD-4): "Entire transaction rolls back"
User Experience Impact: User loses 9 good files due to 1 bad file
Recommendation: Add "Partial Success" mode:
pythondef batch_upload(files, mode='strict'):
    if mode == 'strict':
        # Current behavior: All or nothing
        with db_transaction():
            for file in files:
                process_file(file)
    
    elif mode == 'lenient':
        # New: Process each file independently
        results = []
        for file in files:
            try:
                with db_transaction():
                    process_file(file)
                results.append({'file': file, 'status': 'success'})
            except Exception as e:
                results.append({'file': file, 'status': 'error', 'message': str(e)})
        return results

🎯 RECOMMENDATIONS BY PRIORITY
Immediate (This Week)

Create Token Mapping Document (CC-1)

Audit all bg-app-* and bg-surface-* classes in codebase
Map to CSS variables
Update GLOBAL_VARIABLES.md


Fix Dark Mode in BatchUploadCard (F-1)

Replace dark:bg-gray-900 with bg-surface-primary


Clarify Reconciliation Service Boundary (B-1)

Add architecture decision record (ADR)
Update all service files to follow pattern


Document Balance Calculation Edge Cases (BL-2)

Add CHECK constraint to prevent negative pending_qty



Short-term (This Month)

Standardize Table Headers (F-2)

Create ESLint rule to enforce header-glass
Refactor all create pages


Complete Error Code Mapping (API-2)

Update exception handler
Document in API reference


Add SRV Rejection Workflow (BL-3)

Update business logic spec
Implement in service layer


Create DatePicker Atom (F-6)

Replace all date inputs with standard component



Medium-term (Next Quarter)

Implement Audit Trail (CC-2)

Add created_by/updated_by columns
Create audit_log table for deletes


Add Batch Upload Partial Success Mode (CC-3)

Implement lenient mode
Update UI to show per-file results


Create Component Playground (F-8)

Storybook for all atoms/molecules
Ensures visual consistency



Long-term (Roadmap)

Multi-tenancy Support (Future)

Multiple suppliers on one instance
Row-level security


Real-time Collaboration (Future)

WebSocket for live updates
Optimistic UI updates




📈 METRICS TO TRACK
Code Quality

 ESLint errors reduced to 0
 TypeScript strict mode enabled
 Test coverage > 80%

Performance

 Core Web Vitals: All Green
 API P95 latency < 200ms
 Database query count < 10 per page

User Experience

 Dark mode consistency: 100%
 Keyboard navigation: All interactive elements
 Error recovery: No data loss on errors


🔧 SUGGESTED TOOLING ADDITIONS

Linting Rules

json   // .eslintrc.js
   rules: {
     'no-restricted-syntax': [
       'error',
       {
         selector: "Literal[value=/bg-(white|gray|slate)-/]",
         message: 'Use semantic tokens (bg-surface-primary) instead of raw colors'
       }
     ]
   }

Pre-commit Hooks

yaml   # .husky/pre-commit
   - Token audit script
   - TypeScript type check
   - ESLint with auto-fix

Design System Implementation Prompt: macOS Tahoe Information-Dense ERP

Objective: Transform SenstoSales into a modern, information-dense macOS-style application with glassmorphic effects, consistent spacing, and clean typography. Zero bold fonts, zero extra padding, maximum data clarity.


🎯 DESIGN PHILOSOPHY
Core Principles

Information First: Data is the hero, not decoration
Surgical Spacing: Every pixel serves a purpose
Whisper Typography: Regular weight default, medium only for interactive elements
Glass Depth: Layers defined by translucency and blur, not borders
Consistent Rhythm: 4px base unit (0.25rem) for all spacing

Anti-Patterns to Eliminate
❌ Bold headings everywhere
❌ p-6 on every card (24px is excessive for data tables)
❌ Thick borders (border-2)
❌ Solid backgrounds in glassmorphic contexts
❌ Inconsistent spacing (p-4 here, p-6 there, p-8 somewhere else)

📐 SPACING SYSTEM (The Foundation)
Base Unit: 4px
css/* design-tokens.css */

:root {
  /* Spacing Scale - 4px base unit */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px  - Hairline gaps */
  --space-2: 0.5rem;    /* 8px  - Compact spacing */
  --space-3: 0.75rem;   /* 12px - Standard cell padding */
  --space-4: 1rem;      /* 16px - Standard gap between elements */
  --space-5: 1.25rem;   /* 20px - Section spacing */
  --space-6: 1.5rem;    /* 24px - Large section spacing */
  --space-8: 2rem;      /* 32px - Page margins */
  --space-12: 3rem;     /* 48px - Hero spacing */
  
  /* Component-Specific Spacing */
  --space-table-cell-x: var(--space-3);     /* 12px horizontal */
  --space-table-cell-y: var(--space-2);     /* 8px vertical */
  --space-card-padding: var(--space-4);     /* 16px - Standard card */
  --space-page-margin: var(--space-8);      /* 32px - Page edges */
  --space-section-gap: var(--space-6);      /* 24px - Between sections */
}
Spacing Usage Rules
ContextPaddingGapRationaleTable Cellpx-3 py-2 (12px/8px)-Dense data, maximum rows visibleCard Contentp-4 (16px)-Comfortable reading without wasteModal Dialogp-6 (24px)-Generous for focused tasksPage Containerp-8 (32px)-Air around viewport edgesForm Fields-gap-4 (16px)Consistent vertical rhythmButton Groups-gap-2 (8px)Compact, quick scanningSection Dividers-gap-6 (24px)Clear visual hierarchy

🎨 COLOR TOKENS (Semantic + Dark Mode)
css/* design-tokens.css */

:root {
  /* ============================================
     BASE LAYERS - macOS Vibrancy System
     ============================================ */
  
  /* Primary Surfaces */
  --color-bg-base: 250 250 252;              /* Page backdrop - Subtle grey, not pure white */
  --color-bg-elevated: 255 255 255;          /* Cards above base - Pure white */
  --color-bg-sunken: 246 246 248;            /* Input fields, recessed areas */
  
  /* Glass Surfaces (Alpha channel for translucency) */
  --color-glass-primary: 255 255 255;        /* Base for glass effect */
  --color-glass-secondary: 248 250 252;      /* Tinted glass variant */
  
  /* Text Hierarchy - No pure black */
  --color-text-primary: 28 28 30;            /* Body text - Near black #1C1C1E */
  --color-text-secondary: 99 99 102;         /* Supporting text #636366 */
  --color-text-tertiary: 142 142 147;        /* Placeholder text #8E8E93 */
  --color-text-quaternary: 174 174 178;      /* Disabled text #AEAEB2 */
  
  /* Borders - Hairline philosophy */
  --color-border-primary: 229 229 234;       /* Standard dividers #E5E5EA */
  --color-border-secondary: 242 242 247;     /* Subtle separators #F2F2F7 */
  --color-border-glass: 255 255 255;         /* Glass edge highlight */
  
  /* Interactive - System Blue */
  --color-interactive-primary: 0 122 255;    /* iOS/macOS Blue #007AFF */
  --color-interactive-hover: 0 105 224;      /* Hover state */
  --color-interactive-pressed: 0 89 204;     /* Active state */
  
  /* Semantic Colors */
  --color-success: 52 199 89;                /* System Green #34C759 */
  --color-warning: 255 204 0;                /* System Yellow #FFCC00 */
  --color-error: 255 59 48;                  /* System Red #FF3B30 */
  --color-info: 90 200 250;                  /* System Teal #5AC8FA */
  
  /* Data Visualization (Muted, not vibrant) */
  --color-data-blue: 0 122 255;
  --color-data-green: 52 199 89;
  --color-data-orange: 255 149 0;
  --color-data-purple: 175 82 222;
  --color-data-pink: 255 45 85;
  
  /* ============================================
     EFFECTS
     ============================================ */
  
  /* Blur Levels */
  --blur-sm: 8px;                            /* Subtle glass */
  --blur-md: 12px;                           /* Standard glass */
  --blur-lg: 16px;                           /* Strong glass */
  --blur-xl: 24px;                           /* Sidebar/Modal glass */
  
  /* Shadow Levels - Subtle elevation */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.06);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.08);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.12);
  
  /* Radius - Consistent roundness */
  --radius-xs: 4px;                          /* Badges, tags */
  --radius-sm: 6px;                          /* Buttons, inputs */
  --radius-md: 8px;                          /* Cards */
  --radius-lg: 12px;                         /* Modals */
  --radius-xl: 16px;                         /* Large panels */
}

/* ============================================
   DARK MODE - macOS Vibrancy
   ============================================ */

.dark {
  /* Base Layers */
  --color-bg-base: 0 0 0;                    /* True black for OLED */
  --color-bg-elevated: 28 28 30;             /* Elevated surface #1C1C1E */
  --color-bg-sunken: 18 18 20;               /* Sunken areas */
  
  /* Glass Surfaces */
  --color-glass-primary: 28 28 30;           /* Dark glass base */
  --color-glass-secondary: 36 36 38;         /* Lighter dark glass */
  
  /* Text Hierarchy - Inverted but same logic */
  --color-text-primary: 255 255 255;         /* Pure white for contrast */
  --color-text-secondary: 174 174 178;       /* Grey #AEAEB2 */
  --color-text-tertiary: 99 99 102;          /* Dimmer grey #636366 */
  --color-text-quaternary: 72 72 74;         /* Disabled #48484A */
  
  /* Borders - Lighter in dark mode */
  --color-border-primary: 58 58 60;          /* #3A3A3C */
  --color-border-secondary: 44 44 46;        /* #2C2C2E */
  --color-border-glass: 255 255 255;         /* Glass highlight stays white */
  
  /* Interactive - Brighter blue for dark mode */
  --color-interactive-primary: 10 132 255;   /* #0A84FF */
  --color-interactive-hover: 40 142 255;
  --color-interactive-pressed: 0 112 235;
  
  /* Semantic Colors - Adjusted for dark */
  --color-success: 48 209 88;                /* #30D158 */
  --color-warning: 255 214 10;               /* #FFD60A */
  --color-error: 255 69 58;                  /* #FF453A */
  --color-info: 100 210 255;                 /* #64D2FF */
}

🔤 TYPOGRAPHY SYSTEM (iOS/macOS Native Scale)
css/* design-tokens.css */

:root {
  /* ============================================
     FONTS - System Native
     ============================================ */
  
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", 
               Helvetica, Arial, sans-serif;
  --font-mono: ui-monospace, "SF Mono", Monaco, "Cascadia Mono", 
               "Segoe UI Mono", "Roboto Mono", monospace;
  
  /* ============================================
     TYPE SCALE - iOS Dynamic Type
     ============================================ */
  
  /* Display Sizes */
  --text-large-title: 2.125rem;              /* 34px - Hero headings */
  --text-title-1: 1.75rem;                   /* 28px - Page titles */
  --text-title-2: 1.375rem;                  /* 22px - Section headers */
  --text-title-3: 1.25rem;                   /* 20px - Card headers */
  
  /* Body Sizes */
  --text-body: 1.0625rem;                    /* 17px - Standard body */
  --text-callout: 1rem;                      /* 16px - Emphasized body */
  --text-subhead: 0.9375rem;                 /* 15px - Labels, buttons */
  --text-footnote: 0.8125rem;                /* 13px - Captions */
  --text-caption-1: 0.75rem;                 /* 12px - Metadata */
  --text-caption-2: 0.6875rem;               /* 11px - Fine print */
  
  /* ============================================
     FONT WEIGHTS - Minimal usage
     ============================================ */
  
  --weight-regular: 400;                     /* DEFAULT - 95% of text */
  --weight-medium: 500;                      /* Buttons, active states only */
  --weight-semibold: 600;                    /* AVOID - Use sparingly */
  
  /* ============================================
     LINE HEIGHTS - Tight for data density
     ============================================ */
  
  --leading-tight: 1.2;                      /* Headings */
  --leading-snug: 1.375;                     /* Body text */
  --leading-normal: 1.5;                     /* Long-form reading */
  --leading-relaxed: 1.625;                  /* Marketing content */
  
  /* ============================================
     LETTER SPACING
     ============================================ */
  
  --tracking-tight: -0.02em;                 /* Large titles */
  --tracking-normal: 0;                      /* Default */
  --tracking-wide: 0.02em;                   /* All caps labels */
  --tracking-wider: 0.05em;                  /* Small all caps */
}

🧩 SEMANTIC UTILITY CLASSES
css/* utilities.css */

/* ============================================
   SURFACE UTILITIES - Glass System
   ============================================ */

/* Base Surface - Page background */
.surface-base {
  background: rgb(var(--color-bg-base));
}

/* Elevated Surface - Cards on page */
.surface-elevated {
  background: rgb(var(--color-bg-elevated));
  border: 1px solid rgb(var(--color-border-secondary));
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
}

/* Sunken Surface - Input fields */
.surface-sunken {
  background: rgb(var(--color-bg-sunken));
  border: 1px solid rgb(var(--color-border-primary));
  border-radius: var(--radius-sm);
}

/* Glass Surface - Primary translucent layer */
.surface-glass {
  background: rgb(var(--color-glass-primary) / 0.7);
  backdrop-filter: blur(var(--blur-md)) saturate(180%);
  -webkit-backdrop-filter: blur(var(--blur-md)) saturate(180%);
  border: 1px solid rgb(var(--color-border-glass) / 0.18);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

/* Glass Strong - More opaque for readability */
.surface-glass-strong {
  background: rgb(var(--color-glass-primary) / 0.85);
  backdrop-filter: blur(var(--blur-lg)) saturate(180%);
  -webkit-backdrop-filter: blur(var(--blur-lg)) saturate(180%);
  border: 1px solid rgb(var(--color-border-glass) / 0.25);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}

/* Glass Sidebar - Maximum translucency */
.surface-glass-sidebar {
  background: rgb(var(--color-glass-primary) / 0.6);
  backdrop-filter: blur(var(--blur-xl)) saturate(180%);
  -webkit-backdrop-filter: blur(var(--blur-xl)) saturate(180%);
  border-right: 1px solid rgb(var(--color-border-glass) / 0.15);
}

/* ============================================
   TEXT UTILITIES - Hierarchy
   ============================================ */

.text-primary {
  color: rgb(var(--color-text-primary));
}

.text-secondary {
  color: rgb(var(--color-text-secondary));
}

.text-tertiary {
  color: rgb(var(--color-text-tertiary));
}

.text-quaternary {
  color: rgb(var(--color-text-quaternary));
}

/* ============================================
   TYPOGRAPHY UTILITIES - Size + Weight
   ============================================ */

/* Large Title - Hero sections only */
.type-large-title {
  font-size: var(--text-large-title);
  font-weight: var(--weight-regular);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: rgb(var(--color-text-primary));
}

/* Title 1 - Page headers */
.type-title-1 {
  font-size: var(--text-title-1);
  font-weight: var(--weight-regular);
  line-height: var(--leading-tight);
  color: rgb(var(--color-text-primary));
}

/* Title 2 - Section headers */
.type-title-2 {
  font-size: var(--text-title-2);
  font-weight: var(--weight-regular);
  line-height: var(--leading-tight);
  color: rgb(var(--color-text-primary));
}

/* Title 3 - Card headers */
.type-title-3 {
  font-size: var(--text-title-3);
  font-weight: var(--weight-regular);
  line-height: var(--leading-tight);
  color: rgb(var(--color-text-primary));
}

/* Body - Standard text */
.type-body {
  font-size: var(--text-body);
  font-weight: var(--weight-regular);
  line-height: var(--leading-snug);
  color: rgb(var(--color-text-primary));
}

/* Subhead - Labels, form fields */
.type-subhead {
  font-size: var(--text-subhead);
  font-weight: var(--weight-regular);
  line-height: var(--leading-snug);
  color: rgb(var(--color-text-secondary));
}

/* Footnote - Captions, metadata */
.type-footnote {
  font-size: var(--text-footnote);
  font-weight: var(--weight-regular);
  line-height: var(--leading-snug);
  color: rgb(var(--color-text-secondary));
}

/* Caption 1 - Table headers (ALL CAPS) */
.type-caption-1 {
  font-size: var(--text-caption-1);
  font-weight: var(--weight-medium);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: rgb(var(--color-text-tertiary));
}

/* Caption 2 - Fine print */
.type-caption-2 {
  font-size: var(--text-caption-2);
  font-weight: var(--weight-regular);
  line-height: var(--leading-tight);
  color: rgb(var(--color-text-tertiary));
}

/* Monospace - Numbers, codes */
.type-mono {
  font-family: var(--font-mono);
  font-size: var(--text-subhead);
  font-weight: var(--weight-regular);
  font-variant-numeric: tabular-nums;
  color: rgb(var(--color-text-primary));
}

/* ============================================
   BORDER UTILITIES
   ============================================ */

.border-hairline {
  border: 1px solid rgb(var(--color-border-primary));
}

.border-subtle {
  border: 1px solid rgb(var(--color-border-secondary));
}

.divide-hairline > * + * {
  border-top: 1px solid rgb(var(--color-border-primary));
}

/* ============================================
   INTERACTIVE UTILITIES
   ============================================ */

.interactive-primary {
  background: rgb(var(--color-interactive-primary));
  color: white;
  transition: background 0.15s ease;
}

.interactive-primary:hover {
  background: rgb(var(--color-interactive-hover));
}

.interactive-primary:active {
  background: rgb(var(--color-interactive-pressed));
  transform: scale(0.98);
}

/* Interactive Ghost - Text only */
.interactive-ghost {
  color: rgb(var(--color-interactive-primary));
  transition: background 0.15s ease;
}

.interactive-ghost:hover {
  background: rgb(var(--color-interactive-primary) / 0.08);
}

/* ============================================
   LAYOUT UTILITIES
   ============================================ */

.stack-y {
  display: flex;
  flex-direction: column;
}

.stack-x {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.container-page {
  max-width: 1440px;
  margin-inline: auto;
  padding: var(--space-page-margin);
}

.container-content {
  max-width: 1280px;
  margin-inline: auto;
}

🏗️ ATOMIC COMPONENTS (Rebuilt)
1. Button Component
tsx// components/design-system/atoms/Button.tsx

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles - NO BOLD FONTS
          'inline-flex items-center justify-center gap-2',
          'font-medium', // Medium weight ONLY for buttons
          'rounded-[var(--radius-sm)]',
          'transition-all duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          
          // Size variants - COMPACT
          size === 'sm' && 'h-7 px-3 text-[var(--text-caption-1)]',
          size === 'md' && 'h-8 px-4 text-[var(--text-footnote)]',
          size === 'lg' && 'h-9 px-5 text-[var(--text-subhead)]',
          
          // Variant styles
          variant === 'primary' && 'interactive-primary focus-visible:ring-[rgb(var(--color-interactive-primary))]',
          
          variant === 'secondary' && [
            'surface-elevated',
            'text-primary',
            'hover:shadow-sm',
            'focus-visible:ring-[rgb(var(--color-border-primary))]',
          ],
          
          variant === 'ghost' && [
            'interactive-ghost',
            'hover:bg-[rgb(var(--color-interactive-primary)/0.08)]',
            'focus-visible:ring-[rgb(var(--color-interactive-primary))]',
          ],
          
          variant === 'destructive' && [
            'bg-[rgb(var(--color-error))]',
            'text-white',
            'hover:bg-[rgb(var(--color-error)/0.9)]',
            'focus-visible:ring-[rgb(var(--color-error))]',
          ],
          
          // Disabled state
          'disabled:opacity-40 disabled:pointer-events-none',
          
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

2. Card Component
tsx// components/design-system/atoms/Card.tsx

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'glass' | 'glass-strong';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'elevated', padding = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Variant styles
          variant === 'elevated' && 'surface-elevated',
          variant === 'glass' && 'surface-glass',
          variant === 'glass-strong' && 'surface-glass-strong',
          
          // Padding variants - COMPACT for data
          padding === 'none' && 'p-0',
          padding === 'sm' && 'p-3',  // 12px - Dense
          padding === 'md' && 'p-4',  // 16px - Standard
          padding === 'lg' && 'p-6',  // 24px - Spacious (modals only)
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

3. Input Component
tsx// components/design-system/atoms/Input.tsx

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          // Base styles - Sunken appearance
          'surface-sunken',
          'w-full h-9', // 36px height - Compact
          'px-3 py-2',  // 12px/8px padding
          
          // Typography - Regular weight, readable size
          'text-[var(--text-subhead)]',
          'font-[var(--weight-regular)]',
          'text-primary',
          
          // Placeholder
          'placeholder:text-tertiary',
          
          // Focus state
          'focus:outline-none',
          'focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary))]',
          'focus:border-transparent',
          
          // Transitions
          'transition-all duration-150',
          
          // Error state
          error && [
            'border-[rgb(var(--color-error))]',
            'focus:ring-[rgb(var(--color-error))]',
          ],
          
          // Disabled state
          'disabled:opacity-50 disabled:cursor-not-allowed',
          
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

4. Typography Components
tsx// components/design-system/atoms/Typography.tsx

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

// Title 1 - Page headers
export const Title1 = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h1 ref={ref} className={cn('type-title-1', className)} {...props} />
  )
);
Title1.displayName = 'Title1';

// Title 2 - Section headers
export const Title2 = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn('type-title-2', className)} {...props} />
  )
);
Title2.displayName = 'Title2';

// Title 3 - Card headers
export const Title3 = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('type-title-3', className)} {...props} />
  )
);
Title3.displayName = 'Title3';

// Body - Standard text
export const Body = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('type-body', className)} {...props} />
  )
);
Body.displayName = 'Body';

// Subhead - Labels
export const Subhead = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('type-subhead', className)} {...props} />
  )
);
Subhead.displayName = 'Subhead';

// Footnote - Captions
export const Footnote = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('type-footnote', className)} {...props} />
  )
);
Footnote.displayName = 'Footnote';

// Caption1 - Table headers (uppercase)
export const Caption1 = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('type-caption-1', className)} {...props} />
  )
);
Caption1.displayName = 'Caption1';

// Monospace - Numbers
export const Mono = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn('type-mono', className)} {...props} />
  )
);
Mono.displayName = 'Mono';

📊 TABLE COMPONENT (Information-Dense)
tsx// components/design-system/organisms/DataTable.tsx

import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('surface-glass overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr className="border-b border-hairline">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    // Base styles - COMPACT
                    'px-3 py-2', // 12px/8px - Dense
                    'type-caption-1', // 12px uppercase
                    'text-left',
                    
                    // Alignment
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    
                    // Width
                    column.width && `w-[${column.width}]`
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Body */}
          <tbody className="divide-y divide-hairline">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  'transition-colors duration-150',
                  'hover:bg-[rgb(var(--color-bg-elevated)/0.5)]'
                )}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={cn(
                      // Base styles - COMPACT
                      'px-3 py-2', // 12px/8px - Dense
                      'type-subhead', // 15px regular
                      
                      // Alignment
                      column.align === 'center' && 'text-center',Continue12:54column.align === 'right' && 'text-right'
)}
>
{column.render
? column.render(row[column.key], row)
: row[column.key]}
</td>
))}
</tr>
))}
</tbody>
</table>
</div>
</div>
);
}

---

## 🎨 PAGE LAYOUT EXAMPLES

### **Purchase Order List Page**
```tsx
// app/po/page.tsx (Client Component)

'use client';

import { Card } from '@/components/design-system/atoms/Card';
import { Button } from '@/components/design-system/atoms/Button';
import { Input } from '@/components/design-system/atoms/Input';
import { Title1, Subhead } from '@/components/design-system/atoms/Typography';
import { DataTable } from '@/components/design-system/organisms/DataTable';
import { Search, Plus } from 'lucide-react';

export default function POListPage() {
  return (
    <div className="surface-base min-h-screen">
      {/* Page Container - 32px margins */}
      <div className="container-page">
        
        {/* Header - No bold fonts */}
        <div className="flex items-center justify-between mb-6">
          <div className="stack-y gap-1">
            <Title1>Purchase Orders</Title1>
            <Subhead className="text-secondary">
              Manage and track all purchase orders
            </Subhead>
          </div>
          
          <Button variant="primary" size="md">
            <Plus size={16} />
            New PO
          </Button>
        </div>
        
        {/* Filters - Glass card with compact padding */}
        <Card variant="glass" padding="md" className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search 
                size={16} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary"
              />
              <Input
                placeholder="Search by PO number, buyer..."
                className="pl-9"
              />
            </div>
            
            <Button variant="secondary" size="md">
              Filters
            </Button>
          </div>
        </Card>
        
        {/* Data Table - Dense spacing */}
        <DataTable
          columns={[
            { key: 'po_number', label: 'PO NUMBER', width: '140px' },
            { key: 'buyer', label: 'BUYER' },
            { key: 'date', label: 'DATE', width: '120px' },
            { 
              key: 'value', 
              label: 'VALUE', 
              align: 'right',
              width: '140px',
              render: (value) => (
                <span className="type-mono">₹{value.toLocaleString()}</span>
              )
            },
            { key: 'status', label: 'STATUS', width: '120px' },
          ]}
          data={purchaseOrders}
        />
      </div>
    </div>
  );
}
```

---

### **PO Detail Page (Glassmorphic)**
```tsx
// app/po/[id]/page.tsx

'use client';

import { Card } from '@/components/design-system/atoms/Card';
import { Button } from '@/components/design-system/atoms/Button';
import { Title1, Title3, Subhead, Footnote, Mono } from '@/components/design-system/atoms/Typography';
import { Edit, Download, Trash2 } from 'lucide-react';

export default function PODetailPage() {
  return (
    <div className="surface-base min-h-screen">
      <div className="container-page">
        
        {/* Header with actions */}
        <div className="flex items-start justify-between mb-6">
          <div className="stack-y gap-2">
            <Title1>PO-2024-00156</Title1>
            <Subhead className="text-secondary">
              BHEL Bhopal • Issued on 15 Dec 2024
            </Subhead>
          </div>
          
          <div className="stack-x gap-2">
            <Button variant="ghost" size="md">
              <Edit size={16} />
              Edit
            </Button>
            <Button variant="ghost" size="md">
              <Download size={16} />
              Download
            </Button>
            <Button variant="ghost" size="md">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
        
        {/* Summary Cards - Glass with 16px padding */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card variant="glass" padding="md">
            <Footnote className="text-tertiary mb-1">ORDERED</Footnote>
            <div className="type-title-3">
              <Mono>1,250</Mono> <span className="text-secondary">units</span>
            </div>
          </Card>
          
          <Card variant="glass" padding="md">
            <Footnote className="text-tertiary mb-1">DELIVERED</Footnote>
            <div className="type-title-3">
              <Mono>820</Mono> <span className="text-secondary">units</span>
            </div>
          </Card>
          
          <Card variant="glass" padding="md">
            <Footnote className="text-tertiary mb-1">BALANCE</Footnote>
            <div className="type-title-3">
              <Mono>430</Mono> <span className="text-secondary">units</span>
            </div>
          </Card>
          
          <Card variant="glass" padding="md">
            <Footnote className="text-tertiary mb-1">VALUE</Footnote>
            <div className="type-title-3">
              <Mono>₹12.45L</Mono>
            </div>
          </Card>
        </div>
        
        {/* Details Section - Glass strong for readability */}
        <Card variant="glass-strong" padding="md" className="mb-6">
          <Title3 className="mb-4">Details</Title3>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div className="stack-y gap-1">
              <Footnote className="text-tertiary">Department</Footnote>
              <Subhead className="text-primary">Mechanical Engineering</Subhead>
            </div>
            
            <div className="stack-y gap-1">
              <Footnote className="text-tertiary">Supplier Code</Footnote>
              <Subhead className="type-mono">S-4544</Subhead>
            </div>
            
            <div className="stack-y gap-1">
              <Footnote className="text-tertiary">Financial Year</Footnote>
              <Subhead className="text-primary">2024-25</Subhead>
            </div>
            
            <div className="stack-y gap-1">
              <Footnote className="text-tertiary">Amendment</Footnote>
              <Subhead className="text-primary">No amendments</Subhead>
            </div>
          </div>
        </Card>
        
        {/* Items Table - Dense */}
        <Card variant="glass" padding="none">
          <div className="px-4 py-3 border-b border-hairline">
            <Title3>Line Items</Title3>
          </div>
          
          <DataTable
            columns={[
              { key: 'item_no', label: 'ITEM', width: '80px' },
              { key: 'description', label: 'DESCRIPTION' },
              { 
                key: 'ordered', 
                label: 'ORDERED', 
                align: 'right',
                render: (v) => <Mono>{v}</Mono>
              },
              { 
                key: 'delivered', 
                label: 'DELIVERED', 
                align: 'right',
                render: (v) => <Mono>{v}</Mono>
              },
              { 
                key: 'balance', 
                label: 'BALANCE', 
                align: 'right',
                render: (v) => <Mono>{v}</Mono>
              },
            ]}
            data={items}
          />
        </Card>
      </div>
    </div>
  );
}
```

---

## 🔧 IMPLEMENTATION STEPS

### **Phase 1: Foundation (Day 1-2)**

1. **Create token files**
```bash
   mkdir -p app/styles
   touch app/styles/design-tokens.css
   touch app/styles/utilities.css
```

2. **Update `globals.css`**
```css
   /* app/globals.css */
   @import './styles/design-tokens.css';
   @import './styles/utilities.css';
   
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   
   /* Global resets */
   * {
     @apply border-border;
   }
   
   body {
     @apply surface-base text-primary;
     font-family: var(--font-sans);
   }
```

3. **Update Tailwind config**
```javascript
   // tailwind.config.ts
   import type { Config } from 'tailwindcss';
   
   const config: Config = {
     darkMode: 'class',
     content: [
       './app/**/*.{ts,tsx}',
       './components/**/*.{ts,tsx}',
     ],
     theme: {
       extend: {
         fontFamily: {
           sans: ['var(--font-sans)'],
           mono: ['var(--font-mono)'],
         },
       },
     },
     plugins: [],
   };
   
   export default config;
```

---

### **Phase 2: Atomic Components (Day 3-5)**

Rebuild components in this order:

1. ✅ **Typography** (Title1, Title2, Body, etc.)
2. ✅ **Button** (Primary, Secondary, Ghost)
3. ✅ **Input** (Text, Number, Date)
4. ✅ **Card** (Elevated, Glass, Glass Strong)
5. ✅ **Badge** (Status indicators)

**Migration strategy:**
```tsx
// Before
<div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200">
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
    Purchase Orders
  </h2>
</div>

// After
<Card variant="glass" padding="md">
  <Title2>Purchase Orders</Title2>
</Card>
```

---

### **Phase 3: Molecules (Day 6-8)**

Update composite components:

1. **SearchBar** → Use `Input` + `Button`
2. **FilterPanel** → Use `Card` + form controls
3. **StatusBadge** → Semantic colors only
4. **Pagination** → Compact buttons

---

### **Phase 4: Page Templates (Day 9-12)**

Refactor pages one module at a time:

1. **Day 9:** PO List + Detail
2. **Day 10:** DC List + Create
3. **Day 11:** Invoice List + Create
4. **Day 12:** Reports + Settings

---

### **Phase 5: Dark Mode Testing (Day 13-14)**

1. Toggle dark mode on every page
2. Check glass effects render correctly
3. Verify text contrast (WCAG AA minimum)
4. Test in Safari (backdrop-filter support)

---

## 🎯 CRITICAL RULES

### **DO's**

✅ Use `type-*` classes for typography  
✅ Use `surface-*` classes for backgrounds  
✅ Use `px-3 py-2` for table cells (12px/8px)  
✅ Use `p-4` for standard cards (16px)  
✅ Use `gap-4` between sections (16px)  
✅ Use `Mono` component for numbers  
✅ Use `Caption1` for table headers (uppercase)  

### **DON'Ts**

❌ Never use `font-bold` or `font-semibold`  
❌ Never use `p-6` or `p-8` on data cards  
❌ Never use raw Tailwind colors (`bg-blue-500`)  
❌ Never use `text-xl` or size utilities directly  
❌ Never use `border-2` (always hairline borders)  
❌ Never mix `font-sans` with custom fonts  

---

## 🧪 TESTING CHECKLIST

After migration, verify:

- [ ] No bold fonts on body text
- [ ] All table cells use `px-3 py-2`
- [ ] All cards use `p-4` (not p-6)
- [ ] Glass effects visible on light/dark
- [ ] Text contrast passes WCAG AA
- [ ] Monospace used for all numbers
- [ ] Table headers use `Caption1` (uppercase)
- [ ] No raw Tailwind colors in components
- [ ] Dark mode toggle works globally
- [ ] Spacing consistent across all pages

---

## 📱 RESPONSIVE BEHAVIOR
```css
/* All spacing scales proportionally */
@media (max-width: 768px) {
  :root {
    --space-page-margin: var(--space-4); /* 32px → 16px */
    --space-table-cell-x: var(--space-2); /* 12px → 8px */
  }
  
  /* Stack cards vertically */
  .grid-cols-4 {
    @apply grid-cols-1;
  }
}
```

---
Gap Analysis: Design System vs Master Module Reference
After cross-referencing the implementation prompt against your MASTER_MODULE_REFERENCE.md, I found significant gaps. Let me provide the missing components.

❌ MISSING COMPONENTS (Critical)
1. StatusBadge Component
tsx// components/design-system/atoms/StatusBadge.tsx

import { cn } from '@/lib/utils';

type Status = 'draft' | 'pending' | 'delivered' | 'closed' | 'active' | 'cancelled';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; color: string }> = {
  draft: { 
    label: 'Draft', 
    color: 'bg-[rgb(var(--color-text-quaternary)/0.1)] text-[rgb(var(--color-text-tertiary))]' 
  },
  pending: { 
    label: 'Pending', 
    color: 'bg-[rgb(var(--color-warning)/0.1)] text-[rgb(var(--color-warning))]' 
  },
  delivered: { 
    label: 'Delivered', 
    color: 'bg-[rgb(var(--color-info)/0.1)] text-[rgb(var(--color-info))]' 
  },
  closed: { 
    label: 'Closed', 
    color: 'bg-[rgb(var(--color-success)/0.1)] text-[rgb(var(--color-success))]' 
  },
  active: { 
    label: 'Active', 
    color: 'bg-[rgb(var(--color-success)/0.1)] text-[rgb(var(--color-success))]' 
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-[rgb(var(--color-error)/0.1)] text-[rgb(var(--color-error))]' 
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center',
        'px-2 py-1', // Compact - 8px/4px
        'rounded-[var(--radius-xs)]',
        'type-caption-1', // 12px uppercase
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}

2. Tabs Component (Radix Primitive)
tsx// components/design-system/molecules/Tabs.tsx

'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export function Tabs({ className, ...props }: TabsPrimitive.TabsProps) {
  return (
    <TabsPrimitive.Root
      className={cn('stack-y gap-4', className)}
      {...props}
    />
  );
}

export function TabsList({ className, ...props }: TabsPrimitive.TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex items-center',
        'surface-sunken', // Recessed appearance
        'p-1', // 4px inner padding
        'gap-1',
        'rounded-[var(--radius-sm)]',
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex items-center justify-center',
        'px-3 py-1.5', // 12px/6px - Compact
        'type-subhead', // 15px regular
        'rounded-[var(--radius-xs)]',
        'transition-all duration-150',
        
        // Default state
        'text-secondary',
        
        // Active state - Elevated surface
        'data-[state=active]:surface-elevated',
        'data-[state=active]:text-primary',
        'data-[state=active]:shadow-xs',
        
        // Hover state
        'hover:text-primary',
        
        className
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: TabsPrimitive.TabsContentProps) {
  return (
    <TabsPrimitive.Content
      className={cn('focus:outline-none', className)}
      {...props}
    />
  );
}

3. Select/Dropdown Component (Radix)
tsx// components/design-system/atoms/Select.tsx

'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className, children, ...props }: SelectPrimitive.SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        'surface-sunken',
        'flex items-center justify-between',
        'w-full h-9', // 36px height
        'px-3 py-2',
        'type-subhead', // 15px regular
        'text-primary',
        'rounded-[var(--radius-sm)]',
        'focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary))]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-all duration-150',
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown size={16} className="text-tertiary" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ className, children, ...props }: SelectPrimitive.SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          'surface-glass-strong', // Strong glass for readability
          'overflow-hidden',
          'rounded-[var(--radius-md)]',
          'shadow-lg',
          'z-50',
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className, children, ...props }: SelectPrimitive.SelectItemProps) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex items-center',
        'px-3 py-2', // 12px/8px - Compact
        'type-subhead', // 15px regular
        'text-primary',
        'rounded-[var(--radius-xs)]',
        'cursor-pointer',
        'select-none',
        'outline-none',
        
        // Hover/Focus state
        'hover:bg-[rgb(var(--color-interactive-primary)/0.08)]',
        'focus:bg-[rgb(var(--color-interactive-primary)/0.08)]',
        
        // Disabled state
        'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
        
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      
      <SelectPrimitive.ItemIndicator className="absolute right-2">
        <Check size={16} className="text-[rgb(var(--color-interactive-primary))]" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

4. Dialog/Modal Component
tsx// components/design-system/molecules/Dialog.tsx

'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent({ className, children, ...props }: DialogPrimitive.DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      {/* Backdrop */}
      <DialogPrimitive.Overlay
        className={cn(
          'fixed inset-0 z-50',
          'bg-[rgb(var(--color-bg-overlay)/0.4)]',
          'backdrop-blur-sm',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
        )}
      />
      
      {/* Dialog */}
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50',
          'w-full max-w-lg',
          '-translate-x-1/2 -translate-y-1/2',
          'surface-glass-strong', // Strong glass for readability
          'p-6', // 24px - Generous for modals
          'shadow-xl',
          'rounded-[var(--radius-lg)]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          className
        )}
        {...props}
      >
        {children}
        
        {/* Close button */}
        <DialogPrimitive.Close
          className={cn(
            'absolute right-4 top-4',
            'rounded-[var(--radius-xs)]',
            'p-1',
            'text-tertiary hover:text-primary',
            'hover:bg-[rgb(var(--color-bg-elevated)/0.5)]',
            'transition-colors'
          )}
        >
          <X size={16} />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('stack-y gap-2 mb-4', className)}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }: DialogPrimitive.DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      className={cn('type-title-2', className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }: DialogPrimitive.DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      className={cn('type-subhead text-secondary', className)}
      {...props}
    />
  );
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex justify-end gap-2 mt-6', className)}
      {...props}
    />
  );
}

5. Label Component
tsx// components/design-system/atoms/Label.tsx

import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

export function Label({ className, ...props }: LabelPrimitive.LabelProps) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'type-subhead', // 15px regular
        'text-secondary',
        'cursor-pointer',
        className
      )}
      {...props}
    />
  );
}

6. Textarea Component
tsx// components/design-system/atoms/Textarea.tsx

import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'surface-sunken',
          'w-full min-h-[80px]',
          'px-3 py-2',
          'type-subhead', // 15px regular
          'text-primary',
          'placeholder:text-tertiary',
          'rounded-[var(--radius-sm)]',
          'resize-vertical',
          'focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary))]',
          'transition-all duration-150',
          error && 'border-[rgb(var(--color-error))] focus:ring-[rgb(var(--color-error))]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

7. Checkbox Component
tsx// components/design-system/atoms/Checkbox.tsx

'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Checkbox({ className, ...props }: CheckboxPrimitive.CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'surface-sunken',
        'h-5 w-5', // 20px square
        'rounded-[var(--radius-xs)]',
        'border border-hairline',
        'focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary))]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'data-[state=checked]:bg-[rgb(var(--color-interactive-primary))]',
        'data-[state=checked]:border-[rgb(var(--color-interactive-primary))]',
        'transition-all duration-150',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
        <Check size={14} strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

8. SearchBar Component (Molecule)
tsx// components/design-system/molecules/SearchBar.tsx

'use client';

import { Input } from '@/components/design-system/atoms/Input';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ 
  value, 
  onChange, 
  onSearch,
  placeholder = 'Search...',
  className 
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className={cn('relative', className)}>
      {/* Search Icon */}
      <Search
        size={16}
        className={cn(
          'absolute left-3 top-1/2 -translate-y-1/2',
          'transition-colors duration-150',
          isFocused ? 'text-[rgb(var(--color-interactive-primary))]' : 'text-tertiary'
        )}
      />
      
      {/* Input */}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSearch) {
            onSearch();
          }
        }}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      
      {/* Clear Button */}
      {value && (
        <button
          onClick={() => onChange('')}
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2',
            'text-tertiary hover:text-primary',
            'transition-colors duration-150'
          )}
        >
          <X size={16} />
        </button>
      )}
      
      {/* Keyboard Shortcut Hint */}
      {!isFocused && !value && (
        <kbd className={cn(
          'absolute right-3 top-1/2 -translate-y-1/2',
          'px-1.5 py-0.5',
          'type-caption-2',
          'text-tertiary',
          'surface-sunken',
          'rounded-[var(--radius-xs)]',
          'border border-hairline'
        )}>
          ⌘K
        </kbd>
      )}
    </div>
  );
}

9. Pagination Component
tsx// components/design-system/molecules/Pagination.tsx

'use client';

import { Button } from '@/components/design-system/atoms/Button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/design-system/atoms/Select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {/* Items count */}
      <div className="type-footnote text-secondary">
        Showing {startItem}-{endItem} of {totalItems}
      </div>
      
      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="type-footnote text-secondary">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </Button>
          
          <span className="type-subhead text-primary px-2">
            {currentPage} / {totalPages}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

10. EmptyState Component
tsx// components/design-system/molecules/EmptyState.tsx

import { LucideIcon } from 'lucide-react';
import { Title3, Subhead } from '@/components/design-system/atoms/Typography';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <div className={cn(
        'mb-4 p-3',
        'rounded-[var(--radius-md)]',
        'bg-[rgb(var(--color-bg-elevated)/0.5)]'
      )}>
        <Icon size={32} className="text-tertiary" />
      </div>
      
      <Title3 className="mb-2">{title}</Title3>
      <Subhead className="text-secondary mb-4 text-center max-w-md">
        {description}
      </Subhead>
      
      {action}
    </div>
  );
}

📄 PAGE-SPECIFIC COMPONENTS
11. PO Create Form Layout
tsx// app/po/create/page.tsx (Full implementation)

'use client';

import { useState } from 'react';
import { Card } from '@/components/design-system/atoms/Card';
import { Button } from '@/components/design-system/atoms/Button';
import { Input } from '@/components/design-system/atoms/Input';
import { Textarea } from '@/components/design-system/atoms/Textarea';
import { Label } from '@/components/design-system/atoms/Label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/design-system/atoms/Select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/design-system/molecules/Tabs';
import { Title1, Subhead, Caption1, Mono } from '@/components/design-system/atoms/Typography';
import { EmptyState } from '@/components/design-system/molecules/EmptyState';
import { X, Plus, Package } from 'lucide-react';

export default function POCreatePage() {
  const [items, setItems] = useState([]);
  
  return (
    <div className="surface-base min-h-screen">
      <div className="container-page">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="stack-y gap-2">
            <Title1>Create Purchase Order</Title1>
            <Subhead className="text-secondary">
              Enter PO details or upload HTML file
            </Subhead>
          </div>
          
          <div className="stack-x gap-2">
            <Button variant="secondary" size="md">
              Cancel
            </Button>
            <Button variant="primary" size="md">
              Save PO
            </Button>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="manual">
          <TabsList>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="upload">Upload HTML</TabsTrigger>
          </TabsList>
          
          {/* Manual Entry Tab */}
          <TabsContent value="manual">
            <Card variant="glass" padding="md">
              <div className="stack-y gap-6">
                
                {/* Basic Info Section */}
                <div>
                  <Caption1 className="mb-3">BASIC INFORMATION</Caption1>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="stack-y gap-1.5">
                      <Label htmlFor="po-number">PO Number</Label>
                      <Input id="po-number" placeholder="PO-2024-00001" />
                    </div>
                    
                    <div className="stack-y gap-1.5">
                      <Label htmlFor="po-date">PO Date</Label>
                      <Input id="po-date" type="date" />
                    </div>
                    
                    <div className="stack-y gap-1.5">
                      <Label htmlFor="buyer">Buyer</Label>
                      <Select>
                        <SelectTrigger id="buyer">
                          <SelectValue placeholder="Select buyer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bhel">BHEL Bhopal</SelectItem>
                          <SelectItem value="ntpc">NTPC Korba</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Supplier Info Section */}
                <div>
                  <Caption1 className="mb-3">SUPPLIER INFORMATION</Caption1>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="stack-y gap-1.5">
                      <Label htmlFor="supplier-name">Supplier Name</Label>
                      <Input id="supplier-name" placeholder="Company name" />
                    </div>
                    
                    <div className="stack-y gap-1.5">
                      <Label htmlFor="supplier-code">Supplier Code</Label>
                      <Input id="supplier-code" placeholder="S-XXXX" />
                    </div>
                  </div>
                </div>
                
                {/* Additional Details */}
                <div>
                  <Caption1 className="mb-3">ADDITIONAL DETAILS</Caption1>
                  
                  <div className="stack-y gap-1.5">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea 
                      id="notes" 
                      placeholder="Additional information about this PO..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Line Items */}
            <Card variant="glass" padding="none" className="mt-6">
              <div className="px-4 py-3 border-b border-hairline flex items-center justify-between">
                <Caption1>LINE ITEMS</Caption1>
                <Button variant="secondary" size="sm">
                  <Plus size={14} />
                  Add Item
                </Button>
              </div>
              
              {items.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No items added"
                  description="Add line items to this purchase order"
                  action={
                    <Button variant="primary" size="md">
                      <Plus size={16} />
                      Add First Item
                    </Button>
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-hairline">
                        <th className="px-3 py-2 text-left">
                          <Caption1>ITEM NO</Caption1>
                        </th>
                        <th className="px-3 py-2 text-left">
                          <Caption1>DESCRIPTION</Caption1>
                        </th>
                        <th className="px-3 py-2 text-right">
                          <Caption1>QTY</Caption1>
                        </th>
                        <th className="px-3 py-2 text-right">
                          <Caption1>UNIT PRICE</Caption1>
                        </th>
                        <th className="px-3 py-2 text-right">
                          <Caption1>VALUE</Caption1>
                        </th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      {/* Items would be mapped here */}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
            
            {/* Total Value */}
            <Card variant="glass" padding="md" className="mt-6">
              <div className="flex items-center justify-between">
                <Caption1>TOTAL PO VALUE</Caption1>
                <div className="type-title-2">
                  <Mono>₹0.00</Mono>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          {/* Upload Tab */}
          <TabsContent value="upload">
            <Card variant="glass" padding="md">
              {/* Upload UI would go here */}
            </Card>
          </TabsContent>
        </Tabs>
        
      </div>
    </div>
  );
}

12. DC Create Page (Group Rows)
tsx// app/dc/create/page.tsx (Item grouping section)

<Card variant="glass" padding="none">
  <table className="w-full">
    <thead>
      <tr className="border-b border-hairline">
        <th className="px-3 py-2 text-left"><Caption1>LOT</Caption1></th>
        <th className="px-3 py-2 text-left"><Caption1>DESCRIPTION</Caption1></th>
        <th className="px-3 py-2 text-right"><Caption1>ORDERED</Caption1></th>
        <th className="px-3 py-2 text-right"><Caption1>BALANCE</Caption1></th>
        <th className="px-3 py-2 text-right"><Caption1>DISPATCH</Caption1></th>
      </tr>
    </thead>
    <tbody>
      {/* Group Header Row */}
      <tr className="bg-[rgb(var(--color-bg-elevated)/0.3)]">
        <td colSpan={5} className="px-3 py-2">
          <Caption1 className="text-primary">ITEM 1 - CABLE GLAND M20</Caption1>
        </td>
      </tr>Continue13:05  {/* Lot Rows */}
  <tr className="border-b border-hairline hover:bg-[rgb(var(--color-bg-elevated)/0.5)]">
    <td className="px-3 py-2"><Mono>1</Mono></td>
    <td className="px-3 py-2 type-subhead">M20 Cable Gland, Brass</td>
    <td className="px-3 py-2 text-right"><Mono>500</Mono></td>
    <td className="px-3 py-2 text-right"><Mono>300</Mono></td>
    <td className="px-3 py-2">
      <Input 
        type="number" 
        placeholder="0"
        className="w-24 text-right bg-[rgb(var(--color-interactive-primary)/0.05)]"
      />
    </td>
  </tr>
</tbody>
  </table>
</Card>
````

13. Invoice Create (Buyer Info Box)
tsx// Buyer Info Display Card

<Card variant="glass" padding="md">
  <Caption1 className="mb-3">BUYER INFORMATION</Caption1>
  
  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
    <div>
      <span className="type-footnote text-tertiary">Name</span>
      <p className="type-subhead text-primary">BHEL Bhopal</p>
    </div>
    
    <div>
      <span className="type-footnote text-tertiary">GSTIN</span>
      <p className="type-mono text-primary">23AABCU9603R1ZV</p>
    </div>
    
    <div>
      <span className="type-footnote text-tertiary">Department</span>
      <p className="type-subhead text-primary">Mechanical Engineering</p>
    </div>
    
    <div>
      <span className="type-footnote text-tertiary">Supplier Code</span>
      <p className="type-mono text-primary">S-4544</p>
    </div>
  </div>
</Card>

14. Invoice Table (Tax Rows)
tsx// Invoice Items Table with Tax Summary

<Card variant="glass" padding="none">
  <table className="w-full">
    <thead>
      <tr className="border-b border-hairline">
        <th className="px-3 py-2 text-left"><Caption1>ITEM</Caption1></th>
        <th className="px-3 py-2 text-left"><Caption1>HSN</Caption1></th>
        <th className="px-3 py-2 text-right"><Caption1>QTY</Caption1></th>
        <th className="px-3 py-2 text-right"><Caption1>RATE</Caption1></th>
        <th className="px-3 py-2 text-right"><Caption1>AMOUNT</Caption1></th>
      </tr>
    </thead>
    <tbody className="divide-y divide-hairline">
      {/* Item rows */}
      <tr>
        <td className="px-3 py-2 type-subhead">Cable Gland M20</td>
        <td className="px-3 py-2 type-caption-1">85369090</td>
        <td className="px-3 py-2 text-right"><Mono>200</Mono></td>
        <td className="px-3 py-2 text-right"><Mono>₹45.00</Mono></td>
        <td className="px-3 py-2 text-right"><Mono>₹9,000.00</Mono></td>
      </tr>
    </tbody>
    
    {/* Tax Summary Rows */}
    <tfoot className="border-t-2 border-hairline">
      <tr className="bg-[rgb(var(--color-bg-elevated)/0.2)]">
        <td colSpan={4} className="px-3 py-2 text-right type-subhead">
          Taxable Amount
        </td>
        <td className="px-3 py-2 text-right"><Mono>₹9,000.00</Mono></td>
      </tr>
      <tr className="bg-[rgb(var(--color-bg-elevated)/0.2)]">
        <td colSpan={4} className="px-3 py-2 text-right type-subhead">
          CGST @ 9%
        </td>
        <td className="px-3 py-2 text-right"><Mono>₹810.00</Mono></td>
      </tr>
      <tr className="bg-[rgb(var(--color-bg-elevated)/0.2)]">
        <td colSpan={4} className="px-3 py-2 text-right type-subhead">
          SGST @ 9%
        </td>
        <td className="px-3 py-2 text-right"><Mono>₹810.00</Mono></td>
      </tr>
      <tr className="bg-[rgb(var(--color-bg-elevated)/0.4)] font-medium">
        <td colSpan={4} className="px-3 py-2 text-right type-subhead">
          Grand Total
        </td>
        <td className="px-3 py-2 text-right type-title-3">
          <Mono>₹10,620.00</Mono>
        </td>
      </tr>
    </tfoot>
  </table>
</Card>

15. Settings Page (System Reset)
tsx// app/settings/page.tsx (Danger Zone)

<Card variant="elevated" padding="md" className="border-2 border-[rgb(var(--color-error)/0.2)]">
  <div className="stack-y gap-3">
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-[var(--radius-sm)] bg-[rgb(var(--color-error)/0.1)]">
        <AlertTriangle size={20} className="text-[rgb(var(--color-error))]" />
      </div>
      
      <div className="flex-1">
        <Title3 className="text-[rgb(var(--color-error))] mb-1">
          Danger Zone
        </Title3>
        <Subhead className="text-secondary">
          Irreversible actions that will permanently delete data
        </Subhead>
      </div>
    </div>
    
    <div className="pt-3 border-t border-hairline">
      <Button 
        variant="destructive" 
        size="md"
        onClick={() => {/* Open confirmation dialog */}}
      >
        Reset System
      </Button>
    </div>
  </div>
</Card>

🎯 COMPLETE COMPONENT CHECKLIST
✅ Now Covered (15 Components)

 Button (all variants)
 Card (elevated, glass, glass-strong)
 Input (with error states)
 Textarea
 Label
 Select/Dropdown
 Checkbox
 StatusBadge
 Typography (Title1-3, Body, Subhead, Footnote, Caption1-2, Mono)
 Tabs (List, Trigger, Content)
 Dialog/Modal
 SearchBar
 Pagination
 EmptyState
 DataTable

📋 Page-Specific Patterns Covered

 PO Create (Manual entry form + Items table)
 DC Create (Group rows + Dispatch inputs)
 Invoice Create (Buyer info + Tax summary)
 Settings (Danger zone card)
 List pages (Filters + DataTable)
 Detail pages (Summary cards + Details grid)