Definition of Done (DoD): Project SenstoSales Audit
1. Architectural Integrity
[ ] Orphan Search: No file exists in the /src or /backend folders that is not actively imported or required by the main application tree.

[ ] Doc-Code Parity: Every API endpoint and frontend route has a corresponding .md file in the /docs folder explaining its purpose, schema, and logic.

[ ] Directory Structure: The project follows a strictly flat or logical atomic hierarchy (e.g., /components/atoms, /services, /hooks) with no "miscellaneous" or "temp" folders.

2. Frontend & Design Token Standardization
[ ] Hardcode Zero: A global search for hex, rgb, or literal px values (for spacing/heights) returns zero results outside of the central tailwind.config.js or theme.tokens.json.

[ ] Theme Switch Test: The application passes a "Variable Contrast Audit"—toggling between Dark and Light mode shows 100% compliance with theme variables; no "ghost" borders or hardcoded white backgrounds remain.

[ ] Component Consolidation: Multiple instances of similar UI patterns (buttons, inputs, cards) are merged into a single atomic component library.

3. Performance & Clean Code
[ ] Legacy Purge: All commented-out code blocks, console logs (unless for production error handling), and // TODO tags from the previous version are deleted.

[ ] Dependency Audit: The package.json has been pruned of any libraries not explicitly used in the final optimized codebase.

[ ] Benchmarking: Core pages/endpoints meet a "Good" performance threshold (e.g., < 200ms for backend API response on local, or specific Lighthouse-style metrics for frontend).

4. Git & Recovery
[ ] State Preservation: The pre-audit-backup branch exists and contains a bit-for-bit copy of the project prior to the first audit command.

[ ] Audit Trail: A final audit_report.md is generated listing every file deleted and why it was deemed "legacy" or "redundant."

How to use this with the Agent
When you start the session with your coding agent, you can say:

"Refer to the Definition of Done criteria I've provided. Do not signal completion of a phase until every checkbox for that phase in the DoD is satisfied. Use your grep and file_search tools to verify 'Hardcode Zero' and 'Orphan Search' specifically."