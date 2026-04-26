from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import create_access_token, verify_google_token
from app.core.database import get_db
from app.models.models import User
from app.schemas.schemas import AuthResponse, GoogleAuthRequest, UserRead


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/google", response_model=AuthResponse)
async def google_auth(payload: GoogleAuthRequest, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    google_payload = verify_google_token(payload.id_token)
    google_id = google_payload["sub"]

    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            google_id=google_id,
            name=google_payload.get("name", "Lendr User"),
            photo_url=google_payload.get("picture"),
        )
        db.add(user)
    else:
        user.name = google_payload.get("name", user.name)
        user.photo_url = google_payload.get("picture", user.photo_url)

    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id)
    return AuthResponse(access_token=token, user=UserRead.model_validate(user))
