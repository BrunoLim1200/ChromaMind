import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

export interface ExportDialogData {
  palette: { hex: string }[];
  harmony: string;
}

@Component({
  selector: 'app-export-token-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './export-token-dialog.component.html',
})
export class ExportTokenDialogComponent {
  dialogRef = inject<DialogRef<string>>(DialogRef);
  data = inject<ExportDialogData>(DIALOG_DATA);

  activeTab: 'css' | 'json' = 'css';

  get cssTokens(): string {
    if (!this.data.palette.length) return '';
    
    const lines = [':root {', `  /* ${this.data.harmony} Color Palette */`];
    this.data.palette.forEach((color, index) => {
      lines.push(`  --color-primary-${(index + 1) * 100}: ${color.hex};`);
    });
    lines.push('}');
    return lines.join('\n');
  }

  get jsonTokens(): string {
    if (!this.data.palette.length) return '{}';
    
    const tokens = {
      palette: {
        name: this.data.harmony,
        colors: Object.fromEntries(
          this.data.palette.map((color, index) => [`${(index + 1) * 100}`, color.hex])
        )
      }
    };

    return JSON.stringify(tokens, null, 2);
  }

  copyTokens() {
    const content = this.activeTab === 'css' ? this.cssTokens : this.jsonTokens;
    navigator.clipboard.writeText(content);
  }

  close() {
    this.dialogRef.close();
  }
}
