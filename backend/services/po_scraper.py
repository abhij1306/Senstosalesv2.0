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
    r"(?:DRG|DRAWING)(?:[\s\.]*NO[\s\.]*|[\s\.]+)?[\:\-]?\s*([A-Z0-9][A-Z0-9\.\-]*)", re.IGNORECASE
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

    def find_value(label_rx, prefer="below", allow_label_like=False):
        label_found = False
        final_empty_match = False  # Track if we found an empty match (to distinguish None vs "")

        for table in tables:
            rows = table.find_all("tr")
            for r_idx, row in enumerate(rows):
                cells = row.find_all(["td", "th"])
                for c_idx, cell in enumerate(cells):
                    cell_text = clean(cell.get_text())

                    if not re.search(label_rx, cell_text, re.IGNORECASE):
                        continue

                    label_found = True
                    inline = re.search(rf"{label_rx}[:\.]?\s*(.+)", cell_text, re.IGNORECASE)

                    found_val = None
                    if inline and has_value(inline.group(1)):
                        val = clean(inline.group(1))
                        if allow_label_like or not RX_LABEL_ONLY.match(val):
                            found_val = val

                    # Check ADJACENT
                    if not found_val and prefer in ["adjacent", "any"] and c_idx + 1 < len(cells):
                        val = clean(cells[c_idx + 1].get_text())
                        if has_value(val):
                            if allow_label_like or not RX_LABEL_ONLY.match(val):
                                found_val = val
                        elif prefer != "below":
                            # Found adjacent cell but it's empty.
                            # Mark as potentially "found but empty" but CONTINUE searching
                            # in case a better non-empty instance exists later.
                            final_empty_match = True

                    # Check BELOW
                    if not found_val and r_idx + 1 < len(rows) and prefer in ["below", "any"]:
                        below_cells = rows[r_idx + 1].find_all(["td", "th"])
                        if c_idx < len(below_cells):
                            val = clean(below_cells[c_idx].get_text())
                            if has_value(val):
                                if allow_label_like or not RX_LABEL_ONLY.match(val):
                                    found_val = val
                            else:
                                # Found below cell but it's empty.
                                final_empty_match = True

                    # Validate found value
                    if found_val:
                        # Reject corruption patterns
                        if (
                            found_val.upper().startswith("DETAILS")
                            or "RAISED ON PO" in found_val.upper()
                            or len(found_val) > 100
                        ):
                            continue  # Keep looking

                        return found_val

        # Return "" if we found the label (and maybe an empty value) but no valid value
        # Return None if we never even found the label
        if final_empty_match or label_found:
            return ""
        return None

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
        val = find_value(rx)
        header[k] = val if val is not None else ""

    # Below-cell fields
    for k, rx in {
        "PURCHASE ORDER": r"PURCHASE\s+ORDER(?:\s+NO[\.]?)?",
        "PO DATE": r"^PO\s+DATE$",
        "ENQUIRY": r"^ENQUIRY$",
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
        val = find_value(rx, prefer=pref)
        # For RC NO, we want to respect the None vs "" distinction for fallback
        # But for general assignment we use ""
        header[k] = val if val is not None else ""

        # Special fallback flag for RC NO
        if k == "RC NO" and val is None:
            header["_RC_NO_NOT_FOUND"] = True

    # Fallback: Try adjacent if main fields missing
    if not header.get("PURCHASE ORDER"):
        val = find_value(r"PURCHASE\s+ORDER", prefer="adjacent")
        header["PURCHASE ORDER"] = val if val is not None else ""
        if not header.get("PURCHASE ORDER"):
            val = find_value(r"Purchase\s+Order\s+No", prefer="adjacent")
            header["PURCHASE ORDER"] = val if val is not None else ""

    if not header.get("PO DATE"):
        val = find_value(r"(PO\s+)?DATE", prefer="adjacent")
        header["PO DATE"] = val if val is not None else ""

    # Validate ENQUIRY
    if header.get("ENQUIRY") and len(str(header["ENQUIRY"])) > 50:
        header["ENQUIRY"] = ""

    # Adjacent-only fields (now tolerant to 'any')
    # Allow label-like values for NAME and DESIGNATION (e.g. "ENGINEER", "SHRI AJIT KUMAR")
    for k, rx in {
        "INSPECTION BY": r"INSPECTION\s+BY",
        "NAME": r"^NAME$",
        "DESIGNATION": r"DESIGNATION",
        "PHONE NO": r"^PHONE\s+NO$",
    }.items():
        allow = k in ["NAME", "DESIGNATION", "INSPECTION BY"]
        val = find_value(rx, prefer="any", allow_label_like=allow)
        header[k] = val if val is not None else ""

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
            search_window = text_content[po_date_match.end() : po_date_match.end() + 200]
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
                            date_match = re.search(r"(\d{1,2}/\d{1,2}/\d{4})", next_row_text)
                            if date_match:
                                header["PO DATE"] = normalize_date(date_match.group(1))
                                break
                    if header.get("PO DATE"):
                        break

    # Fallback for INSPECTION BY (Handles div/font nesting not in standard table rows)
    if not header.get("INSPECTION BY"):
        try:
            insp_node = soup.find(string=re.compile(r"INSPECTION\s+BY", re.IGNORECASE))
            if insp_node:
                # Strategy: Look ahead for the next substantial text node
                # We skip the node itself if it contains the value (inline split failed earlier)
                # But here we assume it wasn't found in table.

                # If text is just label "Inspection By :", value is next.
                curr = insp_node
                found_val = None

                # Try traversing next elements
                for _ in range(5):  # Check next 5 elements
                    curr = curr.find_next(string=True)
                    if not curr:
                        break

                    txt = clean(curr)
                    if not txt or txt == ":" or txt == "-" or not has_value(txt):
                        continue

                    # Found candidate
                    if not RX_LABEL_ONLY.match(txt):
                        found_val = txt
                        break

                if found_val:
                    header["INSPECTION BY"] = found_val
        except Exception as e:
            logger.warning(f"Failed to extract INSPECTION BY: {e}")

    # Fallback for RC NO (Similar to Inspection By, but might be further away)
    # Only run fallback if label was NOT FOUND in table structure at all
    if header.get("_RC_NO_NOT_FOUND"):
        try:
            rc_node = soup.find(string=re.compile(r"RC\s*NO", re.IGNORECASE))
            if rc_node:
                curr = rc_node
                found_val = None
                # RC NO value was seen 5 nodes away in debug
                for _ in range(10):
                    curr = curr.find_next(string=True)
                    if not curr:
                        break

                    txt = clean(curr)
                    if not txt or txt == ":" or txt == "-" or not has_value(txt):
                        continue

                    # Found candidate
                    # Ensure it's not a known label from other fields to be safe
                    if not RX_LABEL_ONLY.match(txt):
                        found_val = txt
                        break

                if found_val:
                    header["RC NO"] = found_val
        except Exception as e:
            logger.warning(f"Failed to extract RC NO fallback: {e}")

    # Cleanup internal flag
    header.pop("_RC_NO_NOT_FOUND", None)

    return header


# --------------------------------------------------
# Item Extraction
# --------------------------------------------------
def extract_items(soup):
    tables = soup.find_all("table")
    item_table = next((t for t in tables if t.find(string=re.compile("MATERIAL CODE", re.I))), None)
    if not item_table:
        return []

    rows = item_table.find_all("tr")
    header_idx = next(
        (i for i, r in enumerate(rows) if r.find(string=re.compile("MATERIAL CODE", re.I))),
        None,
    )
    if header_idx is None:
        return []

    # Phase 1: Collection - Store all delivery rows (composite key: PO_ITM + LOT_NO)
    delivery_rows = []
    description_map = {}  # Map item_id -> description text

    # We iterate all rows after header
    for row in rows[header_idx + 1 :]:
        cols = [clean(td.get_text()) for td in row.find_all("td")]

        # Case A: Item Row (Standard format has ~13 columns, but robustly >= 8)
        # BHEL POs usually have column 0 as Item Sl No.
        if len(cols) >= 8 and cols[0] and cols[0].isdigit():
            item_id = to_int(cols[0])
            if item_id is not None:
                # Each row represents a delivery lot for this item
                delivery_rows.append(
                    {
                        "PO ITM": item_id,
                        "MATERIAL CODE": cols[1],
                        "MTRL CAT": to_int(cols[2]) if len(cols) > 2 else None,
                        "UNIT": cols[3] if len(cols) > 3 else "",
                        "PO RATE": to_float(cols[4]) if len(cols) > 4 else None,
                        "ORD QTY": to_float(cols[5]) if len(cols) > 5 else None,
                        "RCD QTY": to_float(cols[6])
                        if len(cols) > 6
                        else None,  # Maps to received_quantity
                        "ITEM VALUE": to_float(cols[7]) if len(cols) > 7 else None,
                        "LOT NO": to_int(cols[8]) if len(cols) > 8 else None,
                        "DELY QTY": to_float(cols[9]) if len(cols) > 9 else None,
                        "DELY DATE": normalize_date(cols[10]) if len(cols) > 10 else "",
                        "ENTRY ALLOW DATE": normalize_date(cols[11]) if len(cols) > 11 else "",
                        "DEST CODE": to_int(cols[12]) if len(cols) > 12 else None,
                    }
                )

        # Case B: Description Row
        # Usually 4 columns: [Desc, Spacer, ItemID, Spacer]
        # Or sometimes just [Desc, ItemID] depending on colspan
        elif 1 <= len(cols) <= 5:
            # We look for a linking ID in the columns.
            # In the observed HTML, typically col[2] is the ID.
            # But let's be robust: find a column that is exactly an integer
            link_id = None
            desc_text = cols[0]  # Assume first col is description

            # Helper to check if a val matches a known item ID
            for c in cols:
                if c and c.isdigit():
                    potential_id = int(c)
                    link_id = potential_id
                    break

            if link_id:
                # Store description for this item
                current_desc = description_map.get(link_id, "")
                new_desc = (current_desc + " " + desc_text).strip() if current_desc else desc_text
                description_map[link_id] = new_desc

    # Phase 2: Aggregation - Group delivery rows by PO_ITM
    items_map = {}

    for row in delivery_rows:
        item_no = row["PO ITM"]

        # Create item entry if it doesn't exist
        if item_no not in items_map:
            items_map[item_no] = {
                "PO ITM": item_no,
                "MATERIAL CODE": row["MATERIAL CODE"],
                "DESCRIPTION": description_map.get(item_no, ""),
                "DRG": "",  # Will be extracted from description
                "MTRL CAT": row["MTRL CAT"],
                "UNIT": row["UNIT"],
                "PO RATE": row["PO RATE"],
                "ORD QTY": row["ORD QTY"],
                "RCD QTY": row["RCD QTY"],  # High-water mark from source
                "ITEM VALUE": row["ITEM VALUE"],
                "deliveries": [],
            }

        # Add this delivery lot to the item
        if row["LOT NO"] is not None:
            items_map[item_no]["deliveries"].append(
                {
                    "LOT NO": row["LOT NO"],
                    "DELY QTY": row["DELY QTY"],
                    "RCD QTY": row["RCD QTY"],  # Received quantity for this lot
                    "DELY DATE": row["DELY DATE"],
                    "ENTRY ALLOW DATE": row["ENTRY ALLOW DATE"],
                    "DEST CODE": row["DEST CODE"],
                }
            )

    # Phase 3: Extract DRG and Distribute received quantities
    # BHEL PO HTML provides RCD QTY at item-level only, but repeats it per row.
    # We must distribute this total across lots to prevent doubling during Sum aggregation.
    for _, item in items_map.items():
        # Handle DRG
        desc = item["DESCRIPTION"]
        m = RX_DRG.search(desc)
        if m:
            item["DRG"] = m.group(1)

        # Handle RCD QTY distribution
        total_rcd = item.get("RCD QTY") or 0
        rem_rcd = total_rcd

        # We distribute across lots: Lot 1 gets filled first, then Lot 2, etc.
        for d in item["deliveries"]:
            lot_ord = d.get("DELY QTY") or 0
            # How much of rem_rcd can we put in this lot?
            # We assume it fills up to lot_ord, and remainder goes to next.
            # But if total_rcd > total_ord, the last lot gets the excess.

            # If it's the last lot, give it everything remaining
            is_last = d == item["deliveries"][-1]
            if is_last:
                d["RCD QTY"] = rem_rcd
            else:
                take = min(rem_rcd, lot_ord)
                d["RCD QTY"] = take
                rem_rcd -= take

    # Conversion to list and sorting
    return sorted(list(items_map.values()), key=lambda x: x["PO ITM"])
