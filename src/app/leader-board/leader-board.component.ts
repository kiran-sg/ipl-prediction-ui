import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonService } from '../common.service';
import { AuthService } from '../auth.service';

export interface LeaderBoard {
  position: number;
  userId: string;
  userName: string;
  location: string;
  totalPoints: number;
}

@Component({
  selector: 'app-leader-board',
  imports: [CommonModule, MatCardModule, MatIconModule, MatTabsModule],
  templateUrl: './leader-board.component.html',
  styleUrl: './leader-board.component.scss'
})
export class LeaderBoardComponent {
  locations = [
    { loc: 'TVM', label: 'Trivandrum', leaderBoard: [] as LeaderBoard[] },
    { loc: 'PUNE', label: 'Pune', leaderBoard: [] as LeaderBoard[] }
  ];
  currentUserId: string | null;

  constructor(private service: CommonService, private authService: AuthService) {
    this.currentUserId = this.authService.userId;
    const userLoc = this.authService.location?.toUpperCase();
    if (userLoc) {
      this.locations.sort((a, b) => (a.loc === userLoc ? -1 : b.loc === userLoc ? 1 : 0));
    }

    this.locations.forEach(item => {
      this.service.getLeaderBoard(item.loc).subscribe((data: LeaderBoard[]) => {
        item.leaderBoard = data;
      });
    });
  }

  getUserRank(board: LeaderBoard[]): LeaderBoard | undefined {
    return board.find(e => e.userId === this.currentUserId);
  }

  getMedal(position: number): string {
    return ['🥇', '🥈', '🥉'][position - 1] || '';
  }

  getTop3(board: LeaderBoard[]): LeaderBoard[] {
    return board.slice(0, 3);
  }

  getRest(board: LeaderBoard[]): LeaderBoard[] {
    return board.slice(3);
  }
}
