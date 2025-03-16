import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import { CricketService } from '../cricket.service';
import { CommonModule } from '@angular/common';
import { CustomDatePipe } from "../custom-date.pipe";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PredictDialogComponent } from '../predict-dialog/predict-dialog.component';
import { Match } from '../models/match.model';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  matches: Match[] = [];
  readonly dialog = inject(MatDialog);

  constructor(private cricketService: CricketService) { }

  ngOnInit(): void {
    this.fetchUpcomingMatches();
  }

  openPredictDialog(match: Match): void {
    const dialogRef = this.dialog.open(PredictDialogComponent, {
      data: { match }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  fetchUpcomingMatches(): void {
    /* this.cricketService.getUpcomingMatches().subscribe(
      (data: any) => {
        this.matches = data.matches;
      },
      (error) => {
        console.error('Error fetching matches:', error);
      }
    ); */
    this.matches = [
      {
        id: 1,
        matchNr: 1,
        team1: 'KKR',
        team2: 'RCB',
        team1Logo: 'assets/ipl/kkr.png',
        team2Logo: 'assets/ipl/rcb.png',
        dateTime: '2025-03-22 19:30:00',
      },
      {
        id: 2,
        matchNr: 2,
        team1: 'SRH',
        team2: 'RR',
        team1Logo: 'assets/ipl/srh.png',
        team2Logo: 'assets/ipl/rr.png',
        dateTime: '2025-03-23 15:30:00',
      },
      {
        id: 3,
        matchNr: 3,
        team1: 'CSK',
        team2: 'MI',
        team1Logo: 'assets/ipl/csk.png',
        team2Logo: 'assets/ipl/mi.png',
        dateTime: '2025-03-23 19:30:00',
      },
      {
        id: 4,
        matchNr: 4,
        team1: 'DC',
        team2: 'LSG',
        team1Logo: 'assets/ipl/dc.png',
        team2Logo: 'assets/ipl/lsg.png',
        dateTime: '2025-03-24 19:30:00',
      },
      {
        id: 5,
        matchNr: 5,
        team1: 'GT',
        team2: 'PK',
        team1Logo: 'assets/ipl/gt.png',
        team2Logo: 'assets/ipl/pk.png',
        dateTime: '2025-03-25 19:30:00',
      },
      {
        id: 6,
        matchNr: 6,
        team1: 'RR',
        team2: 'KKR',
        team1Logo: 'assets/ipl/rr.png',
        team2Logo: 'assets/ipl/kkr.png',
        dateTime: '2025-03-26 19:30:00',
      }
    ];
  }

}
