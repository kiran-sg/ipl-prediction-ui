import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PredictDialogComponent } from '../predict-dialog/predict-dialog.component';
import { Match } from '../models/match.model';
import { CommonService } from '../common.service';
import { TeamName } from '../enums/team';
import { TeamLogo } from '../enums/team-logo';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    MatDialogModule
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  matches: Match[] = [];
  readonly dialog = inject(MatDialog);

  constructor(private service: CommonService, private datePipe: DatePipe) {

    this.fetchUpcomingMatches();
   }

  ngOnInit(): void {
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
    this.service.getMatches().subscribe({
      next: (data: Match[]) => {
        this.matches = data.map((match: Match) => {
          return {
            ...match,
            homeLogo: this.getTeamLogo(match.home),
            awayLogo: this.getTeamLogo(match.away),
            //dateTime: match.date 
          };
        });
        console.log('Matches:', this.matches);
      },
      error: (error) => {
        console.error('Error fetching matches:', error);
      },
    });
  }

  private getTeamLogo(teamName: string): string {
    switch (teamName) {
      case TeamName.KKR:
        return TeamLogo.KKR;
      case TeamName.RCB:
        return TeamLogo.RCB;
      case TeamName.SRH:
        return TeamLogo.SRH;
      case TeamName.RR:
        return TeamLogo.RR;
      case TeamName.CSK:
        return TeamLogo.CSK;
      case TeamName.MI:
        return TeamLogo.MI;
      case TeamName.DC:
        return TeamLogo.DC;
      case TeamName.LSG:
        return TeamLogo.LSG;
      case TeamName.GT:
        return TeamLogo.GT;
      case TeamName.PK:
        return TeamLogo.PK;
      default:
        return '';
    }
  }

}
