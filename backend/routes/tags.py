from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime, timezone
from bson import ObjectId

from database import db
from models import TagCreate, TagResponse, UserInDB
from auth_utils import get_current_user

router = APIRouter(prefix="/tags", tags=["tags"])

@router.post("/", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag: TagCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    # Check for uniqueness
    existing_tag = await db.get_db()["tags"].find_one({
        "user_id": current_user.id,
        "name": tag.name
    })
    if existing_tag:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tag already exists")

    tag_data = tag.model_dump()
    tag_data["user_id"] = current_user.id
    tag_data["created_at"] = datetime.now(timezone.utc)

    new_tag = await db.get_db()["tags"].insert_one(tag_data)
    created_tag = await db.get_db()["tags"].find_one({"_id": new_tag.inserted_id})
    
    return TagResponse(**created_tag)

@router.get("/", response_model=List[TagResponse])
async def list_tags(
    current_user: UserInDB = Depends(get_current_user)
):
    cursor = db.get_db()["tags"].find({"user_id": current_user.id}).sort("name", 1)
    tags = await cursor.to_list(length=1000)
    return [TagResponse(**tag) for tag in tags]

@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    tag_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        obj_id = ObjectId(tag_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid tag ID")

    # Check if tag exists
    existing_tag = await db.get_db()["tags"].find_one({"_id": obj_id, "user_id": current_user.id})
    if not existing_tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")

    # Delete tag
    await db.get_db()["tags"].delete_one({"_id": obj_id})
    
    # Remove this tag from any notes that use it (stored as name string in notes)
    await db.get_db()["notes"].update_many(
        {"user_id": current_user.id, "tags": existing_tag["name"]},
        {"$pull": {"tags": existing_tag["name"]}}
    )

    return None