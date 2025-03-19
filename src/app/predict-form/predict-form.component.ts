import { Component, Input, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Match } from '../models/match.model';
import { Team } from '../models/team.model';
import { TeamName } from '../enums/team';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '../common.service';
import { Player } from '../models/player.model';

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
  players: Player[] = [];
  predictForm: FormGroup;

  @Input() matchDetails!: Match;

  constructor(private fb: FormBuilder, private service: CommonService) {
    this.predictForm = this.fb.group({
      userId: ['', [Validators.required]],
      matchId: ['', Validators.required],
      tossPredicted: ['', Validators.required],
      teamPredicted: ['', Validators.required],
      momPredicted: ['', Validators.required],
      mostRunsScorerPredicted: ['', Validators.required],
      mostWicketsTakerPredicted: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.setTeams();
    this.teams.forEach((team: Team) => {
      this.setPlayers(team.shortName); 
    });
  }

  setTeams(): void {
    this.teams = [
      {
        id: 1,
        name: this.matchDetails?.home,
        logo: this.matchDetails?.homeLogo,
        shortName: this.matchDetails.homeShortName
      },
      {
        id: 2,
        name: this.matchDetails?.away,
        logo: this.matchDetails?.awayLogo,
        shortName: this.matchDetails.awayShortName
      }
    ]
  }

  setPlayers(team: string): void {
    this.service.getPlayersByTeam(team).subscribe({
      next: (data: Player[]) => {
        this.players.push(...data);
        console.log('Players:', this.players);
      }
    });
  }

}
