from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.models import Item, Request, User
from app.schemas.schemas import RequestCreate, RequestRead, RequestUpdate


router = APIRouter(prefix="/requests", tags=["requests"])


@router.post("", response_model=RequestRead, status_code=status.HTTP_201_CREATED)
async def create_request(
    payload: RequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RequestRead:
    if payload.end_date < payload.start_date:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date range")

    item_result = await db.execute(select(Item).where(Item.id == payload.item_id))
    item = item_result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    if item.owner_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot request your own item")
    if not item.available:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Item unavailable")
    if (payload.end_date - payload.start_date).days + 1 > item.max_days:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request exceeds max days")

    borrow_request = Request(
        item_id=item.id,
        borrower_id=current_user.id,
        owner_id=item.owner_id,
        start_date=payload.start_date,
        end_date=payload.end_date,
    )
    db.add(borrow_request)
    await db.commit()
    await db.refresh(borrow_request)
    return RequestRead.model_validate(borrow_request)


@router.patch("/{request_id}", response_model=RequestRead)
async def update_request(
    request_id: UUID,
    payload: RequestUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RequestRead:
    result = await db.execute(select(Request).where(Request.id == request_id))
    borrow_request = result.scalar_one_or_none()
    if borrow_request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    item_result = await db.execute(select(Item).where(Item.id == borrow_request.item_id))
    item = item_result.scalar_one()

    status_value = payload.status
    if status_value in {"approved", "declined"}:
        if borrow_request.owner_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owner can update request")
        if borrow_request.status != "pending":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request already handled")
    elif status_value == "returned":
        if borrow_request.borrower_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only borrower can mark returned")
        if borrow_request.status != "approved":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request must be approved first")

    borrow_request.status = status_value
    if status_value == "approved":
        item.available = False
    elif status_value == "returned":
        item.available = True
    await db.commit()
    await db.refresh(borrow_request)
    return RequestRead.model_validate(borrow_request)


@router.get("/mine", response_model=list[RequestRead])
async def get_my_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[RequestRead]:
    result = await db.execute(
        select(Request)
        .where(Request.borrower_id == current_user.id)
        .order_by(Request.created_at.desc())
    )
    return [RequestRead.model_validate(row) for row in result.scalars().all()]


@router.get("/incoming", response_model=list[RequestRead])
async def get_incoming_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[RequestRead]:
    result = await db.execute(
        select(Request)
        .where(Request.owner_id == current_user.id)
        .order_by(Request.created_at.desc())
    )
    return [RequestRead.model_validate(row) for row in result.scalars().all()]
