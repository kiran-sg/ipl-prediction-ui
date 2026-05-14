import { Component, inject, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonService } from '../common.service';
import { CustomDatePipe } from '../custom-date.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatchResultDialogComponent } from '../match-result-dialog/match-result-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { isMatchOpenForUpdateResult } from '../utils/common-utils';
import { PredictionsDialogComponent } from '../predictions-dialog/predictions-dialog.component';
import { Overlay } from '@angular/cdk/overlay';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TeamService } from '../team.service';
import { AdminService } from '../admin.service';
import { Player } from '../models/player.model';
import { Team } from '../models/team.model';
import { TournamentPredictionsListDialogComponent } from '../shared/tournament-predictions-list-dialog/tournament-predictions-list-dialog.component';

export interface MatchData {
  matchNo: string;
  match: string;
  home: string;
  away: string;
  dateTime: string;
  disableUpdate: boolean;
}

interface SeasonField {
  key: string;
  label: string;
  type: 'player' | 'team';
  value: any;
  filteredOptions: any[];
  searchText: string;
}

@Component({
  selector: 'app-admin',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatTabsModule,
    MatAutocompleteModule,
    FormsModule,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {

  matches: MatchData[] = [];
  dataSource: MatTableDataSource<MatchData>;
  readonly dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);

  columnsToDisplay = ['match', 'dateTime', 'action'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement!: MatchData | null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  players: Player[] = [];
  teams: Team[] = [];

  seasonFields: SeasonField[] = [
    { key: 'playerOfTournamentWinnerId', label: 'Player of the Tournament', type: 'player', value: null, filteredOptions: [], searchText: '' },
    { key: 'fairPlayTeamWinnerId', label: 'Fair Play Award', type: 'team', value: null, filteredOptions: [], searchText: '' },
    { key: 'emergingPlayerWinnerId', label: 'Emerging Player', type: 'player', value: null, filteredOptions: [], searchText: '' },
    { key: 'orangeCapWinnerId', label: 'Orange Cap', type: 'player', value: null, filteredOptions: [], searchText: '' },
    { key: 'mostFoursWinnerId', label: 'Most Fours', type: 'player', value: null, filteredOptions: [], searchText: '' },
    { key: 'mostSixesWinnerId', label: 'Most Sixes', type: 'player', value: null, filteredOptions: [], searchText: '' },
    { key: 'purpleCapWinnerId', label: 'Purple Cap', type: 'player', value: null, filteredOptions: [], searchText: '' },
    { key: 'mostDotBallsWinnerId', label: 'Most Dot Balls', type: 'player', value: null, filteredOptions: [], searchText: '' },
    { key: 'bestBowlingFigWinnerId', label: 'Best Bowling Figure', type: 'player', value: null, filteredOptions: [], searchText: '' },
  ];

  canUpdateSeasonResult = new Date() >= new Date('2026-06-01T00:00:00+05:30');

  constructor(
    private service: CommonService,
    private adminService: AdminService,
    private customDatePipe: CustomDatePipe,
    private overlay: Overlay,
    private teamService: TeamService
  ) {
    this.dataSource = new MatTableDataSource(this.matches);
    this.teamService.loadTeams().subscribe(() => {
      this.fetchMatches();
      this.teams = this.teamService.getTeamsForSelector();
      this.loadPlayers();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadPlayers(): void {
    this.service.getPlayersByTeam([]).subscribe({
      next: (data: Player[]) => {
        this.players = data;
        this.loadSavedResults();
      }
    });
  }

  loadSavedResults(): void {
    this.adminService.getTournamentResult().subscribe({
      next: (data: any) => {
        if (!data) return;
        for (const field of this.seasonFields) {
          const id = data[field.key];
          if (id == null) continue;
          if (field.type === 'player') {
            field.value = this.players.find(p => p.id === id) || null;
          } else {
            field.value = this.teams.find(t => t.id === id) || null;
          }
        }
      }
    });
  }

  onSearchInput(field: SeasonField, event: Event): void {
    field.searchText = (event.target as HTMLInputElement).value;
    this.filterOptions(field);
  }

  filterOptions(field: SeasonField): void {
    const search = (field.searchText || '').toLowerCase();
    if (field.type === 'player') {
      field.filteredOptions = this.players.filter(p =>
        p.playerName.toLowerCase().includes(search) || p.team.toLowerCase().includes(search)
      ).slice(0, 20);
    } else {
      field.filteredOptions = this.teams.filter(t =>
        t.name.toLowerCase().includes(search) || t.shortName.toLowerCase().includes(search)
      );
    }
  }

  displayPlayer = (player: Player): string => player?.playerName ? `${player.playerName} (${player.team})` : '';
  displayTeam = (team: Team): string => team?.name || '';

  onOptionSelected(field: SeasonField, value: any): void {
    field.value = value;
  }

  submitSeasonResult(): void {
    const body: any = {};
    for (const field of this.seasonFields) {
      body[field.key] = field.value?.id ?? null;
    }
    this.adminService.saveTournamentResult(body).subscribe({
      next: (data: any) => {
        this._snackBar.open(data.message || 'Tournament Results Saved!', 'Close');
      },
      error: () => {
        this._snackBar.open('Failed to update season results', 'Close');
      }
    });
  }

  viewTournamentPredictions(): void {
    this.dialog.open(TournamentPredictionsListDialogComponent, {
      width: '95vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: { players: this.players, teams: this.teams },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  fetchMatches(): void {
    this.service.getMatches().subscribe({
      next: (data: any[]) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        this.matches = data
          .filter((match: any) => {
            const matchDate = new Date(match.dateTime);
            const matchDateOnly = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
            return this.isSuperAdmin() || matchDateOnly >= yesterday;
          })
          .map((match: any) => {
            return {
              ...match,
              match: match.home + ' VS ' + match.away + ' (Match ' + match.matchNo + ')',
              matchShort: this.teamService.getShortName(match.home) + ' VS ' + this.teamService.getShortName(match.away) + ' (M' + match.matchNo + ')',
              disableUpdate: !isMatchOpenForUpdateResult(match.dateTime),
              dateTime: this.customDatePipe.transform(match.dateTime)
            };
          });
        this.sortMatches(this.matches);
        this.dataSource = new MatTableDataSource(this.matches);
        this.dataSource.paginator = this.paginator;
      },
      error: (error) => {
        console.error('Error fetching matches:', error);
      },
    });
  }

  isSuperAdmin(): boolean {
    return true;
  }

  openMatchResultDialog(match: MatchData): void {
    const dialogRef = this.dialog.open(MatchResultDialogComponent, {
      width: '80vw',
      maxWidth: '900px',
      height: '85vh',
      disableClose: true,
      data: { match }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed', result);
    });
  }

  openPredictionsDialog(match: MatchData): void {
    const isMobile = window.innerWidth <= 600;
    const dialogRef = this.dialog.open(PredictionsDialogComponent, {
      height: 'auto',
      width: isMobile ? '95vw' : 'auto',
      maxWidth: isMobile ? '95vw' : '80vw',
      maxHeight: '90vh',
      autoFocus: false,
      disableClose: true,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      data: { match, source: 'admin' }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed', result);
    });
  }

  isExpanded(element: MatchData) {
    return this.expandedElement === element;
  }

  toggle(element: MatchData) {
    this.expandedElement = this.isExpanded(element) ? null : element;
  }

  isToday(dateStr: string): boolean {
    const matchDate = this.parseISTDate(dateStr);
    const today = new Date();
    return matchDate.toDateString() === today.toDateString();
  }

  isYesterday(dateStr: string): boolean {
    const matchDate = this.parseISTDate(dateStr);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return matchDate.toDateString() === yesterday.toDateString();
  }

  private parseISTDate(dateStr: string): Date {
    const cleaned = dateStr.replace(' IST', '');
    return new Date(cleaned + ' GMT+0530');
  }

  private sortMatches(matches: MatchData[]): any[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    return matches.sort((a, b) => {
      const aDate = this.parseISTDate(a.dateTime);
      const bDate = this.parseISTDate(b.dateTime);

      const aDay = new Date(aDate.getFullYear(), aDate.getMonth(), aDate.getDate());
      const bDay = new Date(bDate.getFullYear(), bDate.getMonth(), bDate.getDate());

      const getGroup = (day: Date): number => {
        if (day.getTime() === today.getTime()) return 1;
        if (day.getTime() === yesterday.getTime()) return 2;
        return 3;
      };

      const aGroup = getGroup(aDay);
      const bGroup = getGroup(bDay);

      if (aGroup !== bGroup) {
        return aGroup - bGroup;
      }

      if (aGroup === 1) {
        const aIsPast = now > aDate;
        const bIsPast = now > bDate;

        if (aIsPast && bIsPast) {
          return bDate.getTime() - aDate.getTime();
        } else if (!aIsPast && !bIsPast) {
          return aDate.getTime() - bDate.getTime();
        } else {
          return aIsPast ? -1 : 1;
        }
      }

      if (aGroup === 2) {
        return bDate.getTime() - aDate.getTime();
      }

      return aDate.getTime() - bDate.getTime();
    });
  }

}
