import { ChangeDetectionStrategy, Component, Inject, ViewChild } from '@angular/core';
import { PredictFormComponent } from "../predict-form/predict-form.component";
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Match } from '../models/match.model';
import { CommonModule } from '@angular/common';
import { TeamName } from '../enums/team';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { PredictedMatch } from '../models/predicted-match.model';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonService } from '../common.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-predict-dialog',
  imports: [
    CommonModule,
    MatDialogModule, 
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    PredictFormComponent,
    ReactiveFormsModule
  ],
  templateUrl: './predict-dialog.component.html',
  styleUrl: './predict-dialog.component.scss',
  //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PredictDialogComponent {
  matchDetails!: Match;
  dialogWidth: string = '500px'; // Default width
  dialogHeight: string = 'auto'; // Default height

  @ViewChild(PredictFormComponent) predictFormComponent!: PredictFormComponent;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private breakpointObserver: BreakpointObserver,
    private dialogRef: MatDialogRef<PredictDialogComponent>,
    private service: CommonService,
    private router: Router, 
  ) {
    this.matchDetails = data.match;
    console.log(this.matchDetails);
  }

  ngOnInit(): void {
    this.breakpointObserver.observe([
      Breakpoints.Handset, // Small devices (phones)
      Breakpoints.Tablet, // Medium devices (tablets)
      Breakpoints.Web, // Large devices (desktops)
    ]).subscribe(result => {
      if (result.breakpoints[Breakpoints.Handset]) {
        // Small screens (phones)
        this.dialogWidth = '90vw';
        this.dialogHeight = '80vh';
      } else if (result.breakpoints[Breakpoints.Tablet]) {
        // Medium screens (tablets)
        this.dialogWidth = '70vw';
        this.dialogHeight = '60vh';
      } else {
        // Large screens (desktops)
        this.dialogWidth = '500px';
        this.dialogHeight = 'auto';
      }

      // Update the dialog size
      this.dialogRef.updateSize(this.dialogWidth, this.dialogHeight);
    });
  }

  onPredictClick(): void {
    // Trigger the child component's onSubmit() method
    this.predictFormComponent.onSubmit();
  }

  onFormSubmitted(predictedMatch: PredictedMatch): void {
    if (predictedMatch == undefined) {
      this.dialogRef.close();
    }
    this.service.predictMatch(predictedMatch).subscribe((data) => {
      if (data.invalidUser) {
        alert(data.message);
        this.dialogRef.close(predictedMatch);
        this.router.navigate(['/login']);
        return;
      }
      if (data.status) {
        alert('Prediction submitted');
          this.dialogRef.close(predictedMatch);
      } else {
        alert('Prediction failed');
      }
    });
  }

}
