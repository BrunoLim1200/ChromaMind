import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PaletteDisplayComponent } from './palette-display.component';

describe('PaletteDisplayComponent', () => {
  let component: PaletteDisplayComponent;
  let fixture: ComponentFixture<PaletteDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaletteDisplayComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
    
    fixture = TestBed.createComponent(PaletteDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default base color', () => {
    expect(component.baseColor).toBe('#d1e6ad');
  });

  it('should have all harmony types', () => {
    expect(component.harmonies).toContain('Monocromático');
    expect(component.harmonies).toContain('Análogo');
    expect(component.harmonies).toContain('Complementar');
    expect(component.harmonies).toContain('Triádico');
    expect(component.harmonies).toContain('Split-Complementary');
  });

  it('should update marker from hex color', () => {
    component.updateMarkerFromHex('#FF0000');
    expect(component.markerPosition).toBeTruthy();
  });

  it('should copy color to clipboard', async () => {
    const clipboardSpy = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
    component.copyToClipboard('#FF0000');
    expect(clipboardSpy).toHaveBeenCalledWith('#FF0000');
  });
});
