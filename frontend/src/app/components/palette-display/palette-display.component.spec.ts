import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PaletteDisplayComponent } from './palette-display.component';
import { ColorService } from '../../services/color.service';
import { of } from 'rxjs';

describe('PaletteDisplayComponent', () => {
  let component: PaletteDisplayComponent;
  let fixture: ComponentFixture<PaletteDisplayComponent>;
  let colorServiceSpy: jasmine.SpyObj<ColorService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ColorService', ['generatePalette']);
    spy.generatePalette.and.returnValue(of({ base_color: '#ffffff', harmonies: {} } as any));

    await TestBed.configureTestingModule({
      imports: [PaletteDisplayComponent],
      providers: [
        provideHttpClient(), 
        provideHttpClientTesting(),
        { provide: ColorService, useValue: spy }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(PaletteDisplayComponent);
    component = fixture.componentInstance;
    colorServiceSpy = TestBed.inject(ColorService) as jasmine.SpyObj<ColorService>;
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

  it('should update baseColor on drag but NOT call API', () => {
    // Mock wheelRect to allow handleDrag to proceed
    (component as any).wheelRect = { left: 0, top: 0, width: 200, height: 200 };
    
    // Simulate drag event
    const event = new MouseEvent('mousemove', { clientX: 150, clientY: 100 });
    component.handleDrag(event);

    // baseColor should change from default
    expect(component.baseColor).not.toBe('#d1e6ad'); 
    
    // generatePalette is called once in ngOnInit. 
    // handleDrag should NOT trigger another call (throttled subject was removed/bypassed for drag)
    expect(colorServiceSpy.generatePalette).toHaveBeenCalledTimes(1); 
  });

  it('should call API on mouse up after drag', () => {
    // Setup drag state
    const event = new MouseEvent('mousedown');
    Object.defineProperty(event, 'target', { value: document.createElement('div') });
    
    // Mock getBoundingClientRect for the target or wheel finding logic if needed, 
    // but startDrag mainly sets up listeners.
    // We can manually invoke the private onMouseUp if we want to be sure, 
    // or dispatch window event.
    
    component.startDrag(event, -1);
    
    // Dispatch mouseup on window to trigger the listener added in startDrag
    window.dispatchEvent(new MouseEvent('mouseup'));
    
    // Should have called generatePalette again (1 from init + 1 from mouseup)
    expect(colorServiceSpy.generatePalette).toHaveBeenCalledTimes(2);
  });
});
