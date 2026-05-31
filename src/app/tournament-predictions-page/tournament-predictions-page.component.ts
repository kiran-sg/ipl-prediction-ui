import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonService } from '../common.service';
import { Player } from '../models/player.model';
import { Team } from '../models/team.model';
import { TournamentPrediction } from '../models/tournament-prediction.model';
import { TeamService } from '../team.service';
import { isTournamentPredictionClosed, TOURNAMENT_PREDICTION_CLOSING_TIME } from '../utils/common-utils';
import { PlayerSelectorComponent } from '../shared/player-selector/player-selector.component';
import { TeamSelectorComponent } from '../shared/team-selector/team-selector.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-tournament-predictions-page',
  imports: [
    CommonModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTabsModule,
    PlayerSelectorComponent,
    TeamSelectorComponent,
  ],
  providers: [DatePipe],
  templateUrl: './tournament-predictions-page.component.html',
  styleUrl: './tournament-predictions-page.component.scss'
})
export class TournamentPredictionsPageComponent {

  teams: Team[] = [];
  players: Player[] = [];
  tournamentPredictionForm!: FormGroup;

  private _snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  countdownText = 'Calculating...';
  private countdownInterval: any;
  lockPrediction = false;
  private pendingPrediction: TournamentPrediction | null = null;

  hasResults = false;
  showResultsView = false;
  resultComparison: { label: string; userPick: string; correctResult: string; isCorrect: boolean }[] = [];
  totalPoints: number | null = null;

  constructor(
    private service: CommonService,
    private router: Router,
    private fb: FormBuilder,
    private teamService: TeamService,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.teamService.loadTeams().subscribe(() => {
      this.teams = this.teamService.getTeamsForSelector();
    });
    this.lockPrediction = isTournamentPredictionClosed();
    this.updateCountdown();
    this.countdownInterval = setInterval(() => this.updateCountdown(), 1000);
    this.setTournamentPredictionForm();
    this.setPlayers();
    this.getPreviousPrediction();
  }

  ngOnDestroy() {
    clearInterval(this.countdownInterval);
  }

  getPreviousPrediction() {
    this.service.getTournamentPredictionByUserId().subscribe(data => {
      if (data.invalidUser) {
        alert(data.message);
        this.router.navigate(['/login']);
        return;
      }
      if (data.status && data.tournamentPrediction !== null) {
        if (this.players.length > 0) {
          this.updateForm(data.tournamentPrediction);
        } else {
          this.pendingPrediction = data.tournamentPrediction;
        }
      }
    });
  }

  onSelect(field: string, value: string): void {
    this.tournamentPredictionForm.get(field)?.setValue(value);
  }

  awardsFields = ['playerOfTournamentPredicted', 'fairPlayTeamPredicted', 'emergingPlayerPredicted'];
  battingFields = ['orangeCapPredicted', 'mostFoursPredicted', 'mostSixesPredicted'];
  bowlingFields = ['purpleCapPredicted', 'mostDotBallsPredicted', 'bestBowlingFigPredicted'];

  filledCount(fields: string[]): number {
    return fields.filter(f => !!this.tournamentPredictionForm.get(f)?.value).length;
  }

  filledFlags(fields: string[]): boolean[] {
    return fields.map(f => !!this.tournamentPredictionForm.get(f)?.value);
  }

