from fastapi import APIRouter
from app.api.v1.endpoints import palette

router = APIRouter()

router.include_router(palette.router, prefix="/palette", tags=["palette"])