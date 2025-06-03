import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { CommonService } from '../common.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';

export interface LeaderBoard {
  position: number;
  userId: string;
  location: string;
  totalPoints: number;
}

@Component({
  selector: 'app-leader-board',
  imports: [
    MatTableModule,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
  ],
  templateUrl: './leader-board.component.html',
  styleUrl: './leader-board.component.scss'
})
export class LeaderBoardComponent {

  locations: Array<{ loc: string; leaderBoard: LeaderBoard[] }> = [
    { loc: 'TVM', leaderBoard: [] },
    { loc: 'PUNE', leaderBoard: [] }
  ];
  displayedColumns: string[] = ['position', 'userName', 'points'];
  dataSource: LeaderBoard[] = [];

  constructor(private service: CommonService) { 
    this.locations.forEach((item: any) => {
      this.service.getLeaderBoard(item.loc).subscribe((data) => {
        item.leaderBoard = data;
      });
    });
  }

}
