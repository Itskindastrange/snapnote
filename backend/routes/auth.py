from fastapi import APIRouter, Depends, HTTPException, status, Response
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from database import db, settings
from models import UserCreate, UserResponse, UserInDB
from auth_utils import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate, response: Response):
    # Check if email exists
    existing_user = await db.get_db()["users"].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash password
    hashed_password = get_password_hash(user.password)

    # Create user document
    user_in_db = UserInDB(
        email=user.email,
        name=user.name,
        password_hash=hashed_password
    )
    
    # Insert into DB
    new_user = await db.get_db()["users"].insert_one(user_in_db.model_dump(by_alias=True, exclude={"id"}))
    created_user = await db.get_db()["users"].find_one({"_id": new_user.inserted_id})
    
    # Auto-login: Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Set HttpOnly cookie
    # On Render (production), we need SameSite=None and Secure=True for cross-site cookies
    # On Localhost, we use SameSite=Lax and Secure=False
    samesite_mode = "none" if settings.RENDER else "lax"
    secure_mode = True if settings.RENDER else False

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite=samesite_mode,
        secure=secure_mode,
    )

    return UserResponse(**created_user)

@router.post("/login", response_model=UserResponse)
async def login(login_data: LoginRequest, response: Response):
    user = await db.get_db()["users"].find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    samesite_mode = "none" if settings.RENDER else "lax"
    secure_mode = True if settings.RENDER else False

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite=samesite_mode,
        secure=secure_mode,
    )
    
    return UserResponse(**user)

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    return current_user