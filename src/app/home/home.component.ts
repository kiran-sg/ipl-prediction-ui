import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PredictDialogComponent } from '../predict-dialog/predict-dialog.component';
import { Match } from '../models/match.model';
import { CommonService } from '../common.service';
import { TeamLogo } from '../enums/team-logo';
import { CustomDatePipe } from '../custom-date.pipe';
import { isMatchTimeBelowSixtyMins } from '../utils/common-utils';
import { PredictionsDialogComponent } from '../predictions-dialog/predictions-dialog.component';
import { Overlay } from '@angular/cdk/overlay';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    MatDialogModule,
    CustomDatePipe
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  matches: Match[] = [];
  matchStartDate: Date = new Date();
  matchEndDate: Date = new Date(new Date().setDate(new Date().getDate() + 10));
  readonly dialog = inject(MatDialog);

  constructor(
    private service: CommonService, 
    private overlay: Overlay
  ) {
    this.fetchUpcomingMatches();
   }

  ngOnInit(): void {
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
      console.log('Dialog closed', result);
    });
  }

  openPredictionsDialog(): void {
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
      console.log('Dialog closed', result);
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
          return {
            ...match,
            isLocked: isMatchTimeBelowSixtyMins(match.dateTime),
            homeLogo: TeamLogo[match.home as keyof typeof TeamLogo],
            awayLogo: TeamLogo[match.away as keyof typeof TeamLogo],
          };
        });
        console.log('Matches:', this.matches);
      },
      error: (error) => {
        console.error('Error fetching matches:', error);
      },
    });
  }

}

