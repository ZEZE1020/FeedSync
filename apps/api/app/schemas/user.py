from uuid import UUID
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: UUID

    class Config:
        from_attributes = True


class UserInDB(User):
    hashed_password: str
