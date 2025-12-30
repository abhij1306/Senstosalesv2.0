import logging
import sqlite3
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.db import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

class BuyerBase(BaseModel):
    name: str
    gstin: str
    billing_address: str
    shipping_address: Optional[str] = None
    place_of_supply: str
    state: Optional[str] = None
    state_code: Optional[str] = None
    is_default: bool = False
    is_active: bool = True

class BuyerCreate(BuyerBase):
    pass

class Buyer(BuyerBase):
    id: int

@router.get("/", response_model=List[Buyer])
def list_buyers(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.execute("SELECT * FROM buyers WHERE is_active = 1")
    return [dict(row) for row in cursor.fetchall()]

@router.post("/", response_model=Buyer)
def create_buyer(buyer: BuyerCreate, db: sqlite3.Connection = Depends(get_db)):
    # Duplicate GSTIN Check
    existing = db.execute("SELECT id FROM buyers WHERE gstin = ?", (buyer.gstin,)).fetchone()
    if existing:
        raise HTTPException(status_code=400, detail="Buyer with this GSTIN already exists.")

    try:
        # If this is the first buyer, it should be default
        cursor = db.execute("SELECT count(*) as count FROM buyers")
        count = cursor.fetchone()["count"]
        is_default = 1 if count == 0 else (1 if buyer.is_default else 0)

        # Ensure only one default
        if is_default == 1:
            db.execute("UPDATE buyers SET is_default = 0")

        cursor = db.execute(
            """INSERT INTO buyers 
               (name, gstin, billing_address, shipping_address, place_of_supply, state, state_code, is_default, is_active)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (buyer.name, buyer.gstin, buyer.billing_address, buyer.shipping_address, 
             buyer.place_of_supply, buyer.state, buyer.state_code, is_default, 1)
        )
        db.commit()
        new_id = cursor.lastrowid
        return {**buyer.dict(), "id": new_id, "is_default": bool(is_default)}
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create buyer: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{id}", response_model=Buyer)
def update_buyer(id: int, buyer: BuyerCreate, db: sqlite3.Connection = Depends(get_db)):
    try:
        db.execute(
            """UPDATE buyers SET 
               name = ?, gstin = ?, billing_address = ?, shipping_address = ?, 
               place_of_supply = ?, state = ?, state_code = ?, is_active = ?
               WHERE id = ?""",
            (buyer.name, buyer.gstin, buyer.billing_address, buyer.shipping_address, 
             buyer.place_of_supply, buyer.state, buyer.state_code, 1 if buyer.is_active else 0, id)
        )
        db.commit()
        return {**buyer.dict(), "id": id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{id}/default")
def set_buyer_default(id: int, db: sqlite3.Connection = Depends(get_db)):
    try:
        db.execute("UPDATE buyers SET is_default = 0")
        db.execute("UPDATE buyers SET is_default = 1 WHERE id = ?", (id,))
        db.commit()
        return {"success": True}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{id}")
def delete_buyer(id: int, db: sqlite3.Connection = Depends(get_db)):
    try:
        # Soft delete
        db.execute("UPDATE buyers SET is_active = 0, is_default = 0 WHERE id = ?", (id,))
        db.commit()
        return {"success": True}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
