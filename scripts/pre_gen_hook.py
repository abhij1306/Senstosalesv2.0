import subprocess
import json
import sys

def run_steward():
    try:
        # Run the architecture steward validation
        result = subprocess.run(
            [sys.executable, "scripts/arch-steward.py"],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            return False, result.stdout
        return True, ""
    except Exception as e:
        return False, str(e)

def main():
    # This hook is intended to be called BEFORE any file write/save action.
    # In this environment, it's used as a checklist verification.
    ok, error_json = run_steward()
    if not ok:
        print("ARCHITECTURAL VIOLATION DETECTED")
        print(error_json)
        sys.exit(1)
    else:
        print(json.dumps({"ok": True}))
        sys.exit(0)

if __name__ == "__main__":
    main()
