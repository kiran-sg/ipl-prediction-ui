import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AdminService } from '../admin.service';
import { CommonService } from '../common.service';
import { MatchResult } from '../models/match-result';
import { Player } from '../models/player.model';
import { PredictDialogComponent } from '../predict-dialog/predict-dialog.component';
import { Team } from '../models/team.model';
import { TournamentPrediction } from '../models/tournament-prediction.model';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { map, Observable, startWith } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { isTournamentPredictionClosed, TOURNAMENT_PREDICTION_CLOSING_TIME } from '../utils/common-utils';

@Component({
  selector: 'app-tournament-predictions-dialog',
  imports: [
    CommonModule,
    MatDialogModule, 
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatIconModule,
  ],
  templateUrl: './tournament-predictions-dialog.component.html',
  styleUrl: './tournament-predictions-dialog.component.scss'
})
export class TournamentPredictionsDialogComponent {
  
  dialogWidth: string = '500px'; // Default width
  dialogHeight: string = 'auto'; // Default height
  userId: string = sessionStorage.getItem('userId') || '';
  teams: string[] = ['CSK', 'MI', 'RCB', 'KKR', 'SRH', 'DC', 'GT', 'LSG', 'RR', 'PBKS'];
  players: Player[] = [];
  playerNames: string[] = [];
  tournamentPredictionForm!: FormGroup;

  private _snackBar = inject(MatSnackBar);

  orangeCapFilteredOptions!: string[];
  purpleCapFilteredOptions!: string[];
  emergingPlayerFilteredOptions!: string[];
  mostFoursFilteredOptions!: string[];
  mostSixesFilteredOptions!: string[];
  mostDotBalssFilteredOptions!: string[];
  bestBowlingFigFilteredOptions!: string[];

