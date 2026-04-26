from pathlib import Path
from uuid import uuid4

import httpx
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings


async def upload_item_photo(photo: UploadFile) -> str:
    extension = Path(photo.filename or "").suffix or ".jpg"
    filename = f"{uuid4()}{extension}"
    upload_url = (
        f"{settings.supabase_url}/storage/v1/object/"
        f"{settings.storage_bucket}/{filename}"
    )
    content = await photo.read()
    headers = {
        "Authorization": f"Bearer {settings.supabase_service_key}",
        "apikey": settings.supabase_service_key,
        "Content-Type": photo.content_type or "application/octet-stream",
        "x-upsert": "false",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(upload_url, content=content, headers=headers)

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to upload photo",
        )

    return (
        f"{settings.supabase_url}/storage/v1/object/public/"
        f"{settings.storage_bucket}/{filename}"
    )
