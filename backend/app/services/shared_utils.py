
import re
from datetime import datetime

def clean(text):
    if not text: return ""
    # Remove extra whitespace and special characters
    return re.sub(r'\s+', ' ', str(text)).strip()

def normalize_date(val):
    if not val: return None
    if isinstance(val, (datetime, datetime.date)):
        return val.strftime("%Y-%m-%d")
    
    # Try common formats
    val = str(val).strip()
    for fmt in ("%d-%m-%Y", "%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y"):
        try:
            return datetime.strptime(val, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return val

def has_value(val):
    if val is None: return False
    if isinstance(val, str) and not val.strip(): return False
    return True

def to_int(val, default=0):
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return default

def find_value(data, keys, default=None):
    if not data or not keys: return default
    for key in keys:
        if key in data and data[key] is not None:
            return data[key]
    return default
