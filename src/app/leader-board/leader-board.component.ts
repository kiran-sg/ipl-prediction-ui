import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { CommonService } from '../common.service';

export interface LeaderBoard {
  position: number;
  userId: string;
  location: string;
  totalPoints: number;
}

@Component({
  selector: 'app-leader-board',
  imports: [
    MatTableModule
  ],
  templateUrl: './leader-board.component.html',
  styleUrl: './leader-board.component.scss'
})
export class LeaderBoardComponent {

  displayedColumns: string[] = ['position', 'userId', 'location', 'points'];
  dataSource: LeaderBoard[] = [];

  constructor(private service: CommonService) { 
    this.service.getLeaderBoard().subscribe((data) => {
      this.dataSource = data;
    });
  }

}
