import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { PredictFormComponent } from "../predict-form/predict-form.component";
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Match } from '../models/match.model';
import { CommonModule } from '@angular/common';
import { TeamName } from '../enums/team';

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
    this.matchDetails.homeShortName = Object.keys(TeamName).find(
      key => TeamName[key as keyof typeof TeamName] === this.matchDetails?.home
    ) as keyof typeof TeamName,
    this.matchDetails.awayShortName = Object.keys(TeamName).find(
      key => TeamName[key as keyof typeof TeamName] === this.matchDetails?.away
    ) as keyof typeof TeamName,
    console.log(this.matchDetails);
  }

  ngOnInit(): void {
  }
}
