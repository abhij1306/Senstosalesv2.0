import sqlite3
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.db import get_db
from app.models import Settings, SettingsUpdate

router = APIRouter()

@router.get("/", response_model=Settings)
def get_settings(db: sqlite3.Connection = Depends(get_db)):
    """Get all settings as a dict mapped to Settings model"""
    cursor = db.execute("SELECT key, value FROM settings")
    rows = cursor.fetchall()
    settings_dict = {row["key"]: row["value"] for row in rows}
    return settings_dict

@router.post("/")
def update_setting(setting: SettingsUpdate, db: sqlite3.Connection = Depends(get_db)):
    """Update a single setting"""
    try:
        db.execute(
            "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (setting.key, setting.value),
        )
        db.commit()
        return {"success": True, "key": setting.key, "value": setting.value}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch")
def update_settings_batch(settings: List[SettingsUpdate], db: sqlite3.Connection = Depends(get_db)):
    """Batch update settings"""
    try:
        data = [(s.key, s.value) for s in settings]
        db.executemany(
            "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            data,
        )
        db.commit()
        return {"success": True, "count": len(settings)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
