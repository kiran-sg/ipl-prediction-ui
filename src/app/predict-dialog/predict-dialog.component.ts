import { Component, inject, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PredictFormComponent } from "../predict-form/predict-form.component";
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Match } from '../models/match.model';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { PredictedMatch } from '../models/predicted-match.model';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonService } from '../common.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';
import { ErrorDialogComponent } from '../shared/error-dialog/error-dialog.component';
import { TeamService } from '../team.service';

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
export class PredictDialogComponent implements OnInit, OnDestroy {
  matchDetails!: Match;
  homeShort = '';
  awayShort = '';
  dialogWidth: string = '500px'; // Default width
  dialogHeight: string = 'auto'; // Default height
  sessionTimer = '';
  private timerInterval: any;


  private _snackBar = inject(MatSnackBar);
  private errorDialog = inject(MatDialog);

  @ViewChild(PredictFormComponent) predictFormComponent!: PredictFormComponent;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private breakpointObserver: BreakpointObserver,
    private dialogRef: MatDialogRef<PredictDialogComponent>,
    private service: CommonService,
    private router: Router,
    private authService: AuthService,
    private teamService: TeamService,
  ) {
    this.matchDetails = data.match;
    this.homeShort = this.teamService.getShortName(this.matchDetails.home);
    this.awayShort = this.teamService.getShortName(this.matchDetails.away);
    console.log(this.matchDetails);
  }

  ngOnInit(): void {
    this.sessionTimer = this.authService.getSessionRemainingText();
    this.timerInterval = setInterval(() => {
      this.sessionTimer = this.authService.getSessionRemainingText();
    }, 1000);
    this.breakpointObserver.observe([
      Breakpoints.Handset, // Small devices (phones)
      Breakpoints.Tablet, // Medium devices (tablets)
      Breakpoints.Web, // Large devices (desktops)
    ]).subscribe(result => {
      if (result.breakpoints[Breakpoints.Handset]) {
        this.dialogWidth = '95vw';
        this.dialogHeight = '90vh';
      } else if (result.breakpoints[Breakpoints.Tablet]) {
        this.dialogWidth = '85vw';
        this.dialogHeight = '85vh';
      } else {
        this.dialogWidth = '80vw';
        this.dialogHeight = '85vh';
      }

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
    this.service.predictMatch(predictedMatch).subscribe({
      next: (data) => {
        if (data.invalidUser) {
          this.dialogRef.close(predictedMatch);
          this._snackBar.open(data.message, "Close");
          this.router.navigate(['/login']);
          return;
        }
        if (data.status) {
          if (data.surgesRemaining !== undefined && data.surgesRemaining !== null) {
            this.authService.setSurgesRemaining(data.surgesRemaining);
          }
          this.dialogRef.close(predictedMatch);
          this._snackBar.open(data.message, "Close");
        } else {
          this.errorDialog.open(ErrorDialogComponent, {
            width: '340px',
            data: { message: 'Prediction failed. Please try again.' },
          });
        }
      },
      error: () => {}
    });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }
}
