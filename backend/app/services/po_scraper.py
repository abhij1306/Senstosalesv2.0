"""
PO Scraper - Refactored for FastAPI
Extracts PO data from HTML files
"""

import re
from datetime import datetime

# --------------------------------------------------
# Regex
# --------------------------------------------------
RX_LABEL_ONLY = re.compile(r"^[A-Z\s/-]{3,}$")
RX_DRG = re.compile(
    r"DRG(?:[\s\.]*NO[\s\.]*|[\s\.]+)[\:\-]?\s*([A-Z0-9][A-Z0-9\.\-]*)", re.IGNORECASE
)


# --------------------------------------------------
# Helpers
# --------------------------------------------------
def clean(text):
    return re.sub(r"\s+", " ", text or "").strip()


def has_value(text):
    return bool(text and any(c.isalnum() for c in text))


def to_int(val):
    try:
        v = re.sub(r"[^\d]", "", str(val))
        return int(v) if v else None
    except Exception:
        return None


def to_float(val):
    try:
        v = re.sub(r"[^\d.\-]", "", str(val))
        return float(v) if v else None
    except Exception:
        return None


def normalize_date(val):
    if not val:
        return ""

    s = str(val).strip().upper()

    # dd/mm/yyyy or dd-mm-yyyy
    m = re.search(r"(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})", s)
    if m:
        d, mth, y = m.groups()
        if len(y) == 2:
            y = "20" + y
        return f"{int(d):02d}/{int(mth):02d}/{int(y)}"

    # dd-MMM-yy or dd-MMM-yyyy
    m = re.search(r"(\d{1,2})[\/\-]([A-Z]{3})[\/\-](\d{2,4})", s)
    if m:
        d, mon, y = m.groups()
        if len(y) == 2:
            y = "20" + y
        try:
            dt = datetime.strptime(f"{d}-{mon}-{y}", "%d-%b-%Y")
            return dt.strftime("%d/%m/%Y")
        except Exception:
            return ""

    return ""


