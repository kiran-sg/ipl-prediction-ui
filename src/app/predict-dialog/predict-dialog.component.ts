import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { PredictFormComponent } from "../predict-form/predict-form.component";
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Match } from '../models/match.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-predict-dialog',
  imports: [
    CommonModule,
    MatDialogModule, 
    MatButtonModule,
    PredictFormComponent
  ],
  templateUrl: './predict-dialog.component.html',
  styleUrl: './predict-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PredictDialogComponent {
  matchDetails!: Match;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.matchDetails = data.match;
  }

  ngOnInit(): void {
  }
}
