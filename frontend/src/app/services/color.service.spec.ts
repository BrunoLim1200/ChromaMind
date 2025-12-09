import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ColorService } from './color.service';

describe('ColorService', () => {
  let service: ColorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ColorService]
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

  it('should generate palette', () => {
    const mockResponse = {
      base_color: '#FF0000',
      harmony_type: 'complementary',
      palette: ['#FF0000', '#00FFFF']
    };

    service.generatePalette('#FF0000', 'complementary').subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/v1/palette/generate');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ base_color: '#FF0000', harmony_type: 'complementary' });
    req.flush(mockResponse);
  });
});
