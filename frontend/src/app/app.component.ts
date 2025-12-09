import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PaletteDisplayComponent } from './components/palette-display/palette-display.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PaletteDisplayComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {}