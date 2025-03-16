import { Component, Input, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Match } from '../models/match.model';
import { Team } from '../models/team.model';
import { TeamName } from '../enums/team';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-predict-form',
  imports: [
    CommonModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './predict-form.component.html',
  styleUrl: './predict-form.component.scss'
})
export class PredictFormComponent implements OnInit {
  teams!: Team[];
  @Input() matchDetails!: Match;

  constructor() {}

  ngOnInit(): void {
    this.setTeams();
  }

  setTeams(): void {
    this.teams = [
      {
        id: 1,
        name: TeamName[this.matchDetails?.team1 as keyof typeof TeamName],
        logo: this.matchDetails?.team1Logo,
        shortName: this.matchDetails?.team1
      },
      {
        id: 2,
        name: TeamName[this.matchDetails?.team2 as keyof typeof TeamName],
        logo: this.matchDetails?.team2Logo,
        shortName: this.matchDetails?.team2
      }
    ]
  }

}
