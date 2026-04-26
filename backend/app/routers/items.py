from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from geoalchemy2.elements import WKTElement
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.models import Item, User
from app.schemas.schemas import ItemRead, ItemUpdate
from app.utils.storage import upload_item_photo


router = APIRouter(prefix="/items", tags=["items"])


def point_wkt(lat: float, lng: float) -> WKTElement:
    return WKTElement(f"POINT({lng} {lat})", srid=4326)


@router.get("/nearby", response_model=list[ItemRead])
async def get_nearby_items(
    lat: float,
    lng: float,
    radius: float = 1.0,
    db: AsyncSession = Depends(get_db),
) -> list[ItemRead]:
    radius_meters = radius * 1609.34
    user_point = point_wkt(lat, lng)
    dist_expr = (func.ST_Distance(Item.location, user_point, True) / 1609.34).label("distance_miles")
    query = (
        select(Item, dist_expr)
        .options(selectinload(Item.owner))
        .where(Item.available.is_(True))
        .where(func.ST_DWithin(Item.location, user_point, radius_meters))
        .order_by(dist_expr)
    )
    result = await db.execute(query)
    items = []
    for item, dist in result.all():
        items.append(ItemRead.model_validate(item).model_copy(update={"distance_miles": dist or 0.0}))
    return items


@router.post("", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
async def create_item(
    name: str = Form(...),
    category: str = Form("misc"),
    description: str | None = Form(None),
    max_days: int = Form(7),
    lat: float = Form(...),
    lng: float = Form(...),
    photo: UploadFile | None = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ItemRead:
    photo_url = await upload_item_photo(photo) if photo is not None else None
    item = Item(
        owner_id=current_user.id,
        name=name,
        category=category,
        description=description,
        photo_url=photo_url,
        max_days=max_days,
        location=point_wkt(lat, lng),
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    item.owner = current_user
    return ItemRead.model_validate(item)


@router.patch("/{item_id}", response_model=ItemRead)
async def update_item(
    item_id: UUID,
    payload: ItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ItemRead:
    result = await db.execute(
        select(Item).options(selectinload(Item.owner)).where(Item.id == item_id)
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    if item.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not item owner")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(item, field, value)

    await db.commit()
    await db.refresh(item)
    return ItemRead.model_validate(item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(select(Item).where(Item.id == item_id))
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    if item.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not item owner")

    await db.delete(item)
    await db.commit()
