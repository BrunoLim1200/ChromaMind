import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from app.api.v1 import router as api_router
from app.core.config import settings

logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format='{"level":"%(levelname)s","logger":"%(name)s","message":"%(message)s"}',
)

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    # Transitional: the current GitHub Pages frontend is served from *.github.io.
    allow_origin_regex=r"https://.*\.github\.io",
    allow_credentials=False,  # no cookies/auth — safe to keep origins broad
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Welcome to ChromaMind API!"}


@app.get("/health")
async def health():
    return {"status": "ok"}


# AWS Lambda entrypoint. Inert when running locally under uvicorn.
handler = Mangum(app)
