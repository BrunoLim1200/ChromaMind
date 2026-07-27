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

# Production is same-origin (SPA + API share the CloudFront domain), so CORS is
# effectively unused. This stays settings-driven only as a fallback for a
# split-domain/local setup; it defaults to localhost for dev.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,  # no cookies/auth anywhere
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
