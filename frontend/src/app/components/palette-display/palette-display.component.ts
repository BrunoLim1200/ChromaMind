import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { ColorService, BackendColorSwatch, PaletteResponse } from '../../services/color.service';
import { ExportTokenDialogComponent } from '../export-token-dialog/export-token-dialog.component';

interface ColorSwatch {
  hex: string;
  wcag: 'AAA' | 'AA' | 'Fail';
  contrastText: string;
}

@Component({
  selector: 'app-palette-display',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './palette-display.component.html',
  styleUrls: ['./palette-display.component.scss']
})
export class PaletteDisplayComponent implements OnInit {
  private colorService = inject(ColorService);
  private dialog = inject(Dialog);

  baseColor: string = '#d1e6ad';
  selectedHarmony: string = 'Monocromático';
  
  harmonies = [
    'Monocromático', 
    'Análogo', 
    'Complementar', 
    'Triádico',
    'Split-Complementary'
  ];

  // Map frontend labels to backend keys
  private harmonyMap: { [key: string]: string } = {
    'Monocromático': 'monochromatic',
    'Análogo': 'analogous',
    'Complementar': 'complementary',
    'Triádico': 'triadic',
    'Split-Complementary': 'split_complementary'
  };

  // Store full API response
  private fullPaletteData: { [key: string]: BackendColorSwatch[] } | null = null;

  currentPalette: ColorSwatch[] = [];
  previewColors: ColorSwatch[] = [];

  // Preview Mock Data (Dynamic based on palette)
  previewStats = [
    { label: 'Total Revenue', value: '$45,231.89', change: '+20.1%', positive: true },
    { label: 'Users', value: '2,845', icon: 'group' },
    { label: 'Sales', value: '$12.4k', icon: 'attach_money' }
  ];

  // Marker state
  markerPosition = { x: 0, y: 0 };
  isDragging = false;
  private wheelRect: DOMRect | null = null;

  ngOnInit() {
    this.updateMarkerFromHex(this.baseColor);
    this.generatePalette();
  }

  // Called when user types in input
  onHexChange(newHex: string) {
    this.baseColor = newHex;
    this.updateMarkerFromHex(newHex);
    // Debounce could be added here
  }

  updateMarkerFromHex(hex: string) {
    if (!/^#[0-9A-F]{6}$/i.test(hex)) return;

    const { h, s } = this.hexToHsl(hex);
    
    // Convert H/S to x/y
    // h is 0-360, s is 0-100
    const angleRad = h * (Math.PI / 180);
    const radius = (s / 100) * 96; // 96 is max radius (half of 192px)

    this.markerPosition = {
      x: radius * Math.cos(angleRad),
      y: radius * Math.sin(angleRad)
    };
  }

  startDrag(event: MouseEvent) {
    this.isDragging = true;
    const wheel = (event.target as HTMLElement).closest('.relative') as HTMLElement;
    this.wheelRect = wheel.getBoundingClientRect();
    this.handleDrag(event);
    
    // Add global listeners
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
  }

  private onMouseMove = (event: MouseEvent) => {
    if (this.isDragging) {
      this.handleDrag(event);
    }
  };

  private onMouseUp = () => {
    this.isDragging = false;
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.generatePalette(); // Generate on release
  };

  handleDrag(event: MouseEvent) {
    if (!this.wheelRect) return;

    const centerX = this.wheelRect.left + this.wheelRect.width / 2;
    const centerY = this.wheelRect.top + this.wheelRect.height / 2;
    
    let x = event.clientX - centerX;
    let y = event.clientY - centerY;

    // Calculate radius and angle
    const radius = Math.sqrt(x * x + y * y);
    let angle = Math.atan2(y, x);

    // Clamp radius to max (96px)
    const maxRadius = this.wheelRect.width / 2;
    if (radius > maxRadius) {
      x = Math.cos(angle) * maxRadius;
      y = Math.sin(angle) * maxRadius;
    }

    this.markerPosition = { x, y };

    // Convert back to color
    if (angle < 0) angle += 2 * Math.PI;
    const hue = angle * (180 / Math.PI);
    const saturation = Math.min(radius / maxRadius, 1) * 100;
    
    this.baseColor = this.hslToHex(hue, saturation, 50);
  }

  private hexToHsl(hex: string): { h: number, s: number, l: number } {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }

    return { h, s: s * 100, l: l * 100 };
  }

  private hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  generatePalette() {
    this.colorService.generatePalette(this.baseColor).subscribe({
      next: (response) => {
        this.fullPaletteData = response.harmonies;
        this.updateDisplayedPalette();
      },
      error: (err) => console.error('Error generating palette:', err)
    });
  }

  updateDisplayedPalette() {
    if (!this.fullPaletteData) return;

    const backendKey = this.harmonyMap[this.selectedHarmony];
    const backendColors = this.fullPaletteData[backendKey];

    if (backendColors) {
      this.currentPalette = backendColors.map(c => this.mapToFrontendSwatch(c));
      
      // Ensure we have at least 5 colors for the preview by repeating if necessary
      this.previewColors = [...this.currentPalette];
      if (this.previewColors.length > 0) {
          while (this.previewColors.length < 5) {
            this.previewColors.push(this.previewColors[this.previewColors.length % this.currentPalette.length]);
          }
      }
    }
  }

  onHarmonyChange(harmony: string) {
    this.selectedHarmony = harmony;
    this.updateDisplayedPalette();
  }

  private mapToFrontendSwatch(backendSwatch: BackendColorSwatch): ColorSwatch {
    // Determine best contrast text color
    const useWhite = backendSwatch.contrast_white >= backendSwatch.contrast_black;
    const contrastText = useWhite ? '#FFFFFF' : '#000000';
    
    // Determine WCAG rating for the chosen text color
    let wcag: 'AAA' | 'AA' | 'Fail' = 'Fail';
    if (useWhite) {
      if (backendSwatch.wcag_aaa_white) wcag = 'AAA';
      else if (backendSwatch.wcag_aa_white) wcag = 'AA';
    } else {
      if (backendSwatch.wcag_aaa_black) wcag = 'AAA';
      else if (backendSwatch.wcag_aa_black) wcag = 'AA';
    }

    return {
      hex: backendSwatch.hex,
      wcag,
      contrastText
    };
  }

  copyToClipboard(color: string) {
    navigator.clipboard.writeText(color).then(() => {
      console.log('Copied: ' + color);
    });
  }

  exportTokens() {
    this.dialog.open(ExportTokenDialogComponent, {
      minWidth: '300px',
      data: {
        palette: this.currentPalette,
        harmony: this.selectedHarmony
      },
      // Add a backdrop class if needed, or rely on default CDK overlay styles
      // CDK Dialog by default puts content in a container. 
      // We might need to ensure the overlay has a backdrop.
      hasBackdrop: true,
      backdropClass: 'bg-black/50'
    });
  }
}
