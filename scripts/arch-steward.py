import os
import yaml
import sys
import json

def load_manifest():
    with open('architecture-manifest.yaml', 'r') as f:
        return yaml.safe_load(f)

def audit_db(manifest):
    db_count = 0
    errors = []
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.db') and 'node_modules' not in root:
                db_count += 1
                full_path = os.path.join(root, file).replace('\\', '/')
                if full_path != manifest['database']['canonical_path']:
                    errors.append(f"Non-canonical DB found: {full_path}")
    
    if db_count > manifest['database']['max_db_files']:
        errors.append(f"DB Count violation: found {db_count}, allowed {manifest['database']['max_db_files']}")
    return errors

def audit_folders(manifest):
    errors = []
    # Check for forbidden folders
    for forbidden in manifest['backend']['forbidden_folders']:
        if os.path.exists(forbidden):
            errors.append(f"Architectural Violation: Forbidden folder exists: {forbidden}")
    return errors

def main():
    manifest = load_manifest()
    errors = []
    errors.extend(audit_db(manifest))
    errors.extend(audit_folders(manifest))
    
    if errors:
        print(json.dumps({"ok": False, "errors": errors}, indent=2))
        sys.exit(1)
    else:
        print(json.dumps({"ok": True}, indent=2))
        sys.exit(0)

if __name__ == "__main__":
    main()
