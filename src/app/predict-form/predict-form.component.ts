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
        name: this.matchDetails?.home,
        logo: this.matchDetails?.homeLogo,
        shortName: this.matchDetails?.home
      },
      {
        id: 2,
        name: this.matchDetails?.away,
        logo: this.matchDetails?.awayLogo,
        shortName: this.matchDetails?.away
      }
    ]
  }

}