  countdownText = 'Calculating...';
  private countdownInterval: any;
  lockPrediction: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private breakpointObserver: BreakpointObserver,
    private dialogRef: MatDialogRef<TournamentPredictionsDialogComponent>,
    private service: CommonService,
    private router: Router, 
    private fb: FormBuilder, 
  ) {}

  ngOnInit(): void {
    this.lockPrediction = isTournamentPredictionClosed();
    this.updateCountdown();
    this.countdownInterval = setInterval(() => this.updateCountdown(), 1000);
    this.adjustScreen();
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
        //this.formSubmitted.emit(undefined);
        return;
      }
      if (data.status && data.tournamentPrediction !== null) {
        this.updateForm(data.tournamentPrediction);
      } 
    });
  }

  onSubmit(): void {
    if (isTournamentPredictionClosed()) {
      this.lockPrediction = true;
      this._snackBar.open('Tournament prediction is closed!', "Close");
      return;
    }
    if (this.tournamentPredictionForm.invalid) {
      this.tournamentPredictionForm.markAllAsTouched();
      return;
    }
    const formValues = this.tournamentPredictionForm.value;
    const isAnyFieldFilled = Object.keys(formValues)
      .filter(key => key !== 'userId' && key !== 'predictionId')
      .some(key => formValues[key] && formValues[key].toString().trim() !== '');

    if (!isAnyFieldFilled) {
      this._snackBar.open('Please fill at least one field before submitting!', "Close");
      return;
    }
    const prediction: TournamentPrediction = this.tournamentPredictionForm.value;
    this.service.saveTournamentPrediction(prediction).subscribe((data) => {
      if (data.invalidUser) {
        //alert(data.message);
        this.dialogRef.close(prediction);
        this._snackBar.open(data.message, "Close");
        this.router.navigate(['/login']);
        return;
      }
      if (data.status) {
        //alert('Prediction submitted');
        this.dialogRef.close(prediction);
        this._snackBar.open(data.message, "Close");
      } else {
        alert('Prediction failed');
      }
    });
  }

  setTournamentPredictionForm() {
    this.tournamentPredictionForm = this.fb.group({
      predictionId: [],
      userId: [sessionStorage.getItem('userId'), [Validators.required]],
      orangeCapPredicted: [''],
      purpleCapPredicted: [''],
      emergingPlayerPredicted: [''],
      fairPlayTeamPredicted: [''],
      mostFoursPredicted: [''],
      mostSixesPredicted: [''],
      mostDotBallsPredicted: [''],
      bestBowlingFigPredicted: [''],
    });
  }

  updateForm(prediction: TournamentPrediction) {
    this.tournamentPredictionForm.patchValue({
      predictionId: prediction.predictionId,
      orangeCapPredicted: prediction.orangeCapPredicted,
      purpleCapPredicted: prediction.purpleCapPredicted,
      emergingPlayerPredicted: prediction.emergingPlayerPredicted,
      fairPlayTeamPredicted: prediction.fairPlayTeamPredicted,
      mostFoursPredicted: prediction.mostFoursPredicted,
      mostSixesPredicted: prediction.mostSixesPredicted,
      mostDotBallsPredicted: prediction.mostDotBallsPredicted,
      bestBowlingFigPredicted: prediction.bestBowlingFigPredicted,
    });
  }

  setPlayers(): void {
    this.service.getPlayersByTeam([]).subscribe({
      next: (data: Player[]) => {
        this.players = data.map((player: Player) => {
          return {
            ...player,
            displayValue: player.playerName + ' - ' + player.category + ' - ' + player.team + ''
          }
        });
        this.playerNames = this.players.map(player => player.playerName + ' - ' + player.team);
        this.applyInitialFilterToAllFields();
        console.log("this.players", this.players);
      }
    });
  }

  applyInitialFilterToAllFields(): void {
    this.orangeCapFilteredOptions = this.playerNames.slice();
    this.purpleCapFilteredOptions = this.playerNames.slice();
    this.emergingPlayerFilteredOptions = this.playerNames.slice();
    this.mostFoursFilteredOptions = this.playerNames.slice();
    this.mostSixesFilteredOptions = this.playerNames.slice();
    this.mostDotBalssFilteredOptions = this.playerNames.slice();
    this.bestBowlingFigFilteredOptions = this.playerNames.slice();
  }

  filterOrangeCap(): void {
    const filterValue = this.tournamentPredictionForm?.value?.orangeCapPredicted.toLowerCase();
    this.orangeCapFilteredOptions = [...this.playerNames].filter(o => o.toLowerCase().includes(filterValue));
  }

  filterPurpleCap(): void {
    const filterValue = this.tournamentPredictionForm?.value?.purpleCapPredicted.toLowerCase();
    this.purpleCapFilteredOptions = [...this.playerNames].filter(o => o.toLowerCase().includes(filterValue));
  }

  filterEmergingPlayer(): void {
    const filterValue = this.tournamentPredictionForm?.value?.emergingPlayerPredicted.toLowerCase();
    this.emergingPlayerFilteredOptions = [...this.playerNames].filter(o => o.toLowerCase().includes(filterValue));
  }

  filterMostFours(): void {
    const filterValue = this.tournamentPredictionForm?.value?.mostFoursPredicted.toLowerCase();
    this.mostFoursFilteredOptions = [...this.playerNames].filter(o => o.toLowerCase().includes(filterValue));
  }

  filterMostSixes(): void {
    const filterValue = this.tournamentPredictionForm?.value?.mostSixesPredicted.toLowerCase();
    this.mostSixesFilteredOptions = [...this.playerNames].filter(o => o.toLowerCase().includes(filterValue));
  }

  filterMostDotBalls(): void {
    const filterValue = this.tournamentPredictionForm?.value?.mostDotBallsPredicted.toLowerCase();
    this.mostDotBalssFilteredOptions = [...this.playerNames].filter(o => o.toLowerCase().includes(filterValue));
  }

  filterBestBowlingFig(): void {
    const filterValue = this.tournamentPredictionForm?.value?.bestBowlingFigPredicted.toLowerCase();
    this.bestBowlingFigFilteredOptions = [...this.playerNames].filter(o => o.toLowerCase().includes(filterValue));
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

  updateCountdown() {
    const closingDate = new Date(TOURNAMENT_PREDICTION_CLOSING_TIME); // May 9, 6 PM IST
    const now = new Date();
    const diff = closingDate.getTime() - now.getTime();

    if (diff <= 0) {
      this.countdownText = 'PREDICTION CLOSED!';
      clearInterval(this.countdownInterval);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    this.countdownText = 'Closes in ' + `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

}
