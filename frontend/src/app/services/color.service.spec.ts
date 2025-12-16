import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ColorService, PaletteResponse } from './color.service';

describe('ColorService', () => {
  let service: ColorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ColorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate palette with requested harmony', () => {
    const mockResponse: PaletteResponse = {
      base_color: '#FF0000',
      harmonies: {
        complementary: [
          { hex: '#ff0000', rgb: [255, 0, 0], hsl: [0, 100, 50], contrast_white: 4.0, contrast_black: 5.25, wcag_aa_white: false, wcag_aaa_white: false, wcag_aa_black: true, wcag_aaa_black: false },
          { hex: '#00ffff', rgb: [0, 255, 255], hsl: [180, 100, 50], contrast_white: 1.25, contrast_black: 16.75, wcag_aa_white: false, wcag_aaa_white: false, wcag_aa_black: true, wcag_aaa_black: true }
        ]
      }
    };

    service.generatePalette('#FF0000', 'complementary').subscribe(response => {
      expect(response.base_color).toBe('#FF0000');
      expect(response.harmonies).toBeTruthy();
      expect(response.harmonies.complementary).toBeTruthy();
    });

    const req = httpMock.expectOne('http://localhost:8000/api/v1/palette/generate-palette');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ base_color: '#FF0000', harmony_type: 'complementary', count: 5 });
    req.flush(mockResponse);
  });

  it('should handle HTTP errors', () => {
    service.generatePalette('#FF0000', 'monochromatic').subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(400);
      }
    });

    const req = httpMock.expectOne('http://localhost:8000/api/v1/palette/generate-palette');
    req.flush('Invalid color', { status: 400, statusText: 'Bad Request' });
  });
});
