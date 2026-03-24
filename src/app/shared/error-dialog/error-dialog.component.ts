import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="error-dialog">
      <mat-icon class="error-icon">error_outline</mat-icon>
      <h3>{{ data.title || 'Oops!' }}</h3>
      <p>{{ data.message }}</p>
      <button mat-flat-button color="warn" (click)="dialogRef.close()">OK</button>
    </div>
  `,
  styles: [`
    .error-dialog {
      text-align: center;
      padding: 24px;
    }
    .error-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #e53935;
    }
    h3 {
      margin: 12px 0 8px;
      font-size: 1.3rem;
      font-weight: 700;
    }
    p {
      color: #555;
      font-size: 1rem;
      margin: 0 0 20px;
    }
  `]
})
export class ErrorDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title?: string; message: string },
  ) {}
}
