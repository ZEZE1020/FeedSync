from uuid import UUID
from pydantic import BaseModel


class FarmBase(BaseModel):
    name: str


class FarmCreate(FarmBase):
    pass


class Farm(FarmBase):
    id: UUID
    owner_id: UUID

    class Config:
        from_attributes = True
