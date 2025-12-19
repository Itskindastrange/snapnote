from typing import Optional, Any
from datetime import datetime, timezone
from typing_extensions import Annotated
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict, EmailStr

# Helper for ObjectId compatibility with Pydantic V2
PyObjectId = Annotated[str, BeforeValidator(str)]

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
class UserInDB(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

class NoteBase(BaseModel):
    title: str
    content: str
    tags: list[str] = []
    is_archived: bool = False

class NoteCreate(BaseModel):
    title: str
    content: str
    tags: list[str] = []

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[list[str]] = None
    is_archived: Optional[bool] = None

class NoteInDB(NoteBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

class NoteResponse(NoteBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

class UserResponse(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    created_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )
class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagInDB(TagBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

class TagResponse(TagBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    created_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )