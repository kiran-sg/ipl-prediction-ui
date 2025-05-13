import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PredictDialogComponent } from '../predict-dialog/predict-dialog.component';
import { Match } from '../models/match.model';
import { CommonService } from '../common.service';
import { TeamLogo } from '../enums/team-logo';
import { CustomDatePipe } from '../custom-date.pipe';
import { isMatchTimeBelowSixtyMins, isMatchToday, TOURNAMENT_PREDICTION_CLOSING_TIME } from '../utils/common-utils';
import { PredictionsDialogComponent } from '../predictions-dialog/predictions-dialog.component';
import { Overlay } from '@angular/cdk/overlay';
import { TournamentPredictionsDialogComponent } from '../tournament-predictions-dialog/tournament-predictions-dialog.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    MatDialogModule,
    MatIconModule,
    CustomDatePipe
  ],
  providers: [DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  matches: Match[] = [];
  matchStartDate: Date = new Date();
  matchEndDate: Date = new Date(new Date().setDate(new Date().getDate() + 10));
  readonly dialog = inject(MatDialog);
  
  countdownText = 'Calculating...';
  private countdownInterval: any;

  constructor(
    private service: CommonService, 
    private overlay: Overlay,
    private datePipe: DatePipe,
  ) {
    this.fetchUpcomingMatches();
  }

  ngOnInit() {
    this.updateCountdown();
    this.countdownInterval = setInterval(() => this.updateCountdown(), 1000);
  }

  ngOnDestroy() {
    clearInterval(this.countdownInterval);
  }

  openPredictDialog(match: Match): void {
    if (isMatchTimeBelowSixtyMins(match.dateTime)) {
      alert('You can only predict a match 60 minutes before the match starts.');
      return;
    }
    const dialogRef = this.dialog.open(PredictDialogComponent, {
      width: '500px', // Initial width
      height: 'auto', // Initial height
      data: { match }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getPredictionsForMatches();
      }
    });
  }

  openPreviousPredictionsDialog(): void {
    const dialogRef = this.dialog.open(PredictionsDialogComponent, {
      //width: '50vw', // Initial width
      height: 'auto', // Initial height
      maxWidth: '80vw',
      maxHeight: '700vw',
      autoFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      data: { source: 'user' }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      
    });
  }

  openTournamentPredictionDialog(): void {
    const dialogRef = this.dialog.open(TournamentPredictionsDialogComponent, {
      width: '500px', // Initial width
      height: 'auto', // Initial height
    });
  
    dialogRef.afterClosed().subscribe(result => {
      
    });
  }

  fetchUpcomingMatches(): void {
    this.service.getMatches().subscribe({
      next: (data: Match[]) => {
        this.matches = data
        .filter((match: Match) => {
          return new Date(match.dateTime) >= this.matchStartDate
          && new Date(match.dateTime) <= this.matchEndDate;
        })
        .map((match: Match) => {
          const predictionLockingTime = new Date(new Date(match.dateTime).getTime() - 1 * 60 * 60 * 1000);
          return {
            ...match,
            isLocked: isMatchTimeBelowSixtyMins(match.dateTime),
            homeLogo: TeamLogo[match.home as keyof typeof TeamLogo],
            awayLogo: TeamLogo[match.away as keyof typeof TeamLogo],
            isToday: isMatchToday(match.dateTime),
            predictionLockingTime: this.datePipe.transform(predictionLockingTime, 'hh:mm a') || '',
          };
        });
        this.getPredictionsForMatches();
      },
      error: (error) => {
        console.error('Error fetching matches:', error);
      },
    });
  }

  getPredictionsForMatches(): void {
    //create a map of matchId from this.matches
    const matchIds = this.matches.map((match: Match) => match.matchNo);
    this.service.getPredictionsForUserByMatches(matchIds).subscribe({
      next: (data: any) => {
        console.log('Predictions:', data);
        this.matches = this.matches.map((match: Match) => {
          const prediction = data.predictions.find((pred: any) => pred.matchId === match.matchNo);
          return {
            ...match,
            isPredicted: prediction,
          };
        });
      },
      error: (error) => {
        console.error('Error fetching predictions:', error);
      },
    });
  }

  updateCountdown() {
    const closingDate = new Date(TOURNAMENT_PREDICTION_CLOSING_TIME); // May 9, 6 PM IST
    const now = new Date();
    const diff = closingDate.getTime() - now.getTime();

    if (diff <= 0) {
      this.countdownText = 'CLOSED!';
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

