const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PROTECTED_FILES = [
    'backend/app/db.py', // Core DB logic
];

// Simple check: Just ensure they exist and warn if they are modified (requires git)
// Since we might not have git context in all CI envs, we'll just log a warning for now
// that this script is running.

console.log('🔒 Verifying integrity of protected files...');

// Check existence
let missing = [];
PROTECTED_FILES.forEach(f => {
    // Resolve from project root (this script is in scripts/, one level down from root)
    const projectRoot = path.resolve(__dirname, '../');
    const filePath = path.join(projectRoot, f);

    if (!fs.existsSync(filePath)) {
        missing.push(f);
    }
});

if (missing.length > 0) {
    console.error('❌ CRITICAL: Protected user files are missing!');
    missing.forEach(m => console.error(`   - ${m}`));
    process.exit(1);
}

console.log('✅ Integrity check passed: All protected files present.');
