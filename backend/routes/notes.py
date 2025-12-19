from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId

from database import db
from models import NoteCreate, NoteResponse, NoteInDB, UserInDB, NoteUpdate, PyObjectId
from auth_utils import get_current_user

router = APIRouter(prefix="/notes", tags=["notes"])

@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note: NoteCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    note_data = note.model_dump()
    note_data["user_id"] = current_user.id
    note_data["created_at"] = datetime.now(timezone.utc)
    note_data["updated_at"] = datetime.now(timezone.utc)
    note_data["is_archived"] = False

    new_note = await db.get_db()["notes"].insert_one(note_data)
    created_note = await db.get_db()["notes"].find_one({"_id": new_note.inserted_id})
    
    return NoteResponse(**created_note)

@router.get("/", response_model=List[NoteResponse])
async def list_notes(
    limit: int = Query(default=10, ge=1),
    archived: bool = Query(default=False),
    search: Optional[str] = None,
    tags: Optional[str] = Query(default=None),
    current_user: UserInDB = Depends(get_current_user)
):
    filter_query = {
        "user_id": current_user.id,
        "is_archived": archived
    }

    if search:
        filter_query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}}
        ]

    if tags:
        tag_list = [t.strip() for t in tags.split(",") if t.strip()]
        if tag_list:
            filter_query["tags"] = {"$all": tag_list}
    
    cursor = db.get_db()["notes"].find(filter_query).sort("updated_at", -1).limit(limit)
    notes = await cursor.to_list(length=limit)
    
    return [NoteResponse(**note) for note in notes]

@router.delete("/archive/clear", status_code=status.HTTP_200_OK)
async def clear_archive(
    current_user: UserInDB = Depends(get_current_user)
):
    result = await db.get_db()["notes"].delete_many({
        "user_id": current_user.id,
        "is_archived": True
    })
    
    return {"message": "Archive cleared", "deleted_count": result.deleted_count}

@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        obj_id = ObjectId(note_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid note ID")

    note = await db.get_db()["notes"].find_one({"_id": obj_id, "user_id": current_user.id})
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
        
    return NoteResponse(**note)

@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: str,
    note_update: NoteUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        obj_id = ObjectId(note_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid note ID")
    
    # Check if note exists and belongs to user
    existing_note = await db.get_db()["notes"].find_one({"_id": obj_id, "user_id": current_user.id})
    if not existing_note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    update_data = note_update.model_dump(exclude_unset=True)
    
    if not update_data:
        return NoteResponse(**existing_note)
        
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.get_db()["notes"].update_one(
        {"_id": obj_id},
        {"$set": update_data}
    )
    
    updated_note = await db.get_db()["notes"].find_one({"_id": obj_id})
    return NoteResponse(**updated_note)

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        obj_id = ObjectId(note_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid note ID")
    
    # Check if note exists and belongs to user
    existing_note = await db.get_db()["notes"].find_one({"_id": obj_id, "user_id": current_user.id})
    if not existing_note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    # Soft delete
    await db.get_db()["notes"].update_one(
        {"_id": obj_id},
        {"$set": {
            "is_archived": True,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    return None

@router.post("/{note_id}/restore", response_model=NoteResponse)
async def restore_note(
    note_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        obj_id = ObjectId(note_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid note ID")
    
    # Check if note exists and belongs to user
    existing_note = await db.get_db()["notes"].find_one({"_id": obj_id, "user_id": current_user.id})
    if not existing_note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    await db.get_db()["notes"].update_one(
        {"_id": obj_id},
        {"$set": {
            "is_archived": False,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    updated_note = await db.get_db()["notes"].find_one({"_id": obj_id})
    return NoteResponse(**updated_note)

@router.delete("/{note_id}/permanent", status_code=status.HTTP_204_NO_CONTENT)
async def permanent_delete_note(
    note_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        obj_id = ObjectId(note_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid note ID")
    
    # Check if note exists and belongs to user
    existing_note = await db.get_db()["notes"].find_one({"_id": obj_id, "user_id": current_user.id})
    if not existing_note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    await db.get_db()["notes"].delete_one({"_id": obj_id})
    
    return None