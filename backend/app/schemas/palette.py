from pydantic import BaseModel, Field
from typing import List, Dict, Literal


class ColorSwatch(BaseModel):
    hex: str
    rgb: List[int]
    hsl: List[float]
    contrast_white: float
    contrast_black: float
    wcag_aa_white: bool
    wcag_aaa_white: bool
    wcag_aa_black: bool
    wcag_aaa_black: bool


class PaletteRequest(BaseModel):
    base_color: str = Field(..., pattern=r"^#[0-9a-fA-F]{6}$")
    count: int = Field(5, ge=5, le=15, description="Number of colors to generate (5-15)")
    harmony_type: Literal["monochromatic", "analogous", "complementary", "triadic", "split_complementary"] = Field(
        "monochromatic", 
        description="Type of harmony to generate"
    )


class PaletteResponse(BaseModel):
    base_color: str
    harmonies: Dict[str, List[ColorSwatch]]
