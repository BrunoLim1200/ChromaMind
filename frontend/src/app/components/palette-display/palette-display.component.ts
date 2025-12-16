import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { ColorService, BackendColorSwatch, PaletteResponse } from '../../services/color.service';
import { ExportTokenDialogComponent } from '../export-token-dialog/export-token-dialog.component';
import { Subject, Subscription, asyncScheduler } from 'rxjs';
import { debounceTime, switchMap, distinctUntilChanged, throttleTime } from 'rxjs/operators';

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
  styleUrls: ['./palette-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaletteDisplayComponent implements OnInit, OnDestroy {
  private colorService = inject(ColorService);
  private dialog = inject(Dialog);
  
  private colorUpdateSubject = new Subject<string>();
  private subscription: Subscription = new Subscription();

  baseColor = '#d1e6ad';
  selectedHarmony = 'Monocromático';
  colorCount = 5;
  
  harmonies = [
    'Monocromático', 
    'Análogo', 
    'Complementar', 
    'Triádico',
    'Split-Complementary'
  ];

  private harmonyMap: Record<string, string> = {
    'Monocromático': 'monochromatic',
    'Análogo': 'analogous',
    'Complementar': 'complementary',
    'Triádico': 'triadic',
    'Split-Complementary': 'split_complementary'
  };

  private fullPaletteData: Record<string, BackendColorSwatch[]> | null = null;
  currentPalette: ColorSwatch[] = [];
  previewColors: ColorSwatch[] = [];

  previewStats = [
    { label: 'Total Revenue', value: '$45,231.89', change: '+20.1%', positive: true },
    { label: 'Users', value: '2,845', icon: 'group' },
    { label: 'Sales', value: '$12.4k', icon: 'attach_money' }
  ];

  markerPosition = { x: 0, y: 0 };
  markers: Array<{ x: number, y: number, color: string, offset: number }> = [];
  draggedMarkerIndex = 0;
  isDragging = false;
  private wheelRect: DOMRect | null = null;

  private harmonyOffsets: Record<string, number[]> = {
    'Monocromático': [0],
    'Análogo': [0, -30, 30],
    'Complementar': [0, 180],
    'Triádico': [0, 120, 240],
    'Split-Complementary': [0, 150, 210]
  };

  ngOnInit() {
    this.updateMarkerFromHex(this.baseColor);
    this.generatePalette();

    // Setup live preview with throttle
    this.subscription.add(
      this.colorUpdateSubject.pipe(
        throttleTime(100, asyncScheduler, { leading: true, trailing: true }),
        distinctUntilChanged(),
        switchMap(hex => this.colorService.generatePalette(hex, this.harmonyMap[this.selectedHarmony], this.colorCount))
      ).subscribe({
        next: (response) => {
          this.fullPaletteData = response.harmonies;
          this.updateDisplayedPalette();
        },
        error: (err) => console.error('Error generating palette:', err)
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  onHexChange(newHex: string) {
    this.baseColor = newHex;
    this.updateMarkerFromHex(newHex);
    this.colorUpdateSubject.next(newHex);
  }

  updateMarkerFromHex(hex: string) {
    if (!/^#[0-9A-F]{6}$/i.test(hex)) return;

    const { h, s } = this.hexToHsl(hex);
    const radius = (s / 100) * 96;

    const offsets = this.harmonyOffsets[this.selectedHarmony] || [0];
    
    this.markers = offsets.map(offset => {
      const adjustedHue = (h + offset + 360) % 360;
      const angleRad = adjustedHue * (Math.PI / 180);
      return {
        x: radius * Math.cos(angleRad),
        y: radius * Math.sin(angleRad),
        color: this.hslToHex(adjustedHue, s, 50),
        offset: offset
      };
    });

    if (this.markers.length > 0) {
      this.markerPosition = { x: this.markers[0].x, y: this.markers[0].y };
    }
  }

  startDrag(event: MouseEvent, index: number = -1) {
    this.isDragging = true;
    this.draggedMarkerIndex = index === -1 ? 0 : index;
    
    // Find the wheel element (parent of markers or the element itself)
    const target = event.target as HTMLElement;
    const wheel = target.classList.contains('relative') && target.classList.contains('rounded-full') 
      ? target 
      : target.closest('.relative.rounded-full') as HTMLElement;

    if (wheel) {
      this.wheelRect = wheel.getBoundingClientRect();
      
      // If clicked on background, update immediately
      if (index === -1) {
        this.handleDrag(event);
      }
      
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('mouseup', this.onMouseUp);
    }
  }

  private onMouseMove = (event: MouseEvent) => {
    if (this.isDragging) this.handleDrag(event);
  };

  private onMouseUp = () => {
    this.isDragging = false;
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    // No need to call generatePalette() here as the subject handles it
  };

  handleDrag(event: MouseEvent) {
    if (!this.wheelRect) return;

    const centerX = this.wheelRect.left + this.wheelRect.width / 2;
    const centerY = this.wheelRect.top + this.wheelRect.height / 2;
    
    let x = event.clientX - centerX;
    let y = event.clientY - centerY;

    const radius = Math.sqrt(x * x + y * y);
    let angle = Math.atan2(y, x);
    const maxRadius = this.wheelRect.width / 2;

    // Calculate saturation based on distance from center
    const saturation = Math.min(radius / maxRadius, 1) * 100;

    if (angle < 0) angle += 2 * Math.PI;
    const hue = angle * (180 / Math.PI);
    
    // Calculate Base Hue based on the dragged marker's offset
    const offset = this.markers[this.draggedMarkerIndex]?.offset || 0;
    const baseHue = (hue - offset + 360) % 360;
    
    this.baseColor = this.hslToHex(baseHue, saturation, 50);
    this.updateMarkerFromHex(this.baseColor);
    
    // Trigger live update
    this.colorUpdateSubject.next(this.baseColor);
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
    this.colorService.generatePalette(this.baseColor, this.harmonyMap[this.selectedHarmony], this.colorCount).subscribe({
      next: (response) => {
        this.fullPaletteData = response.harmonies;
        this.updateDisplayedPalette();
      },
      error: () => {}
    });
  }

  onCountChange(count: number) {
    this.colorCount = count;
    this.generatePalette();
  }

  updateDisplayedPalette() {
    if (!this.fullPaletteData) return;

    const backendKey = this.harmonyMap[this.selectedHarmony];
    const backendColors = this.fullPaletteData[backendKey];

    if (backendColors) {
      this.currentPalette = backendColors.map(c => this.mapToFrontendSwatch(c));
      
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
    this.updateMarkerFromHex(this.baseColor);
    this.generatePalette();
  }

  private mapToFrontendSwatch(backendSwatch: BackendColorSwatch): ColorSwatch {
    const useWhite = backendSwatch.contrast_white >= backendSwatch.contrast_black;
    const contrastText = useWhite ? '#FFFFFF' : '#000000';
    
    let wcag: 'AAA' | 'AA' | 'Fail' = 'Fail';
    if (useWhite) {
      wcag = backendSwatch.wcag_aaa_white ? 'AAA' : backendSwatch.wcag_aa_white ? 'AA' : 'Fail';
    } else {
      wcag = backendSwatch.wcag_aaa_black ? 'AAA' : backendSwatch.wcag_aa_black ? 'AA' : 'Fail';
    }

    return { hex: backendSwatch.hex, wcag, contrastText };
  }

  copyToClipboard(color: string) {
    navigator.clipboard.writeText(color);
  }

  exportTokens() {
    this.dialog.open(ExportTokenDialogComponent, {
      minWidth: '300px',
      data: { palette: this.currentPalette, harmony: this.selectedHarmony },
      hasBackdrop: true,
      backdropClass: 'bg-black/50'
    });
  }
}
