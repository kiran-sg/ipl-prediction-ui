import { Component, Inject, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
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
import { TeamService } from '../team.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';

@Component({
  selector: 'app-predictions-dialog',
  imports: [
    CommonModule,
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
    MatTooltipModule,
    MatFormFieldModule,
  ],
  templateUrl: './predictions-dialog.component.html',
  styleUrl: './predictions-dialog.component.scss'
})
export class PredictionsDialogComponent {

  source!: string;
  matchDetails!: Match;
  homeShort = '';
  awayShort = '';
  predictions: Prediction[] = [];
  teams!: Team[];
  players: Player[] = [];
  matchResult!: MatchResult;
  dataSource: MatTableDataSource<Prediction>;
  readonly dialog = inject(MatDialog);
  readonly panelOpenState = signal(false);
  hasSurgeUsers = false;

  columnsToDisplayForAdmin = ['name', 'tossPredicted', 'teamPredicted',
    'firstInnScorePredicted', 'mostRunsScorerPredicted',
    'mostWicketsTakerPredicted', 'momPredicted', 'points'];
  columnsToDisplayForUser = ['matchDate', 'match', 'tossPredicted', 'teamPredicted',
    'firstInnScorePredicted', 'mostRunsScorerPredicted',
    'mostWicketsTakerPredicted', 'momPredicted', 'points'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pagedData: any[] = [];

  adminCardFields = [
    { key: 'tossPredicted', label: 'Toss Winner' },
    { key: 'teamPredicted', label: 'Match Winner' },
    { key: 'firstInnScorePredicted', label: '1st Inn Score' },
    { key: 'mostRunsScorerPredicted', label: 'Best Batter' },
    { key: 'mostWicketsTakerPredicted', label: 'Best Bowler' },
    { key: 'momPredicted', label: 'Player of Match' },
  ];

  adminResultKeys: { [key: string]: string } = {
    tossPredicted: 'tossWon',
    teamPredicted: 'teamWon',
    firstInnScorePredicted: 'firstInnScore',
    mostRunsScorerPredicted: 'mostRunsScorer',
    mostWicketsTakerPredicted: 'mostWicketsTaker',
    momPredicted: 'playerOfTheMatch',
  };

  userCardFields = [
    { key: 'tossPredicted', label: 'Toss Winner' },
    { key: 'teamPredicted', label: 'Match Winner' },
    { key: 'firstInnScorePredicted', label: '1st Inn Score' },
    { key: 'mostRunsScorerPredicted', label: 'Best Batter' },
    { key: 'mostWicketsTakerPredicted', label: 'Best Bowler' },
    { key: 'momPredicted', label: 'Player of Match' },
  ];

  constructor(
    private customDatePipe: CustomDatePipe,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: CommonService,
    private adminService: AdminService,
    private router: Router,
    private dialogRef: MatDialogRef<PredictionsDialogComponent>,
    private teamService: TeamService,
  ) {
    this.matchDetails = data.match;
    this.source = data.source;
    if (this.matchDetails) {
      this.homeShort = this.teamService.getShortName(this.matchDetails.home);
      this.awayShort = this.teamService.getShortName(this.matchDetails.away);
    }
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
    this.paginator.page.subscribe(() => this.updatePagedData());
  }

  validateUser() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('Unauthorized access - redirecting to login');
      alert('Login session expired. Please login again.');
      this.dialogRef.close();
      localStorage.removeItem('userId');
      this.router.navigate(['/login']);
      return;
    }
  }

  getResultsIfAvailable(matchId: string) {
    this.adminService.getMatchResult(matchId).subscribe(data => {
      if (data.matchResult !== null) {
        this.matchResult = {
          ...data.matchResult,
          tossWon: this.displayValue(data.matchResult.tossWon),
          teamWon: this.displayValue(data.matchResult.teamWon),
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
          tossWon: this.displayValue(data.matchResult.tossWon),
          teamWon: this.displayValue(data.matchResult.teamWon),
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
            tossPredicted: this.displayValue(prediction.tossPredicted),
            teamPredicted: this.displayValue(prediction.teamPredicted),
            firstInnScorePredicted: this.displayValue(prediction.firstInnScorePredicted),
            mostRunsScorerPredicted: this.getPlayerById(prediction.mostRunsScorerPredicted),
            mostWicketsTakerPredicted: this.getPlayerById(prediction.mostWicketsTakerPredicted),
            momPredicted: this.getPlayerById(prediction.momPredicted),
          };
        })
        this.dataSource.data = this.predictions;
        this.hasSurgeUsers = this.predictions.some((p: Prediction) => p.surgeUsed);
        setTimeout(() => this.updatePagedData());
      },
    });
  }

  fetchPredictionsForUser(): void {
    this.service.getPredictionsByUserId().subscribe({
      next: (data: any) => {
        this.predictions = data.predictions.map((prediction: Prediction) => {
          const hasResult = prediction.tossWon || prediction.teamWon;
          return {
            ...prediction,
            matchShort: this.getMatchShort(prediction.match),
            tossPredicted: this.displayValue(prediction.tossPredicted),
            teamPredicted: this.displayValue(prediction.teamPredicted),
            firstInnScorePredicted: this.displayValue(prediction.firstInnScorePredicted),
            mostRunsScorerPredicted: this.getPlayerById(prediction.mostRunsScorerPredicted),
            mostWicketsTakerPredicted: this.getPlayerById(prediction.mostWicketsTakerPredicted),
            momPredicted: this.getPlayerById(prediction.momPredicted),
            matchResult: hasResult ? {
              tossWon: this.displayValue(prediction.tossWon),
              teamWon: this.displayValue(prediction.teamWon),
              firstInnScore: prediction.firstInnScore,
              mostRunsScorer: this.getPlayerById(prediction.mostRunsScorer),
              mostWicketsTaker: this.getPlayerById(prediction.mostWicketsTaker),
              playerOfTheMatch: this.getPlayerById(prediction.mom),
            } : null,
          };
        }).sort((a: any, b: any) => {
          const dateA = new Date(a.matchDate || 0).getTime();
          const dateB = new Date(b.matchDate || 0).getTime();
          return dateB - dateA;
        });
        this.dataSource.data = this.predictions;
        this.hasSurgeUsers = this.predictions.some((p: Prediction) => p.surgeUsed);
        setTimeout(() => this.updatePagedData());
      },
      error: (error) => {
        console.error('Error fetching predictions:', error);
      },
    });
  }

  getPlayers(): void {
    const teamNames = this.source === 'admin' ? this.teams.map(team => team.shortName) : [];
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

  private displayValue(value: string): string {
    return value === 'no_result' ? 'No Result' : value;
  }

  private getMatchShort(match: string): string {
    if (!match) return '';
    return match.replace(/([A-Za-z ]+) VS ([A-Za-z ]+)/i, (_, home, away) => {
      return this.teamService.getShortName(home.trim()) + ' VS ' + this.teamService.getShortName(away.trim());
    });
  }

  getResult(row: any): any {
    return this.matchResult || row.matchResult;
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
    ]
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.updatePagedData();
  }

  onPageChange(): void {
    this.updatePagedData();
  }

  updatePagedData(): void {
    const filtered = this.dataSource.filteredData;
    const start = this.paginator ? this.paginator.pageIndex * this.paginator.pageSize : 0;
    const size = this.paginator ? this.paginator.pageSize : 10;
    this.pagedData = filtered.slice(start, start + size);
  }

  getCardResultValue(row: any, fieldKey: string): string | null {
    const result = this.getResult(row);
    if (!result) return null;
    const resultKey = this.adminResultKeys[fieldKey];
    return resultKey ? result[resultKey] : null;
  }

  isCardCorrect(row: any, fieldKey: string): boolean {
    const resultVal = this.getCardResultValue(row, fieldKey);
    return resultVal != null && row[fieldKey] && row[fieldKey] === resultVal;
  }

  isCardIncorrect(row: any, fieldKey: string): boolean {
    const resultVal = this.getCardResultValue(row, fieldKey);
    return resultVal != null && row[fieldKey] && row[fieldKey] !== resultVal;
  }

}
