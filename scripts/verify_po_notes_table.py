import sqlite3

conn = sqlite3.connect('db/business.db')
conn.row_factory = sqlite3.Row

# Check tables
tables = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print("Tables containing 'note' or 'template':", [t for t in tables if 'note' in t.lower() or 'template' in t.lower()])

# Check if po_notes_templates exists
if 'po_notes_templates' in tables:
    print("\npo_notes_templates table exists!")
    schema = conn.execute("SELECT sql FROM sqlite_master WHERE name='po_notes_templates'").fetchone()
    print("Schema:", schema[0] if schema else "None")
    
    count = conn.execute("SELECT COUNT(*) FROM po_notes_templates").fetchone()[0]
    print(f"Row count: {count}")
    
    if count > 0:
        print("\nSample rows:")
        for row in conn.execute("SELECT * FROM po_notes_templates LIMIT 3").fetchall():
            print(dict(row))
else:
    print("\npo_notes_templates table DOES NOT EXIST!")
    print("Available tables:", tables)

conn.close()
