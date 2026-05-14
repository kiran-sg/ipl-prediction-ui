import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PredictDialogComponent } from '../predict-dialog/predict-dialog.component';
import { Match } from '../models/match.model';
import { CommonService } from '../common.service';
import { CustomDatePipe } from '../custom-date.pipe';
import { isMatchTimeBelowSixtyMins, isMatchToday, TOURNAMENT_PREDICTION_CLOSING_TIME } from '../utils/common-utils';
import { PredictionsDialogComponent } from '../predictions-dialog/predictions-dialog.component';
import { Overlay } from '@angular/cdk/overlay';
import { MatIconModule } from '@angular/material/icon';
import { TeamService } from '../team.service';
import { Router } from '@angular/router';

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
    private teamService: TeamService,
    private router: Router,
  ) {
    this.teamService.loadTeams().subscribe(() => this.fetchUpcomingMatches());
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
      width: '80vw',
      maxWidth: '900px',
      height: '85vh',
      disableClose: true,
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
      height: 'auto',
      maxWidth: '80vw',
      maxHeight: '700vw',
      autoFocus: false,
      disableClose: true,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      data: { source: 'user' }
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  openTournamentPredictionDialog(): void {
    this.router.navigate(['/season-predictor']);
  }

  private getTeamLogo(teamName: string): string {
    return this.teamService.getLogo(teamName);
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
            homeLogo: this.getTeamLogo(match.home),
            awayLogo: this.getTeamLogo(match.away),
            isToday: isMatchToday(match.dateTime),
            predictionLockingTime: this.datePipe.transform(predictionLockingTime, 'hh:mm a') || '',
            name: match.matchNo === '71' ? 'Qualifier 1' :
                  match.matchNo === '72' ? 'Eliminator' :
                  match.matchNo === '73' ? 'Qualifier 2' :
                  match.matchNo === '74' ? 'Final' : ''
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
        const predictions = data.predictions || [];
        console.log('Matches before merging predictions:', this.matches);
        this.matches = this.matches.map((match: Match) => {
          const prediction = predictions.find((pred: any) => pred.matchId === match.matchNo);
          return {
            ...match,
            isPredicted: !!prediction,
          };
        });
        console.log('Matches after merging predictions:', this.matches);
      },
      error: (error) => {
        console.error('Error fetching predictions:', error);
      },
    });
  }

  updateCountdown() {
    const closingDate = new Date(TOURNAMENT_PREDICTION_CLOSING_TIME);
    const now = new Date();
    const diff = closingDate.getTime() - now.getTime();

    if (diff <= 0) {
      this.countdownText = 'CLOSED!';
      clearInterval(this.countdownInterval);
      return;
    }

    const isSameDay =
      closingDate.getFullYear() === now.getFullYear() &&
      closingDate.getMonth() === now.getMonth() &&
      closingDate.getDate() === now.getDate();

    if (isSameDay) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      this.countdownText = `Closes in ${hours}h ${minutes}m ${seconds}s`;
    } else {
      const displayDate = new Date(closingDate.getTime() - 1);
      const formatted = this.datePipe.transform(displayDate, 'dd-MMM-yyyy') || '';
      this.countdownText = `Closes on ${formatted}`;
    }
  }

}