# --------------------------------------------------
# Header Extraction
# --------------------------------------------------
def extract_po_header(soup):
    tables = soup.find_all("table")
    header = {}

    def find_value(label_rx, prefer="below"):
        for table in tables:
            rows = table.find_all("tr")
            for r_idx, row in enumerate(rows):
                cells = row.find_all("td")
                for c_idx, cell in enumerate(cells):
                    cell_text = clean(cell.get_text())

                    if not re.search(label_rx, cell_text, re.IGNORECASE):
                        continue

                    inline = re.search(
                        rf"{label_rx}[:\.]?\s*(.+)", cell_text, re.IGNORECASE
                    )
                    if inline and has_value(inline.group(1)):
                        return clean(inline.group(1))

                    if prefer in ["adjacent", "any"] and c_idx + 1 < len(cells):
                        val = clean(cells[c_idx + 1].get_text())
                        if has_value(val):
                            return val

                    if r_idx + 1 < len(rows) and prefer in ["below", "any"]:
                        below_cells = rows[r_idx + 1].find_all("td")
                        if c_idx < len(below_cells):
                            val = clean(below_cells[c_idx].get_text())
                            if has_value(val) and not RX_LABEL_ONLY.match(val):
                                return val
        return ""

    # Inline fields
    for k, rx in {
        "TIN NO": r"TIN\s+NO",
        "ECC NO": r"ECC\s+NO",
        "MPCT NO": r"MPCT\s+NO",
        "PHONE": r"PHONE",
        "FAX": r"FAX",
        "EMAIL": r"EMAIL",
        "WEBSITE": r"WEBSITE",
    }.items():
        header[k] = find_value(rx)

    # Below-cell fields
    for k, rx in {
        "PURCHASE ORDER": r"PURCHASE\s+ORDER(?:\s+NO[\.]?)?",
        "PO DATE": r"^PO\s+DATE$",  # Fixed: Must match exactly "PO DATE", not any "*DATE"
        "ENQUIRY": r"^ENQUIRY$",  # Made more specific - exact match only
        "SUPP CODE": r"SUPP\s+CODE",
        "ORD-TYPE": r"ORD-TYPE",
        "DVN": r"DVN",
        "QUOTATION": r"QUOTATION",
        "QUOT-DATE": r"QUOT-DATE",
        "PO STATUS": r"PO\s+STATUS",
        "AMEND NO": r"AMEND\s+NO",
        "PO-VALUE": r"PO-VALUE",
        "RC NO": r"RC\s+NO",
        "EX RATE": r"EX\s+RATE",
        "CURRENCY": r"CURRENCY",
        "FOB VALUE": r"FOB\s+VALUE",
        "NET PO VAL": r"NET\s+PO\s+VAL",
        "ENQ DATE": r"ENQ\s+DATE",
        "REMARKS": r"REMARKS",
        "TOTAL VALUE": r"TOTAL\s+VALUE",
        "SUPP NAME M/S": r"^SUPP\s+NAME\s+M/S$",
    }.items():
        pref = "any" if k in ["PURCHASE ORDER", "PO DATE"] else "below"
        header[k] = find_value(rx, prefer=pref)

    # Fallback: Try adjacent if main fields missing (handles different formats like test files)
    if not header.get("PURCHASE ORDER"):
        header["PURCHASE ORDER"] = find_value(r"PURCHASE\s+ORDER", prefer="adjacent")
        # If still empty, try "Purchase Order No" specifically
        if not header.get("PURCHASE ORDER"):
            header["PURCHASE ORDER"] = find_value(
                r"Purchase\s+Order\s+No", prefer="adjacent"
            )

    if not header.get("PO DATE"):
        # Try finding just "Date" which is common in simple tables
        header["PO DATE"] = find_value(r"(PO\s+)?DATE", prefer="adjacent")

    # Validate ENQUIRY - reject if too long (likely grabbed "Important Note" text)
    if header.get("ENQUIRY") and len(str(header["ENQUIRY"])) > 50:
        header["ENQUIRY"] = ""  # Clear invalid data

    # Adjacent-only fields
    for k, rx in {
        "INSPECTION BY": r"INSPECTION\s+BY",
        "NAME": r"^NAME$",
        "DESIGNATION": r"DESIGNATION",
        "PHONE NO": r"^PHONE\s+NO$",
    }.items():
        header[k] = find_value(rx, prefer="adjacent")

    # DRG
    header["DRG"] = ""
    for table in tables:
        m = RX_DRG.search(table.get_text(" ", strip=True))
        if m:
            header["DRG"] = m.group(1)
            break

    # ---- numeric normalization ----
    # NOTE: Database schema changes - po_number, tin_no, rc_no are TEXT now
    # Only convert fields that are actually INTEGER in the database
    for k in ["DVN", "AMEND NO"]:  # department_no and amend_no are INTEGER
        header[k] = to_int(header.get(k))
    
    # Keep these as strings (they map to TEXT columns in database)
    # "PURCHASE ORDER" -> po_number (TEXT)
    # "TIN NO" -> tin_no (TEXT)  
    # "RC NO" -> rc_no (TEXT)
    # Convert to string to ensure consistency
    for k in ["PURCHASE ORDER", "TIN NO", "RC NO"]:
        val = header.get(k)
        header[k] = str(val) if val is not None else None

    for k in ["PO-VALUE", "TOTAL VALUE", "NET PO VAL", "FOB VALUE", "EX RATE"]:
        header[k] = to_float(header.get(k))

    header["DRG"] = to_int(header.get("DRG"))

    # ---- date normalization ----
    for k in ["PO DATE", "QUOT-DATE", "ENQ DATE"]:
        header[k] = normalize_date(header.get(k))

    # NUCLEAR FALLBACK: If PO DATE is still empty/whitespace, scan near "PO DATE" label
    # This handles BHEL format where table-based extraction fails
    if not header.get("PO DATE") or not header["PO DATE"].strip():
        # Strategy: Find "PO DATE" label in text, then look for date within next 200 chars
        text_content = soup.get_text(" ", strip=True)
        po_date_match = re.search(r"PO\s+DATE", text_content, re.IGNORECASE)

        if po_date_match:
            # Search for date pattern within 200 chars after "PO DATE" label
            search_window = text_content[
                po_date_match.end() : po_date_match.end() + 200
            ]
            date_match = re.search(r"(\d{1,2}/\d{1,2}/\d{4})", search_window)
            if date_match:
                header["PO DATE"] = normalize_date(date_match.group(1))

        # Ultimate fallback: if still empty, try all tables for date in row below "PO DATE"
        if not header.get("PO DATE") or not header["PO DATE"].strip():
            tables = soup.find_all("table")
            for table in tables:
                rows = table.find_all("tr")
                for r_idx, row in enumerate(rows):
                    # Check if this row contains "PO DATE"
                    row_text = clean(row.get_text())
                    if re.search(r"PO\s+DATE", row_text, re.IGNORECASE):
                        # Check next row for date
                        if r_idx + 1 < len(rows):
                            next_row_text = rows[r_idx + 1].get_text()
                            date_match = re.search(
                                r"(\d{1,2}/\d{1,2}/\d{4})", next_row_text
                            )
                            if date_match:
                                header["PO DATE"] = normalize_date(date_match.group(1))
                                break
                    if header.get("PO DATE"):
                        break

    return header


