from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class ColorSwatch(BaseModel):
    hex: str = Field(..., pattern=r"^#[0-9a-fA-F]{6}$")
    rgb: List[int]
    hsl: List[float]
    contrast_white: float
    contrast_black: float
    wcag_aa_white: bool
    wcag_aaa_white: bool
    wcag_aa_black: bool
    wcag_aaa_black: bool

class HarmonyPalette(BaseModel):
    colors: List[ColorSwatch]

class PaletteRequest(BaseModel):
    base_color: str = Field(..., pattern=r"^#[0-9a-fA-F]{6}$", description="Hex color code (e.g. #FF5733)")

class PaletteResponse(BaseModel):
    base_color: str
    harmonies: Dict[str, List[ColorSwatch]]
