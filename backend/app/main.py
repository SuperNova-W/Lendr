from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, items, requests, users


app = FastAPI(title="Lendr API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(items.router)
app.include_router(requests.router)
app.include_router(users.router)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
