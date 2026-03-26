import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonService } from '../common.service';
import { AuthService } from '../auth.service';
import { PredictDialogComponent } from '../predict-dialog/predict-dialog.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AdminService } from '../admin.service';
import { Player } from '../models/player.model';
import { Team } from '../models/team.model';
import { MatchResult } from '../models/match-result';
import { TeamService } from '../team.service';
import { TeamSelectorComponent } from '../shared/team-selector/team-selector.component';
import { ScoreSelectorComponent } from '../shared/score-selector/score-selector.component';
import { PlayerSelectorComponent } from '../shared/player-selector/player-selector.component';

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
    MatIconModule,
    ReactiveFormsModule,
    TeamSelectorComponent,
    ScoreSelectorComponent,
    PlayerSelectorComponent
  ],
  templateUrl: './match-result-dialog.component.html',
  styleUrl: './match-result-dialog.component.scss'
})
export class MatchResultDialogComponent implements OnInit, OnDestroy {
  matchDetails!: MatchData;
  dialogWidth: string = '500px';
  dialogHeight: string = 'auto';
  teams!: Team[];
  players: Player[] = [];
  firstInnScoreOptions = [
    '< 100', '100 - 130', '131 - 160', '161 - 180', '181 - 200', '> 200'
  ];
  resultForm!: FormGroup;
  sessionTimer = '';
  private timerInterval: any;

  private _snackBar = inject(MatSnackBar);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private breakpointObserver: BreakpointObserver,
    private dialogRef: MatDialogRef<PredictDialogComponent>,
    private service: CommonService,
    private adminService: AdminService,
    private router: Router,
    private fb: FormBuilder,
    private teamService: TeamService,
    private authService: AuthService,
  ) {
    this.matchDetails = data.match;
  }

  ngOnInit(): void {
    this.sessionTimer = this.authService.getSessionRemainingText();
    this.timerInterval = setInterval(() => {
      this.sessionTimer = this.authService.getSessionRemainingText();
    }, 1000);
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
      this.handleNoResult(true);
    }
    this.resultForm.patchValue({
      tossWon: result.tossWon,
      teamWon: result.teamWon,
      playerOfTheMatch: result.playerOfTheMatch,
      mostRunsScorer: result.mostRunsScorer,
      mostWicketsTaker: result.mostWicketsTaker,
      firstInnScore: result.firstInnScore,
    });
  }

  setTeams(): void {
    this.teams = [
      {
        id: 1,
        name: this.matchDetails?.home,
        logo: this.teamService.getLogo(this.matchDetails.home),
        shortName: this.teamService.getShortName(this.matchDetails.home)
      },
      {
        id: 2,
        name: this.matchDetails?.away,
        logo: this.teamService.getLogo(this.matchDetails.away),
        shortName: this.teamService.getShortName(this.matchDetails.away)
      }
    ];
  }

  setPlayers(): void {
    const teamNames = this.teams.map(team => team.shortName);
    this.service.getPlayersByTeam(teamNames).subscribe({
      next: (data: Player[]) => {
        this.players = data.map((player: Player) => ({
          ...player,
          displayValue: player.playerName + ' - ' + player.category + ' - ' + player.team
        }));
      }
    });
  }

  onSelect(field: string, value: string): void {
    this.resultForm.get(field)?.setValue(value);
    if (field === 'tossWon' && value === 'no_result') {
      this.resultForm.get('tossWon')?.setValue('');
      this.resultForm.get('teamWon')?.setValue('no_result');
      this.handleNoResult(true);
    } else if (field === 'teamWon' && value === 'no_result') {
      this.resultForm.get('tossWon')?.setValue('');
      this.handleNoResult(true);
    } else if (field === 'teamWon' && value !== 'no_result') {
      this.handleNoResult(false);
    }
  }

  get isNoResult(): boolean {
    return this.resultForm.get('teamWon')?.value === 'no_result';
  }

  private handleNoResult(noResult: boolean): void {
    const fields = ['firstInnScore', 'mostRunsScorer', 'mostWicketsTaker', 'playerOfTheMatch'];
    const tossCtrl = this.resultForm.get('tossWon');
    const teamCtrl = this.resultForm.get('teamWon');
    fields.forEach(f => {
      const ctrl = this.resultForm.get(f);
      if (noResult) {
        ctrl?.setValue('');
        ctrl?.clearValidators();
      } else {
        ctrl?.setValidators(Validators.required);
      }
      ctrl?.updateValueAndValidity();
    });
    if (noResult) {
      tossCtrl?.clearValidators();
      teamCtrl?.clearValidators();
    } else {
      tossCtrl?.setValidators(Validators.required);
      teamCtrl?.setValidators(Validators.required);
    }
    tossCtrl?.updateValueAndValidity();
    teamCtrl?.updateValueAndValidity();
  }

  adjustScreen() {
    this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.Tablet,
      Breakpoints.Web,
    ]).subscribe(result => {
      if (result.breakpoints[Breakpoints.Handset]) {
        this.dialogWidth = '95vw';
      } else {
        this.dialogWidth = '80vw';
      }
      this.dialogRef.updateSize(this.dialogWidth, '');
      this.dialogRef.addPanelClass('auto-height-dialog');
    });
  }

  onMatchAbandonedChange(_isMatchAbandoned: any) {
  }

  resetResults() {
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }
}
