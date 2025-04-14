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
    CommonModule,
    MatFormFieldModule,
    MatInputModule, 
    MatTableModule, 
    MatSortModule, 
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {

  matches: MatchData[] = [];
  dataSource: MatTableDataSource<MatchData>;
  readonly dialog = inject(MatDialog);

  columnsToDisplay = ['match', 'dateTime', 'action'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement!: MatchData | null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private service: CommonService, 
    private customDatePipe: CustomDatePipe,
    private overlay: Overlay
  ) {
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
            match: match.home + ' VS ' + match.away + ' (Match ' + match.matchNo + ')',
            disableUpdate: !isMatchOpenForUpdateResult(match.dateTime),
            dateTime: this.customDatePipe.transform(match.dateTime)
          };
        })
        this.sortMatches(this.matches);
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

  openPredictionsDialog(match: MatchData): void {
    const dialogRef = this.dialog.open(PredictionsDialogComponent, {
      //width: '50vw', // Initial width
      height: 'auto', // Initial height
      maxWidth: '80vw',
      maxHeight: '700vw',
      autoFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      data: { match, source: 'admin' }
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
    return new Date(cleaned + ' GMT+0530'); // Ensure IST parsing
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
        if (day.getTime() === today.getTime()) return 1;      // Today
        if (day.getTime() === yesterday.getTime()) return 2;  // Yesterday
        return 3;                                              // Others
      };
  
      const aGroup = getGroup(aDay);
      const bGroup = getGroup(bDay);
  
      if (aGroup !== bGroup) {
        return aGroup - bGroup;
      }
  
      // Group 1: Today
      if (aGroup === 1) {
        const aIsPast = now > aDate;
        const bIsPast = now > bDate;
  
        if (aIsPast && bIsPast) {
          return bDate.getTime() - aDate.getTime(); // Both past → latest first
        } else if (!aIsPast && !bIsPast) {
          return aDate.getTime() - bDate.getTime(); // Both upcoming → earliest first
        } else {
          return aIsPast ? -1 : 1; // Past match before upcoming
        }
      }
  
      // Group 2: Yesterday → sort by latest time first
      if (aGroup === 2) {
        return bDate.getTime() - aDate.getTime();
      }
  
      // Group 3: Other dates → sort ascending
      return aDate.getTime() - bDate.getTime();
    });
  }  

}
