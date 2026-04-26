import os
from functools import lru_cache

from dotenv import load_dotenv


load_dotenv()


class Settings:
    def __init__(self) -> None:
        self.database_url = os.getenv("DATABASE_URL", "")
        self.supabase_url = os.getenv("SUPABASE_URL", "")
        self.supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY", "")
        self.google_client_id = os.getenv("GOOGLE_CLIENT_ID", "")
        self.secret_key = os.getenv("SECRET_KEY", "")
        self.allowed_origins = [
            origin.strip()
            for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
            if origin.strip()
        ]
        self.jwt_algorithm = "HS256"
        self.access_token_expire_minutes = 60 * 24 * 7
        self.storage_bucket = "item-photos"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
