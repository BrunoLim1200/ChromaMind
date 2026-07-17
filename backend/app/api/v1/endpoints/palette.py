from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, Response

from app.core.config import settings
from app.schemas.palette import PaletteQuery, PaletteResponse
from app.services.color_theory import ColorTheoryService

router = APIRouter()
service = ColorTheoryService()


@router.get("/generate-palette", response_model=PaletteResponse)
def generate_palette(query: Annotated[PaletteQuery, Query()], response: Response):
    try:
        harmonies = service.generate_harmony(
            query.base_color, query.harmony_type, query.count
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Deterministic output → safe to cache at the browser/CDN edge.
    response.headers["Cache-Control"] = f"public, max-age={settings.palette_cache_max_age}"
    return PaletteResponse(base_color=query.base_color, harmonies=harmonies)