  onSubmit(): void {
    if (isTournamentPredictionClosed()) {
      this.lockPrediction = true;
      this._snackBar.open('Tournament prediction is closed!', 'Close');
      return;
    }
    if (this.tournamentPredictionForm.invalid) {
      this.tournamentPredictionForm.markAllAsTouched();
      return;
    }
    const formValues = this.tournamentPredictionForm.value;
    const playerFields = ['orangeCapPredicted', 'purpleCapPredicted', 'emergingPlayerPredicted',
      'mostFoursPredicted', 'mostSixesPredicted', 'mostDotBallsPredicted', 'bestBowlingFigPredicted', 'playerOfTournamentPredicted'];
    const isAnyFieldFilled = [...playerFields, 'fairPlayTeamPredicted']
      .some(key => formValues[key] && formValues[key].toString().trim() !== '');

    if (!isAnyFieldFilled) {
      this._snackBar.open('Please fill at least one field before submitting!', 'Close');
      return;
    }
    const a = this.filledCount(this.awardsFields);
    const b = this.filledCount(this.battingFields);
    const bo = this.filledCount(this.bowlingFields);
    const total = a + b + bo;
    const summary = `Awards: ${a}/3\nBatting: ${b}/3\nBowling: ${bo}/3\n\nTotal: ${total}/9`;
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Prediction Summary', message: summary },
      width: '320px',
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.savePrediction(formValues);
    });
  }

  private savePrediction(formValues: any): void {
    const prediction: TournamentPrediction = {
      predictionId: formValues.predictionId,
      userId: formValues.userId,
      user: null as any,
      points: 0,
      orangeCapPredictedId: this.playerNoToId(formValues.orangeCapPredicted),
      purpleCapPredictedId: this.playerNoToId(formValues.purpleCapPredicted),
      emergingPlayerPredictedId: this.playerNoToId(formValues.emergingPlayerPredicted),
      fairPlayTeamPredictedId: this.shortNameToTeamId(formValues.fairPlayTeamPredicted),
      mostFoursPredictedId: this.playerNoToId(formValues.mostFoursPredicted),
      mostSixesPredictedId: this.playerNoToId(formValues.mostSixesPredicted),
      mostDotBallsPredictedId: this.playerNoToId(formValues.mostDotBallsPredicted),
      bestBowlingFigPredictedId: this.playerNoToId(formValues.bestBowlingFigPredicted),
      playerOfTournamentPredictedId: this.playerNoToId(formValues.playerOfTournamentPredicted),
    };
    this.service.saveTournamentPrediction(prediction).subscribe({
      next: (data) => {
        if (data.invalidUser) {
          this._snackBar.open(data.message, 'Close');
          this.router.navigate(['/login']);
          return;
        }
        if (data.status) {
          this._snackBar.open(data.message, 'Close');
          this.router.navigate(['/home']);
        } else {
          this._snackBar.open('Prediction failed', 'Close');
        }
      },
      error: () => {}
    });
  }

  private playerNoToId(playerNo: string): number | null {
    if (!playerNo) return null;
    return this.players.find(p => p.playerNo === playerNo)?.id ?? null;
  }

  private playerIdToNo(id: number | null): string {
    if (!id) return '';
    return this.players.find(p => p.id === id)?.playerNo ?? '';
  }

  private shortNameToTeamId(shortName: string): number | null {
    if (!shortName) return null;
    return this.teamService.getIdByShortName(shortName);
  }

  private teamIdToShortName(id: number | null): string {
    if (!id) return '';
    return this.teamService.getShortNameById(id);
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  setTournamentPredictionForm() {
    this.tournamentPredictionForm = this.fb.group({
      predictionId: [],
      userId: [localStorage.getItem('userId'), [Validators.required]],
      orangeCapPredicted: [''],
      purpleCapPredicted: [''],
      emergingPlayerPredicted: [''],
      fairPlayTeamPredicted: [''],
      mostFoursPredicted: [''],
      mostSixesPredicted: [''],
      mostDotBallsPredicted: [''],
      bestBowlingFigPredicted: [''],
      playerOfTournamentPredicted: [''],
    });
  }

  updateForm(prediction: TournamentPrediction) {
    this.tournamentPredictionForm.patchValue({
      predictionId: prediction.predictionId,
      orangeCapPredicted: this.playerIdToNo(prediction.orangeCapPredictedId),
      purpleCapPredicted: this.playerIdToNo(prediction.purpleCapPredictedId),
      emergingPlayerPredicted: this.playerIdToNo(prediction.emergingPlayerPredictedId),
      fairPlayTeamPredicted: this.teamIdToShortName(prediction.fairPlayTeamPredictedId),
      mostFoursPredicted: this.playerIdToNo(prediction.mostFoursPredictedId),
      mostSixesPredicted: this.playerIdToNo(prediction.mostSixesPredictedId),
      mostDotBallsPredicted: this.playerIdToNo(prediction.mostDotBallsPredictedId),
      bestBowlingFigPredicted: this.playerIdToNo(prediction.bestBowlingFigPredictedId),
      playerOfTournamentPredicted: this.playerIdToNo(prediction.playerOfTournamentPredictedId),
    });
  }

  setPlayers(): void {
    this.service.getPlayersByTeam([]).subscribe({
      next: (data: Player[]) => {
        this.players = data.map((player: Player) => ({
          ...player,
          displayValue: player.playerName + ' - ' + player.category + ' - ' + player.team,
        }));
        if (this.pendingPrediction) {
          this.updateForm(this.pendingPrediction);
          this.pendingPrediction = null;
        }
        this.fetchResults();
      }
    });
  }

  private fetchResults(): void {
    if (!this.lockPrediction) return;

    this.service.getTournamentPredictionByUserId().subscribe(data => {
      if (!data.status || !data.tournamentPrediction) return;
      const pred = data.tournamentPrediction;

      this.service.getTournamentResult().subscribe({
        next: (result: any) => {
          this.hasResults = result && Object.values(result).some(v => v != null);
          this.showResultsView = true;
          this.totalPoints = this.hasResults ? (pred.points ?? 0) : null;

          const fields = [
            { label: 'Player of Tournament', predId: pred.playerOfTournamentPredictedId, resultId: result?.playerOfTournamentWinnerId, type: 'player' },
            { label: 'Fair Play Award', predId: pred.fairPlayTeamPredictedId, resultId: result?.fairPlayTeamWinnerId, type: 'team' },
            { label: 'Emerging Player', predId: pred.emergingPlayerPredictedId, resultId: result?.emergingPlayerWinnerId, type: 'player' },
            { label: 'Orange Cap', predId: pred.orangeCapPredictedId, resultId: result?.orangeCapWinnerId, type: 'player' },
            { label: 'Most Fours', predId: pred.mostFoursPredictedId, resultId: result?.mostFoursWinnerId, type: 'player' },
            { label: 'Most Sixes', predId: pred.mostSixesPredictedId, resultId: result?.mostSixesWinnerId, type: 'player' },
            { label: 'Purple Cap', predId: pred.purpleCapPredictedId, resultId: result?.purpleCapWinnerId, type: 'player' },
            { label: 'Most Dot Balls', predId: pred.mostDotBallsPredictedId, resultId: result?.mostDotBallsWinnerId, type: 'player' },
            { label: 'Best Bowling Figure', predId: pred.bestBowlingFigPredictedId, resultId: result?.bestBowlingFigWinnerId, type: 'player' },
          ];
          this.resultComparison = fields.map(f => ({
            label: f.label,
            userPick: f.type === 'player' ? this.playerNameById(f.predId) : this.teamNameById(f.predId),
            correctResult: this.hasResults ? (f.type === 'player' ? this.playerNameById(f.resultId) : this.teamNameById(f.resultId)) : '',
            isCorrect: this.hasResults && f.predId != null && f.resultId != null && f.predId === f.resultId,
          }));
        },
        error: () => {
          // If result API fails, still show user picks with pending
          this.hasResults = false;
          this.showResultsView = true;
          this.totalPoints = null;
          const fields = [
            { label: 'Player of Tournament', predId: pred.playerOfTournamentPredictedId, type: 'player' },
            { label: 'Fair Play Award', predId: pred.fairPlayTeamPredictedId, type: 'team' },
            { label: 'Emerging Player', predId: pred.emergingPlayerPredictedId, type: 'player' },
            { label: 'Orange Cap', predId: pred.orangeCapPredictedId, type: 'player' },
            { label: 'Most Fours', predId: pred.mostFoursPredictedId, type: 'player' },
            { label: 'Most Sixes', predId: pred.mostSixesPredictedId, type: 'player' },
            { label: 'Purple Cap', predId: pred.purpleCapPredictedId, type: 'player' },
            { label: 'Most Dot Balls', predId: pred.mostDotBallsPredictedId, type: 'player' },
            { label: 'Best Bowling Figure', predId: pred.bestBowlingFigPredictedId, type: 'player' },
          ];
          this.resultComparison = fields.map(f => ({
            label: f.label,
            userPick: f.type === 'player' ? this.playerNameById(f.predId) : this.teamNameById(f.predId),
            correctResult: '',
            isCorrect: false,
          }));
        }
      });
    });
  }

  private playerNameById(id: number | null): string {
    if (!id) return '-';
    return this.players.find(p => p.id === id)?.playerName || '-';
  }

  private teamNameById(id: number | null): string {
    if (!id) return '-';
    return this.teamService.getTeamsForSelector().find(t => t.id === id)?.name || '-';
  }

  updateCountdown() {
    const closingDate = new Date(TOURNAMENT_PREDICTION_CLOSING_TIME);
    const now = new Date();
    const diff = closingDate.getTime() - now.getTime();

    if (diff <= 0) {
      this.countdownText = 'SEASON PREDICTION CLOSED!';
      this.lockPrediction = true;
      clearInterval(this.countdownInterval);
      return;
    }

    const isSameDay =
      closingDate.getFullYear() === now.getFullYear() &&
      closingDate.getMonth() === now.getMonth() &&
      closingDate.getDate() === now.getDate();

    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (isSameDay || diffDays <= 1) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      this.countdownText = `Season Prediction Closes in ${hours}h ${minutes}m ${seconds}s`;
    } else {
      const displayDate = new Date(closingDate.getTime() - 1); // show previous day since closing is midnight
      const formatted = this.datePipe.transform(displayDate, 'dd-MMM-yyyy') || '';
      this.countdownText = `Season Prediction Closes on ${formatted}`;
    }
  }
}
