import colorsys
import math
from typing import List, Tuple, Dict, Any

class ColorTheoryService:
    def _hex_to_rgb(self, hex_color: str) -> Tuple[int, int, int]:
        """Converts HEX to RGB (0-255)."""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

    def _rgb_to_hex(self, rgb: Tuple[int, int, int]) -> str:
        """Converts RGB (0-255) to HEX."""
        return '#{:02x}{:02x}{:02x}'.format(*rgb)

    def _calculate_relative_luminance(self, rgb: Tuple[int, int, int]) -> float:
        """
        Calculates Relative Luminance (L) using the WCAG 2.0 formula.
        L = 0.2126 * R + 0.7152 * G + 0.0722 * B
        where R, G, B are normalized and gamma-corrected.
        """
        normalized_rgb = [c / 255.0 for c in rgb]
        linear_rgb = []
        for c in normalized_rgb:
            if c <= 0.03928:
                linear_rgb.append(c / 12.92)
            else:
                linear_rgb.append(((c + 0.055) / 1.055) ** 2.4)
        
        return 0.2126 * linear_rgb[0] + 0.7152 * linear_rgb[1] + 0.0722 * linear_rgb[2]

    def _calculate_contrast_ratio(self, l1: float, l2: float) -> float:
        """
        Calculates Contrast Ratio between two luminances.
        Formula: (L1 + 0.05) / (L2 + 0.05)
        where L1 is the lighter color and L2 is the darker color.
        """
        lighter = max(l1, l2)
        darker = min(l1, l2)
        return (lighter + 0.05) / (darker + 0.05)

    def _create_swatch(self, hex_color: str) -> Dict[str, Any]:
        """Creates a full color swatch with accessibility data."""
        rgb = self._hex_to_rgb(hex_color)
        # HSL in colorsys uses 0-1 range. We might want to return it as is or scaled.
        # Let's keep it 0-1 for consistency with colorsys, or scale to 360, 100, 100 for UI.
        # For now, let's stick to 0-1 float as per colorsys standard, or maybe user wants standard CSS HSL.
        # The prompt didn't specify HSL format, but usually CSS is H(0-360) S(%) L(%).
        # Let's return raw values for now.
        h, l, s = colorsys.rgb_to_hls(rgb[0]/255.0, rgb[1]/255.0, rgb[2]/255.0)
        
        lum = self._calculate_relative_luminance(rgb)
        lum_white = 1.0 # White #FFFFFF
        lum_black = 0.0 # Black #000000

        contrast_white = self._calculate_contrast_ratio(lum, lum_white)
        contrast_black = self._calculate_contrast_ratio(lum, lum_black)

        return {
            "hex": hex_color,
            "rgb": list(rgb),
            "hsl": [h * 360, s * 100, l * 100], # Converted to degrees and percentage
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
        """Generates all harmonies for a base color."""
        r, g, b = self._hex_to_rgb(base_color_hex)
        h, l, s = colorsys.rgb_to_hls(r/255.0, g/255.0, b/255.0)
        
        harmonies = {
            "complementary": [0, 180],
            "analogous": [-30, 0, 30],
            "triadic": [0, 120, 240],
            "split_complementary": [0, 150, 210],
            "monochromatic": [0] # Special handling needed for monochromatic
        }

        result = {}

        # Generate Hue-based harmonies
        for name, shifts in harmonies.items():
            if name == "monochromatic":
                continue
            
            palette = []
            for shift in shifts:
                new_h = self._adjust_hue(h, shift)
                new_r, new_g, new_b = colorsys.hls_to_rgb(new_h, l, s)
                new_hex = self._rgb_to_hex((int(new_r*255), int(new_g*255), int(new_b*255)))
                palette.append(self._create_swatch(new_hex))
            result[name] = palette

        # Generate Monochromatic (vary lightness)
        mono_palette = []
        # Generate 5 steps of lightness
        for i in range(5):
            # Distribute lightness from 0.1 to 0.9
            new_l = 0.1 + (i * 0.2)
            new_r, new_g, new_b = colorsys.hls_to_rgb(h, new_l, s)
            new_hex = self._rgb_to_hex((int(new_r*255), int(new_g*255), int(new_b*255)))
            mono_palette.append(self._create_swatch(new_hex))
        result["monochromatic"] = mono_palette

        return result
