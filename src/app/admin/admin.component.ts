import { Component, inject, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonService } from '../common.service';
import { CustomDatePipe } from '../custom-date.pipe';
import { MatButtonModule } from '@angular/material/button';
import { Match } from '../models/match.model';
import { MatDialog } from '@angular/material/dialog';
import { PredictDialogComponent } from '../predict-dialog/predict-dialog.component';
import { MatchResultDialogComponent } from '../match-result-dialog/match-result-dialog.component';
import { PredictedMatch } from '../models/predicted-match.model';
import { MatIconModule } from '@angular/material/icon';
import { isMatchOpenForUpdateResult } from '../utils/common-utils';

export interface MatchData {
  matchNo: string;
  match: string;
  home: string;
  away: string;
  dateTime: string;
  disableUpdate: boolean;
}

@Component({
  selector: 'app-admin',
  imports: [
    MatFormFieldModule,
    MatInputModule, 
    MatTableModule, 
    MatSortModule, 
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    CustomDatePipe
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {

  matches: MatchData[] = [];
  dataSource: MatTableDataSource<MatchData>;
  readonly dialog = inject(MatDialog);

  columnsToDisplay = ['matchNo', 'match', 'dateTime', 'action'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement!: MatchData | null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private service: CommonService, private customDatePipe: CustomDatePipe) {
    this.dataSource = new MatTableDataSource(this.matches);
    this.fetchMatches();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
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
        this.matches = data.map((match: any) => {
          return {
            ...match,
            match: match.home + ' VS ' + match.away,
            disableUpdate: !isMatchOpenForUpdateResult(match.dateTime),
            dateTime: this.customDatePipe.transform(match.dateTime)
          };
        })
        this.dataSource = new MatTableDataSource(this.matches);
        this.dataSource.paginator = this.paginator;
      },
      error: (error) => {
        console.error('Error fetching matches:', error);
      },
    });
  }

  openMatchResultDialog(match: MatchData): void {
    const dialogRef = this.dialog.open(MatchResultDialogComponent, {
      width: '500px', // Initial width
      height: 'auto', // Initial height
      data: { match }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed', result);
    });
  }

  /** Checks whether an element is expanded. */
  isExpanded(element: MatchData) {
    return this.expandedElement === element;
  }

  /** Toggles the expanded state of an element. */
  toggle(element: MatchData) {
    this.expandedElement = this.isExpanded(element) ? null : element;
  }

}
