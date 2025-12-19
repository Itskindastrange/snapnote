from fastapi import APIRouter, Depends, HTTPException, status
from models import UserUpdate, UserResponse, UserInDB
from auth_utils import get_current_user
from database import db
from bson import ObjectId

router = APIRouter(prefix="/users", tags=["users"])

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    update_data = user_update.model_dump(exclude_unset=True)
    
    if not update_data:
        return current_user

    # current_user.id is already a string (PyObjectId), so we need to convert it to ObjectId for MongoDB query
    await db.get_db()["users"].update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_data}
    )
    
    updated_user = await db.get_db()["users"].find_one({"_id": ObjectId(current_user.id)})
    return UserResponse(**updated_user)