# --------------------------------------------------
# Item Extraction
# --------------------------------------------------
def extract_items(soup):
    tables = soup.find_all("table")
    item_table = next(
        (t for t in tables if t.find(string=re.compile("MATERIAL CODE", re.I))), None
    )
    if not item_table:
        return []

    rows = item_table.find_all("tr")
    header_idx = next(
        (
            i
            for i, r in enumerate(rows)
            if r.find(string=re.compile("MATERIAL CODE", re.I))
        ),
        None,
    )
    if header_idx is None:
        return []

    # Phase 1: Collection
    items_map = {}
    
    # We iterate all rows after header
    for row in rows[header_idx + 1 :]:
        cols = [clean(td.get_text()) for td in row.find_all("td")]

        # Case A: Item Row (Standard format has ~13 columns, but robustly >= 8)
        # BHEL POs usually have column 0 as Item Sl No.
        if len(cols) >= 8 and cols[0] and cols[0].isdigit():
            item_id = to_int(cols[0])
            if item_id is not None:
                items_map[item_id] = {
                    "PO ITM": item_id,
                    "MATERIAL CODE": cols[1],
                    "DESCRIPTION": "", # Will be filled later
                    "DRG": "",         # Will be filled later
                    "MTRL CAT": to_int(cols[2]) if len(cols) > 2 else None,
                    "UNIT": cols[3] if len(cols) > 3 else "",
                    "PO RATE": to_float(cols[4]) if len(cols) > 4 else None,
                    "ORD QTY": to_int(cols[5]) if len(cols) > 5 else None,
                    "RCD QTY": to_int(cols[6]) if len(cols) > 6 else None,
                    "ITEM VALUE": to_float(cols[7]) if len(cols) > 7 else None,
                    "LOT NO": to_int(cols[8]) if len(cols) > 8 else None,
                    "DELY QTY": to_int(cols[9]) if len(cols) > 9 else None,
                    "DELY DATE": normalize_date(cols[10]) if len(cols) > 10 else "",
                    "ENTRY ALLOW DATE": normalize_date(cols[11]) if len(cols) > 11 else "",
                    "DEST CODE": to_int(cols[12]) if len(cols) > 12 else None,
                }

        # Case B: Description Row
        # Usually 4 columns: [Desc, Spacer, ItemID, Spacer]
        # Or sometimes just [Desc, ItemID] depending on colspan
        elif 1 <= len(cols) <= 5:
            # We look for a linking ID in the columns.
            # In the observed HTML, typically col[2] is the ID.
            # But let's be robust: find a column that is exactly an integer and exists in items_map
            link_id = None
            desc_text = cols[0] # Assume first col is description
            
            # Helper to check if a val matches a known item ID
            for c in cols:
                if c and c.isdigit():
                    potential_id = int(c)
                    if potential_id in items_map:
                        link_id = potential_id
                        break
            
            if link_id:
                # We found a matching item for this description
                # Update the description
                current_desc = items_map[link_id]["DESCRIPTION"]
                # Append if exists (though usually it's one row)
                new_desc = (current_desc + " " + desc_text).strip() if current_desc else desc_text
                items_map[link_id]["DESCRIPTION"] = new_desc
                
                # Extract DRG from this specific description line
                m = RX_DRG.search(desc_text)
                if m:
                     items_map[link_id]["DRG"] = m.group(1)

    # Conversion to list and sorting
    return sorted(list(items_map.values()), key=lambda x: x["PO ITM"])
