from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class GoogleAuthRequest(BaseModel):
    id_token: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserRead"


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    google_id: str
    name: str
    photo_url: str | None
    radius_miles: float
    rating: float
    total_lends: int
    created_at: datetime


class UserUpdate(BaseModel):
    lat: float
    lng: float
    radius_miles: float = Field(default=1.0, gt=0)


class OwnerInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    photo_url: str | None
    rating: float
    total_lends: int


class ItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    owner_id: UUID
    name: str
    category: str
    description: str | None
    photo_url: str | None
    available: bool
    max_days: int
    price_per_day: float = 0.0
    distance_miles: float = 0.0
    created_at: datetime
    owner: OwnerInfo | None = None


class ItemUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    max_days: int | None = Field(default=None, gt=0)
    price_per_day: float | None = Field(default=None, ge=0.0)
    available: bool | None = None


class RequestCreate(BaseModel):
    item_id: UUID
    start_date: date
    end_date: date


class RequestUpdate(BaseModel):
    status: Literal["approved", "declined", "returned"]


class RequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    item_id: UUID
    borrower_id: UUID
    owner_id: UUID
    status: str
    start_date: date
    end_date: date
    created_at: datetime


class RequestDetail(RequestRead):
    item_name: str = ""
    item_photo_url: str | None = None
    borrower_name: str = ""
    owner_name: str = ""


class UserProfileRead(BaseModel):
    id: UUID
    name: str
    photo_url: str | None
    radius_miles: float
    rating: float
    total_lends: int
    created_at: datetime
    listings: list[ItemRead]
    incoming_requests: list["RequestDetail"]


UserRead.model_rebuild()
