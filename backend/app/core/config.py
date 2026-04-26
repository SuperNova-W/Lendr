import os
from functools import lru_cache

from dotenv import load_dotenv


load_dotenv()


def _csv_values(*values: str | None) -> list[str]:
    seen: set[str] = set()
    parsed: list[str] = []
    for value in values:
        for item in (value or "").split(","):
            item = item.strip().rstrip("/")
            if item and item not in seen:
                seen.add(item)
                parsed.append(item)
    return parsed


class Settings:
    def __init__(self) -> None:
        self.database_url = os.getenv("DATABASE_URL", "")
        self.supabase_url = os.getenv("SUPABASE_URL", "")
        self.supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY", "")
        self.google_client_id = os.getenv("GOOGLE_CLIENT_ID", "")
        self.google_client_ids = _csv_values(
            os.getenv("GOOGLE_CLIENT_IDS"),
            os.getenv("GOOGLE_CLIENT_ID"),
            os.getenv("GOOGLE_WEB_CLIENT_ID"),
            os.getenv("GOOGLE_IOS_CLIENT_ID"),
            os.getenv("GOOGLE_ANDROID_CLIENT_ID"),
            os.getenv("EXPO_PUBLIC_GOOGLE_CLIENT_ID"),
            os.getenv("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID"),
            os.getenv("EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID"),
            os.getenv("EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID"),
        )
        self.secret_key = os.getenv("SECRET_KEY", "")
        self.allowed_origins = _csv_values(
            os.getenv("ALLOWED_ORIGINS")
        ) or [
            "http://localhost:8081",
            "http://127.0.0.1:8081",
            "http://localhost:19006",
            "http://127.0.0.1:19006",
            "http://localhost:19000",
            "http://127.0.0.1:19000"
        ]
        self.jwt_algorithm = "HS256"
        self.access_token_expire_minutes = 60 * 24 * 7
        self.storage_bucket = "item-photos"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
