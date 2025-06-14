import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonService } from '../common.service';
import { PredictDialogComponent } from '../predict-dialog/predict-dialog.component';
import { PredictFormComponent } from '../predict-form/predict-form.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AdminService } from '../admin.service';
import { MatSelectModule } from '@angular/material/select';
import { Player } from '../models/player.model';
import { Team } from '../models/team.model';
import { MatchResult } from '../models/match-result';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

export interface MatchData {
  matchNo: string;
  match: string;
  home: string;
  away: string;
  dateTime: string;
}

@Component({
  selector: 'app-match-result-dialog',
  imports: [
    CommonModule,
    MatDialogModule, 
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSlideToggleModule
  ],
  templateUrl: './match-result-dialog.component.html',
  styleUrl: './match-result-dialog.component.scss'
})
export class MatchResultDialogComponent {
  matchDetails!: MatchData;
  dialogWidth: string = '500px'; // Default width
  dialogHeight: string = 'auto'; // Default height
  teams!: Team[];
  players: Player[] = [];
  firstInnScoreOptions = [
    '< 100','100 - 130','131 - 160','161 - 180','181 - 200','> 200'
  ]
  resultForm!: FormGroup;
  isMatchAbandoned: boolean = false;

  private _snackBar = inject(MatSnackBar);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private breakpointObserver: BreakpointObserver,
    private dialogRef: MatDialogRef<PredictDialogComponent>,
    private service: CommonService,
    private adminService: AdminService,
    private router: Router, 
    private fb: FormBuilder, 
  ) {
    this.matchDetails = data.match;
  }

  ngOnInit(): void {
    this.adjustScreen();
    this.setResultForm();
    this.setTeams();
    this.setPlayers();
    this.getResultsIfAvailable();
  }

  getResultsIfAvailable() {
    this.adminService.getMatchResult(this.matchDetails.matchNo).subscribe(data => {
      if (data.matchResult !== null) {
        this.updateForm(data.matchResult);
      }
    });
  }

  onSubmit(): void {
    if (this.resultForm.valid) {
      if (!this.isMatchAbandoned && this.resultForm.value.tossWon === 'no_result') {
        alert("Please select a team for Toss Winner. If the match is abandoned, please select the checkbox.");
        return;
      }
      if (!this.isMatchAbandoned && this.resultForm.value.teamWon === 'no_result') {
        alert("Please select a team for Team Winner. If the match is abandoned, please select the checkbox.");
        return;
      }
      const matchResult: MatchResult = this.resultForm.value;
      this.adminService.updateMatchResults(matchResult).subscribe(data => {
        if (data.status) {
          this.dialogRef.close(matchResult);
          this._snackBar.open(data.message, "Close");
        }
      });
    }
  }

  setResultForm() {
    this.resultForm = this.fb.group({
      matchId: [this.matchDetails.matchNo],
      match: [this.matchDetails.match, [Validators.required]],
      tossWon: ['', Validators.required],
      teamWon: ['', Validators.required],
      playerOfTheMatch: ['', Validators.required],
      mostRunsScorer: ['', Validators.required],
      mostWicketsTaker: ['', Validators.required],
      firstInnScore: ['', Validators.required],
    });
  }

  updateForm(result: MatchResult) {
    if (result.teamWon === 'no_result') {
      this.isMatchAbandoned = true;
      this.onMatchAbandonedChange(this.isMatchAbandoned);
    } else {
      this.isMatchAbandoned = false;
    }
    this.resultForm.patchValue({
      tossWon: result.tossWon,
      teamWon: result.teamWon,
      playerOfTheMatch: result.playerOfTheMatch,
      mostRunsScorer: result.mostRunsScorer,
      mostWicketsTaker: result.mostWicketsTaker,
      firstInnScore: result.firstInnScore,
    })
  }

  setTeams(): void {
    this.teams = [
      {
        id: 1,
        name: this.matchDetails?.home,
        logo: '',
        shortName: this.matchDetails.home
      },
      {
        id: 2,
        name: this.matchDetails?.away,
        logo: '',
        shortName: this.matchDetails.away
      }
    ]
  }

  setPlayers(): void {
    const teamNames = this.teams.map(team => team.name);
    this.service.getPlayersByTeam(teamNames).subscribe({
      next: (data: Player[]) => {
        this.players = data.map((player: Player) => {
          return {
            ...player,
            displayValue: player.playerName + ' - ' + player.category + ' - ' + player.team + ''
          }
        });
        console.log("this.players", this.players);
      }
    });
  }

  adjustScreen() {
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

  onMatchAbandonedChange(isMatchAbandoned: any) {
    console.log("onMatchAbandonedChange value", isMatchAbandoned);
    this.isMatchAbandoned = isMatchAbandoned;
    this.resetResults();
    //remove validators from the form controls except tossWon and teamWon
    if (isMatchAbandoned) {
      this.resultForm.get('playerOfTheMatch')?.clearValidators();
      this.resultForm.get('mostRunsScorer')?.clearValidators();
      this.resultForm.get('mostWicketsTaker')?.clearValidators();
      this.resultForm.get('firstInnScore')?.clearValidators();
    }
    else {
      this.resultForm.get('playerOfTheMatch')?.setValidators([Validators.required]);
      this.resultForm.get('mostRunsScorer')?.setValidators([Validators.required]);
      this.resultForm.get('mostWicketsTaker')?.setValidators([Validators.required]);
      this.resultForm.get('firstInnScore')?.setValidators([Validators.required]);
    }
    this.resultForm.get('playerOfTheMatch')?.updateValueAndValidity();
    this.resultForm.get('mostRunsScorer')?.updateValueAndValidity();
    this.resultForm.get('mostWicketsTaker')?.updateValueAndValidity();
    this.resultForm.get('firstInnScore')?.updateValueAndValidity();
  }

  resetResults() {
    this.resultForm.get('tossWon')?.setValue('');
    this.resultForm.get('teamWon')?.setValue('');
    this.resultForm.get('playerOfTheMatch')?.setValue('');
    this.resultForm.get('mostRunsScorer')?.setValue('');
    this.resultForm.get('mostWicketsTaker')?.setValue('');
    this.resultForm.get('firstInnScore')?.setValue('');
  }

}
