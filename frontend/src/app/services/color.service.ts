import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BackendColorSwatch {
  hex: string;
  rgb: number[];
  hsl: number[];
  contrast_white: number;
  contrast_black: number;
  wcag_aa_white: boolean;
  wcag_aaa_white: boolean;
  wcag_aa_black: boolean;
  wcag_aaa_black: boolean;
}

export interface PaletteResponse {
  base_color: string;
  harmonies: Record<string, BackendColorSwatch[]>;
}

@Injectable({ providedIn: 'root' })
export class ColorService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  generatePalette(baseColor: string): Observable<PaletteResponse> {
    return this.http.post<PaletteResponse>(
      `${this.apiUrl}/palette/generate-palette`,
      { base_color: baseColor }
    );
  }
}
