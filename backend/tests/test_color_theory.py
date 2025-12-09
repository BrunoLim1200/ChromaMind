import pytest
from app.services.color_theory import ColorTheoryService

def test_hex_to_rgb():
    service = ColorTheoryService()
    assert service._hex_to_rgb("#FFFFFF") == (1.0, 1.0, 1.0)
    assert service._hex_to_rgb("#000000") == (0.0, 0.0, 0.0)
    assert service._hex_to_rgb("#FF0000") == (1.0, 0.0, 0.0)

def test_generate_palette_complementary():
    service = ColorTheoryService()
    base_color = "#FF0000" # Red
    palette = service.generate_palette(base_color, "complementary")
    assert len(palette) == 2
    assert palette[0] == "#ff0000"
    assert palette[1] == "#00ffff" # Cyan

def test_generate_palette_analogous():
    service = ColorTheoryService()
    base_color = "#FF0000"
    palette = service.generate_palette(base_color, "analogous")
    assert len(palette) == 3
