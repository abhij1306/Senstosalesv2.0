import sqlite3

DB_PATH = "../db/business.db"

DEFAULTS = {
    "buyer_name": "M/S Bharat Heavy Electricals Limited, Bhopal",
    "buyer_gstin": "23AAACB4146P1ZN",
    "buyer_address": "Piplani, Bhopal - 462022 (M.P.)",
    "buyer_state": "Madhya Pradesh",
    "buyer_state_code": "23",
    "buyer_place_of_supply": "Bhopal",
    "company_name": "SenstoSales Pro",
    "company_address": "Default Company Address",
    "company_gstin": "23ABCDE1234F1Z5",
}


def populate_settings():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Ensure table exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        print("Populating settings...")
        for key, value in DEFAULTS.items():
            # Upsert
            cursor.execute(
                """
                INSERT INTO settings (key, value) VALUES (?, ?)
                ON CONFLICT(key) DO UPDATE SET value=excluded.value
            """,
                (key, value),
            )
            print(f"Set {key} = {value}")

        conn.commit()
        print("Settings populated successfully.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        if "conn" in locals() and conn:
            conn.close()


if __name__ == "__main__":
    populate_settings()
