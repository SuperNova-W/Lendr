from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from geoalchemy2.elements import WKTElement
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.models import Item, User
from app.schemas.schemas import ItemRead, UserRead, UserUpdate


router = APIRouter(prefix="/users", tags=["users"])


def point_wkt(lat: float, lng: float) -> WKTElement:
    return WKTElement(f"POINT({lng} {lat})", srid=4326)


@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)) -> UserRead:
    return UserRead.model_validate(current_user)


@router.patch("/me", response_model=UserRead)
async def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    current_user.radius_miles = payload.radius_miles
    current_user.location = point_wkt(payload.lat, payload.lng)
    await db.commit()
    await db.refresh(current_user)
    return UserRead.model_validate(current_user)


@router.get("/{user_id}/items", response_model=list[ItemRead])
async def get_user_items(user_id: UUID, db: AsyncSession = Depends(get_db)) -> list[ItemRead]:
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    result = await db.execute(
        select(Item)
        .where(Item.owner_id == user_id)
        .order_by(Item.created_at.desc())
    )
    items = result.scalars().all()
    for item in items:
        item.owner = user
    return [ItemRead.model_validate(item) for item in items]
