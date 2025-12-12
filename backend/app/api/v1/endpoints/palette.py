from fastapi import APIRouter, HTTPException
from app.schemas.palette import PaletteRequest, PaletteResponse
from app.services.color_theory import ColorTheoryService

router = APIRouter()
service = ColorTheoryService()

@router.post("/generate-palette", response_model=PaletteResponse)
async def generate_palette(request: PaletteRequest):
    try:
        harmonies = service.generate_full_palette(request.base_color, request.count)
        return PaletteResponse(
            base_color=request.base_color,
            harmonies=harmonies
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
