"""
PO Notes Router
Handles CRUD operations for PO Notes templates.
"""

import sqlite3
from typing import List

from fastapi import APIRouter, Depends, HTTPException

# Simple Pydantic models for internal use if not in models.py
from pydantic import BaseModel

from backend.db.session import get_db


class PONoteCreate(BaseModel):
    title: str
    content: str
    is_active: bool = True


class PONoteUpdate(BaseModel):
    title: str = None
    content: str = None
    is_active: bool = None


class PONoteOut(BaseModel):
    id: str  # Changed from int - migration 003 uses TEXT for id
    title: str
    content: str
    is_active: bool
    created_at: str
    updated_at: str


router = APIRouter()


@router.get("/", response_model=List[PONoteOut])
def list_po_notes(db: sqlite3.Connection = Depends(get_db)):
    """List all active PO Notes templates"""
    rows = db.execute(
        "SELECT * FROM po_notes_templates WHERE is_active = 1 ORDER BY created_at DESC"
    ).fetchall()
    return [dict(row) for row in rows]


@router.get("/{note_id}", response_model=PONoteOut)
def get_po_note(note_id: str, db: sqlite3.Connection = Depends(get_db)):
    """Get a specific PO Note template"""
    row = db.execute("SELECT * FROM po_notes_templates WHERE id = ?", (note_id,)).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Note not found")

    return dict(row)


@router.post("/", response_model=PONoteOut)
def create_po_note(note: PONoteCreate, db: sqlite3.Connection = Depends(get_db)):
    """Create a new PO Note template"""
    cursor = db.cursor()
    cursor.execute(
        """
        INSERT INTO po_notes_templates (title, content, is_active, created_at, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """,
        (note.title, note.content, 1 if note.is_active else 0),
    )
    db.commit()

    new_id = cursor.lastrowid
    return get_po_note(new_id, db)


@router.put("/{note_id}", response_model=PONoteOut)
def update_po_note(note_id: str, note: PONoteUpdate, db: sqlite3.Connection = Depends(get_db)):
    """Update a PO Note template"""
    # Check existence
    existing = db.execute("SELECT id FROM po_notes_templates WHERE id = ?", (note_id,)).fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="Note not found")

    # Build update query
    fields = []
    values = []
    if note.title is not None:
        fields.append("title = ?")
        values.append(note.title)
    if note.content is not None:
        fields.append("content = ?")
        values.append(note.content)
    if note.is_active is not None:
        fields.append("is_active = ?")
        values.append(1 if note.is_active else 0)

    if not fields:
        return get_po_note(note_id, db)

    fields.append("updated_at = CURRENT_TIMESTAMP")
    values.append(note_id)

    query = f"UPDATE po_notes_templates SET {', '.join(fields)} WHERE id = ?"
    db.execute(query, tuple(values))
    db.commit()

    return get_po_note(note_id, db)


@router.delete("/{note_id}")
def delete_po_note(note_id: str, db: sqlite3.Connection = Depends(get_db)):
    """Soft delete a PO Note template"""
    existing = db.execute("SELECT id FROM po_notes_templates WHERE id = ?", (note_id,)).fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="Note not found")

    db.execute("UPDATE po_notes_templates SET is_active = 0 WHERE id = ?", (note_id,))
    db.commit()

    return {"message": "Note deleted successfully"}
