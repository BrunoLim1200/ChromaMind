import colorsys
from typing import Tuple, Dict, Any, List


class ColorTheoryService:
    def _hex_to_rgb(self, hex_color: str) -> Tuple[int, int, int]:
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

    def _rgb_to_hex(self, rgb: Tuple[int, int, int]) -> str:
        return '#{:02x}{:02x}{:02x}'.format(*rgb)

    def _calculate_relative_luminance(self, rgb: Tuple[int, int, int]) -> float:
        linear_rgb = [
            c / 12.92 if (c := channel / 255.0) <= 0.03928 
            else ((c + 0.055) / 1.055) ** 2.4 
            for channel in rgb
        ]
        return 0.2126 * linear_rgb[0] + 0.7152 * linear_rgb[1] + 0.0722 * linear_rgb[2]

    def _calculate_contrast_ratio(self, l1: float, l2: float) -> float:
        lighter, darker = max(l1, l2), min(l1, l2)
        return (lighter + 0.05) / (darker + 0.05)

    def _create_swatch(self, hex_color: str) -> Dict[str, Any]:
        rgb = self._hex_to_rgb(hex_color)
        h, l, s = colorsys.rgb_to_hls(rgb[0]/255.0, rgb[1]/255.0, rgb[2]/255.0)
        
        lum = self._calculate_relative_luminance(rgb)
        contrast_white = self._calculate_contrast_ratio(lum, 1.0)
        contrast_black = self._calculate_contrast_ratio(lum, 0.0)

        return {
            "hex": hex_color,
            "rgb": list(rgb),
            "hsl": [h * 360, s * 100, l * 100],
            "contrast_white": round(contrast_white, 2),
            "contrast_black": round(contrast_black, 2),
            "wcag_aa_white": contrast_white >= 4.5,
            "wcag_aaa_white": contrast_white >= 7.0,
            "wcag_aa_black": contrast_black >= 4.5,
            "wcag_aaa_black": contrast_black >= 7.0
        }

    def _adjust_hue(self, h: float, degree: float) -> float:
        return (h + degree / 360.0) % 1.0

    def generate_full_palette(self, base_color_hex: str) -> Dict[str, List[Dict[str, Any]]]:
        r, g, b = self._hex_to_rgb(base_color_hex)
        h, l, s = colorsys.rgb_to_hls(r/255.0, g/255.0, b/255.0)
        
        harmonies = {
            "complementary": [0, 180],
            "analogous": [-30, 0, 30],
            "triadic": [0, 120, 240],
            "split_complementary": [0, 150, 210]
        }

        result = {
            name: [
                self._create_swatch(
                    self._rgb_to_hex(tuple(int(c * 255) for c in colorsys.hls_to_rgb(self._adjust_hue(h, shift), l, s)))
                ) for shift in shifts
            ]
            for name, shifts in harmonies.items()
        }

        result["monochromatic"] = [
            self._create_swatch(
                self._rgb_to_hex(tuple(int(c * 255) for c in colorsys.hls_to_rgb(h, 0.1 + (i * 0.2), s)))
            ) for i in range(5)
        ]

        return result
