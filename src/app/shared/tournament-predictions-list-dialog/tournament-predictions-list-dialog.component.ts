import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AdminService } from '../../admin.service';
import { Player } from '../../models/player.model';
import { Team } from '../../models/team.model';

interface ResultMap { [key: string]: string; }

@Component({
  selector: 'app-tournament-predictions-list-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatTableModule, MatIconModule,
    MatPaginatorModule, MatInputModule, MatFormFieldModule],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon class="title-icon">emoji_events</mat-icon>
      Season Predictions
    </h2>

    <div class="result-card" *ngIf="hasResults">
      <div class="result-header">
        <mat-icon>emoji_events</mat-icon>
        <span>Season Results</span>
      </div>
      <div class="result-grid">
        <div class="result-item" *ngFor="let col of predictionColumns">
          <span class="result-label">{{ col.label }}</span>
          <span class="result-value">{{ results[col.key] || '-' }}</span>
        </div>
      </div>
    </div>

    <mat-dialog-content>
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Search user</mat-label>
        <input matInput (keyup)="applyFilter($event)" placeholder="Type to filter...">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons
        (page)="onPageChange()"></mat-paginator>

      <!-- Desktop: Table -->
      <section class="table-container mat-elevation-z2 desktop-only">
        <div class="table-wrapper">
          <table mat-table [dataSource]="dataSource" class="full-width">
            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef>User</th>
              <td mat-cell *matCellDef="let row">{{ row.userName }}</td>
            </ng-container>
            <ng-container *ngFor="let col of predictionColumns" [matColumnDef]="col.key">
              <th mat-header-cell *matHeaderCellDef>{{ col.label }}</th>
              <td mat-cell *matCellDef="let row"
                [class.correct]="hasResults && row[col.key] && row[col.key] === results[col.key]"
                [class.incorrect]="hasResults && row[col.key] && row[col.key] !== results[col.key]">
                {{ row[col.key] || '-' }}
                <span class="match-icon" *ngIf="hasResults && row[col.key]">
                  {{ row[col.key] === results[col.key] ? '✅' : '❌' }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="points">
              <th mat-header-cell *matHeaderCellDef>Points</th>
              <td mat-cell *matCellDef="let row">
                <span class="points-top" [class.has-points]="row.points > 0" *ngIf="hasResults">{{ row.points }}</span>
                <span class="pending-badge" *ngIf="!hasResults">Pending</span>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
      </section>

      <!-- Mobile: Cards -->
      <div class="mobile-only">
        <div class="prediction-card" *ngFor="let row of pagedData">
          <div class="card-header">
            <span class="card-user">{{ row.userName }}</span>
            <span class="card-points" *ngIf="hasResults" [class.has-points]="row.points > 0">Points: {{ row.points }}</span>
            <span class="card-points pending-badge" *ngIf="!hasResults">Points: Pending</span>
          </div>
          <div class="card-grid">
            <div class="card-field" *ngFor="let col of predictionColumns">
              <span class="card-label">{{ col.label }}</span>
              <span class="card-value"
                [class.correct]="hasResults && row[col.key] && row[col.key] === results[col.key]"
                [class.incorrect]="hasResults && row[col.key] && row[col.key] !== results[col.key]">
                {{ row[col.key] || '-' }}
                <span class="match-icon" *ngIf="hasResults && row[col.key]">
                  {{ row[col.key] === results[col.key] ? '✅' : '❌' }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title { display: flex; align-items: center; gap: 8px; }
    .title-icon { color: #f9a825; }
    .filter-field { width: 100%; }
    .result-card {
      background: linear-gradient(135deg, #e8eaf6, #f5f5f5);
      border: 1px solid #c5cae9; border-radius: 12px;
      padding: 16px; margin: 0 24px 12px;
    }
    .result-header {
      display: flex; align-items: center; gap: 8px;
      font-weight: 700; color: #1a378b; margin-bottom: 12px;
      mat-icon { color: #f9a825; }
    }
    .result-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .result-item { display: flex; flex-direction: column; gap: 2px; }
    .result-label { font-size: 0.7rem; text-transform: uppercase; color: #777; font-weight: 600; }
    .result-value { font-size: 0.9rem; font-weight: 600; color: #333; }
    .full-width { width: 100%; }
    mat-dialog-content { max-height: 65vh; overflow: auto; }
    .table-wrapper { overflow-x: auto; }
    td, th { font-size: 0.8rem; padding: 6px 8px !important; white-space: nowrap; }
    td.correct, .correct { color: #2e7d32; }
    td.incorrect, .incorrect { color: #c62828; }
    .match-icon { font-size: 0.75rem; margin-left: 2px; }
    .points-top {
      display: inline-block; margin-left: 6px; padding: 1px 8px;
      border-radius: 10px; font-size: 0.75rem; font-weight: 700;
      background: #eee; color: #777;
      &.has-points { background: #e8f5e9; color: #2e7d32; }
    }
    .pending-badge { font-size: 0.7rem; color: #e65100; font-weight: 600; margin-left: 6px; }
    .prediction-card {
      background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 10px;
      padding: 12px; margin-bottom: 10px;
    }
    .card-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 8px; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px;
    }
    .card-user { font-weight: 700; font-size: 0.95rem; }
    .card-points {
      font-size: 0.8rem; font-weight: 700; margin-left: auto;
      &.has-points { color: #2e7d32; }
    }
    .card-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
    .card-label { font-size: 0.65rem; text-transform: uppercase; color: #777; font-weight: 600; }
    .card-value { font-size: 0.85rem; font-weight: 500; }
    .card-field { display: flex; flex-direction: column; gap: 1px; }
    .mobile-only { display: none; }
    .desktop-only { display: block; }
    @media (max-width: 768px) {
      .mobile-only { display: block; }
      .desktop-only { display: none; }
      .result-grid { grid-template-columns: repeat(2, 1fr); }
      .result-card { margin: 0 12px 12px; }
    }
  `]
})
export class TournamentPredictionsListDialogComponent implements OnInit {
  predictionColumns = [
    { key: 'playerOfTournament', label: 'MVP' },
    { key: 'fairPlayTeam', label: 'Fair Play' },
    { key: 'emergingPlayer', label: 'Emerging' },
    { key: 'orangeCap', label: 'Orange Cap' },
    { key: 'mostFours', label: 'Most 4s' },
    { key: 'mostSixes', label: 'Most 6s' },
    { key: 'purpleCap', label: 'Purple Cap' },
    { key: 'mostDotBalls', label: 'Dot Balls' },
    { key: 'bestBowlingFig', label: 'Best Bowl' },
  ];
  displayedColumns = ['user', ...this.predictionColumns.map(c => c.key), 'points'];
  dataSource = new MatTableDataSource<any>([]);
  pagedData: any[] = [];
  results: ResultMap = {};
  hasResults = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private adminService: AdminService,
    @Inject(MAT_DIALOG_DATA) public data: { players: Player[]; teams: Team[] },
  ) {}

  ngOnInit(): void {
    this.adminService.getTournamentResult().subscribe({
      next: (data: any) => {
        if (data) {
          this.hasResults = Object.values(data).some(v => v != null);
          this.results = {
            playerOfTournament: this.playerName(data.playerOfTournamentWinnerId),
            fairPlayTeam: this.teamName(data.fairPlayTeamWinnerId),
            emergingPlayer: this.playerName(data.emergingPlayerWinnerId),
            orangeCap: this.playerName(data.orangeCapWinnerId),
            mostFours: this.playerName(data.mostFoursWinnerId),
            mostSixes: this.playerName(data.mostSixesWinnerId),
            purpleCap: this.playerName(data.purpleCapWinnerId),
            mostDotBalls: this.playerName(data.mostDotBallsWinnerId),
            bestBowlingFig: this.playerName(data.bestBowlingFigWinnerId),
          };
        }
      }
    });

    this.adminService.getAllTournamentPredictions().subscribe({
      next: (res: any) => {
        const predictions = res.tournamentPredictions || [];
        const realData = predictions.map((p: any) => ({
          userName: p.user?.name || p.userId,
          points: p.points ?? 0,
          playerOfTournament: this.playerName(p.playerOfTournamentPredictedId),
          fairPlayTeam: this.teamName(p.fairPlayTeamPredictedId),
          emergingPlayer: this.playerName(p.emergingPlayerPredictedId),
          orangeCap: this.playerName(p.orangeCapPredictedId),
          mostFours: this.playerName(p.mostFoursPredictedId),
          mostSixes: this.playerName(p.mostSixesPredictedId),
          purpleCap: this.playerName(p.purpleCapPredictedId),
          mostDotBalls: this.playerName(p.mostDotBallsPredictedId),
          bestBowlingFig: this.playerName(p.bestBowlingFigPredictedId),
        }));
        this.dataSource.data = realData;
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.updatePagedData();
        });
      }
    });
  }

  applyFilter(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.paginator?.firstPage();
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

  private playerName(id: number | null): string {
    if (!id) return '';
    return this.data.players.find(p => p.id === id)?.playerName || '';
  }

  private teamName(id: number | null): string {
    if (!id) return '';
    return this.data.teams.find(t => t.id === id)?.name || '';
  }
}
