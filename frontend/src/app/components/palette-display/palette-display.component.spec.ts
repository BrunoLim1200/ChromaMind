import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaletteDisplayComponent } from './palette-display.component';

describe('PaletteDisplayComponent', () => {
  let component: PaletteDisplayComponent;
  let fixture: ComponentFixture<PaletteDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaletteDisplayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaletteDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display colors', () => {
    component.colors = ['#FF0000', '#00FF00'];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const colorElements = compiled.querySelectorAll('.group');
    expect(colorElements.length).toBe(2);
  });
});
