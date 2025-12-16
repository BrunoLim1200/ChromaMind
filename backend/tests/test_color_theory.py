import pytest
from app.services.color_theory import ColorTheoryService


def test_hex_to_rgb():
    service = ColorTheoryService()
    assert service._hex_to_rgb("#FFFFFF") == (255, 255, 255)
    assert service._hex_to_rgb("#000000") == (0, 0, 0)
    assert service._hex_to_rgb("#FF0000") == (255, 0, 0)


def test_rgb_to_hex():
    service = ColorTheoryService()
    assert service._rgb_to_hex((255, 255, 255)) == "#ffffff"
    assert service._rgb_to_hex((0, 0, 0)) == "#000000"
    assert service._rgb_to_hex((255, 0, 0)) == "#ff0000"


def test_calculate_relative_luminance():
    service = ColorTheoryService()
    assert service._calculate_relative_luminance((255, 255, 255)) == 1.0
    assert service._calculate_relative_luminance((0, 0, 0)) == 0.0


def test_calculate_contrast_ratio():
    service = ColorTheoryService()
    assert service._calculate_contrast_ratio(1.0, 0.0) == 21.0
    assert service._calculate_contrast_ratio(0.5, 0.5) == 1.0


def test_generate_harmony_complementary():
    service = ColorTheoryService()
    palette = service.generate_harmony("#FF0000", "complementary")
    assert "complementary" in palette
    assert len(palette["complementary"]) == 5


def test_generate_harmony_analogous():
    service = ColorTheoryService()
    palette = service.generate_harmony("#FF0000", "analogous")
    assert "analogous" in palette
    assert len(palette["analogous"]) == 5


def test_generate_harmony_triadic():
    service = ColorTheoryService()
    palette = service.generate_harmony("#FF0000", "triadic")
    assert "triadic" in palette
    assert len(palette["triadic"]) == 5


def test_generate_harmony_monochromatic():
    service = ColorTheoryService()
    palette = service.generate_harmony("#FF0000", "monochromatic")
    assert "monochromatic" in palette
    assert len(palette["monochromatic"]) == 5


def test_create_swatch_structure():
    service = ColorTheoryService()
    swatch = service._create_swatch("#FF0000")
    assert "hex" in swatch
    assert "rgb" in swatch
    assert "hsl" in swatch
    assert "contrast_white" in swatch
    assert "contrast_black" in swatch
    assert "wcag_aa_white" in swatch
    assert "wcag_aaa_white" in swatch
    assert "wcag_aa_black" in swatch
    assert "wcag_aaa_black" in swatch
