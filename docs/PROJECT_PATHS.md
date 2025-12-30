# PROJECT PATHS REFERENCE
## CRITICAL: Read this file before making assumptions about file locations

## Database
- **Location:** `db/business.db`
- **Backup Directory:** `db-backups/`
- **NEVER assume:** Database is in root directory
- **NEVER check:** `senstosales.db` or `*.db` in root

## Frontend
- **Root:** `frontend/`
- **Components:** `frontend/components/`
- **Pages:** `frontend/app/`
- **Styles:** `frontend/app/globals.css`, `frontend/app/tokens.css`

## Backend
- **Root:** `backend/`
- **App:** `backend/app/`
- **Routers:** `backend/app/routers/`
- **Models:** `backend/app/models/`

## Design Tokens
- **Root:** `tokens/`
- **Global:** `tokens/global.json`
- **Semantic:** `tokens/semantic.json`
- **Dark Theme:** `tokens/dark-theme.json`

## Documentation
- **Root:** `docs/`
- **API:** `docs/api/`

## Audit Tools
- **Root:** `mcp-servers/`
- **Performance:** `mcp-servers/performance/`
- **Reports:** Generated in `mcp-servers/performance/`

## Configuration Files
- **Project Config:** `.project-config.json` (THIS IS THE SOURCE OF TRUTH)
- **Frontend Env:** `frontend/.env.local`
- **Backend Env:** `backend/.env`

---

**For AI Agents:**
1. ALWAYS read `.project-config.json` first
2. NEVER assume file locations
3. NEVER check root directory for database
4. Database is ALWAYS at `db/business.db`
