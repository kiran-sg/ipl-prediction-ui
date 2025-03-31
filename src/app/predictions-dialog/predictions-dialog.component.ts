import { Component, Inject, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonService } from '../common.service';
import { CustomDatePipe } from '../custom-date.pipe';
import { AdminService } from '../admin.service';
import { Player } from '../models/player.model';
import { Match } from '../models/match.model';
import { Team } from '../models/team.model';
import { Prediction } from '../models/prediction.model';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatchResult } from '../models/match-result';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';

@Component({
  selector: 'app-predictions-dialog',
  imports: [
    MatInputModule, 
    MatTableModule, 
    MatSortModule, 
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatMenuModule,
    MatListModule,
    MatExpansionModule,
    MatGridListModule,
    MatTooltipModule
  ],
  templateUrl: './predictions-dialog.component.html',
  styleUrl: './predictions-dialog.component.scss'
})
export class PredictionsDialogComponent {

  source!: string;
  matchDetails!: Match;
  predictions: Prediction[] = [];
  teams!: Team[];
  players: Player[] = [];
  matchResult!: MatchResult;
  dataSource: MatTableDataSource<Prediction>;
  readonly dialog = inject(MatDialog);
  readonly panelOpenState = signal(false);

  columnsToDisplayForAdmin = ['name', 'tossPredicted', 'teamPredicted', 
    'firstInnScorePredicted', 'mostRunsScorerPredicted', 
    'mostWicketsTakerPredicted', 'momPredicted', 'points'];
  columnsToDisplayForUser = ['matchId', 'match', 'tossPredicted', 'teamPredicted', 
    'firstInnScorePredicted', 'mostRunsScorerPredicted', 
    'mostWicketsTakerPredicted', 'momPredicted', 'points'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private customDatePipe: CustomDatePipe,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: CommonService,
    private adminService: AdminService,
    private router: Router,
    private dialogRef: MatDialogRef<PredictionsDialogComponent>,
  ) {
    this.matchDetails = data.match;
    this.source = data.source;
    this.dataSource = new MatTableDataSource(this.predictions);
    if (this.source === 'admin') {
      this.setTeams();
    } else {
      this.validateUser();
    }
    this.getPlayers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  validateUser() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      console.error('Unauthorized access - redirecting to login');
      alert('Login session expired. Please login again.');
      this.dialogRef.close();
      sessionStorage.removeItem('userId');
      this.router.navigate(['/login']);
      return;
    }
  }

  getResultsIfAvailable(matchId: string) {
    this.adminService.getMatchResult(matchId).subscribe(data => {
      if (data.matchResult !== null) {
        this.matchResult = {
          ...data.matchResult,
          mostRunsScorer: this.getPlayerById(data.matchResult.mostRunsScorer),
          mostWicketsTaker: this.getPlayerById(data.matchResult.mostWicketsTaker),
          playerOfTheMatch: this.getPlayerById(data.matchResult.playerOfTheMatch),
        }
      }
    });
  }

  getMatchResult(prediction: Prediction) {
    this.adminService.getMatchResult(prediction.matchId).subscribe(data => {
      if (data.matchResult !== null) {
        prediction.matchResult = {
          ...data.matchResult,
          mostRunsScorer: this.getPlayerById(data.matchResult.mostRunsScorer),
          mostWicketsTaker: this.getPlayerById(data.matchResult.mostWicketsTaker),
          playerOfTheMatch: this.getPlayerById(data.matchResult.playerOfTheMatch),
        }
      }
    });
  }

  fetchPredictionsForAdmin(): void {
    this.adminService.getPredictionsByMatch(this.matchDetails.matchNo).subscribe({
      next: (data: any) => {
        this.predictions = data.predictions.map((prediction: Prediction) => {
          return {
            ...prediction,
            userName: prediction.user.name,
            location: prediction.user.location,
            mostRunsScorerPredicted: this.getPlayerById(prediction.mostRunsScorerPredicted),
            mostWicketsTakerPredicted: this.getPlayerById(prediction.mostWicketsTakerPredicted),
            momPredicted: this.getPlayerById(prediction.momPredicted),
          };
        })
        this.dataSource = new MatTableDataSource(this.predictions);
        this.dataSource.paginator = this.paginator;
      },
      error: (error) => {
        console.error('Error fetching matches:', error);
      },
    });
  }

  fetchPredictionsForUser(): void {
    this.service.getPredictionsByUserId().subscribe({
      next: (data: any) => {
        this.predictions = data.predictions.map((prediction: Prediction) => {
          return {
            ...prediction,
            mostRunsScorerPredicted: this.getPlayerById(prediction.mostRunsScorerPredicted),
            mostWicketsTakerPredicted: this.getPlayerById(prediction.mostWicketsTakerPredicted),
            momPredicted: this.getPlayerById(prediction.momPredicted),
          };
        })
        this.dataSource = new MatTableDataSource(this.predictions);
        this.dataSource.paginator = this.paginator;
      },
      error: (error) => {
        console.error('Error fetching predictions:', error);
      },
    });
  }

  getPlayers(): void {
    const teamNames = this.source === 'admin' ? this.teams.map(team => team.name) : [];
    this.service.getPlayersByTeam(teamNames).subscribe({
      next: (data: Player[]) => {
        this.players = data.map((player: Player) => {
          return {
            ...player,
            displayValue: player.playerName + ' - ' + player.category + ' - ' + player.team + ''
          }
        });
        if (this.source === 'admin') {
          this.fetchPredictionsForAdmin();
          this.getResultsIfAvailable(this.matchDetails.matchNo);
        } else {
          this.fetchPredictionsForUser();
        }
      }
    });
  }

  getPlayerById(playerId: string): string {
    const playerName = this.players?.find((player:Player) => player.playerNo === playerId)?.playerName;
    return playerName != undefined ? playerName : '';
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
