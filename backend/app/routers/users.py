from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from geoalchemy2.elements import WKTElement
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.models import Item, Request, User
from app.schemas.schemas import ItemRead, RequestDetail, RequestRead, UserProfileRead, UserRead, UserUpdate


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


@router.get("/me/profile", response_model=UserProfileRead)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserProfileRead:
    items_result = await db.execute(
        select(Item).where(Item.owner_id == current_user.id).order_by(Item.created_at.desc())
    )
    items = items_result.scalars().all()
    for item in items:
        item.owner = current_user

    BorrowerUser = aliased(User, name="borrower")
    OwnerUser = aliased(User, name="owner_user")
    reqs_result = await db.execute(
        select(Request, Item, BorrowerUser, OwnerUser)
        .join(Item, Request.item_id == Item.id)
        .join(BorrowerUser, Request.borrower_id == BorrowerUser.id)
        .join(OwnerUser, Request.owner_id == OwnerUser.id)
        .where(Request.owner_id == current_user.id)
        .order_by(Request.created_at.desc())
    )
    incoming: list[RequestDetail] = []
    for req, item, borrower, owner in reqs_result.all():
        base = RequestRead.model_validate(req).model_dump()
        incoming.append(RequestDetail(**base, item_name=item.name, item_photo_url=item.photo_url, borrower_name=borrower.name, owner_name=owner.name))

    return UserProfileRead(
        id=current_user.id,
        name=current_user.name,
        photo_url=current_user.photo_url,
        radius_miles=current_user.radius_miles,
        rating=current_user.rating,
        total_lends=current_user.total_lends,
        created_at=current_user.created_at,
        listings=[ItemRead.model_validate(item) for item in items],
        incoming_requests=incoming,
    )


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
