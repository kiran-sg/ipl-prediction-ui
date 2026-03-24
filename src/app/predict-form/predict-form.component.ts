import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Match } from '../models/match.model';
import { Team } from '../models/team.model';
import { CommonService } from '../common.service';
import { Player } from '../models/player.model';
import { isMatchTimeBelowSixtyMins } from '../utils/common-utils';
import { PredictedMatch } from '../models/predicted-match.model';
import { Router } from '@angular/router';
import { TeamService } from '../team.service';
import { TeamSelectorComponent } from '../shared/team-selector/team-selector.component';
import { ScoreSelectorComponent } from '../shared/score-selector/score-selector.component';
import { PlayerSelectorComponent } from '../shared/player-selector/player-selector.component';

@Component({
  selector: 'app-predict-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TeamSelectorComponent,
    ScoreSelectorComponent,
    PlayerSelectorComponent
  ],
  templateUrl: './predict-form.component.html',
  styleUrl: './predict-form.component.scss'
})
export class PredictFormComponent implements OnInit {
  teams!: Team[];
  players: Player[] = [];
  firstInnScoreOptions = [
    '< 100', '100 - 130', '131 - 160', '161 - 180', '181 - 200', '> 200'
  ];
  predictForm!: FormGroup;

  @Input() matchDetails!: Match;
  @Output() formSubmitted = new EventEmitter<PredictedMatch>();

  constructor(
    private fb: FormBuilder,
    private service: CommonService,
    private router: Router,
    private teamService: TeamService,
  ) {}

  ngOnInit(): void {
    this.setPredictForm();
    this.validateUser();
    this.setTeams();
    this.setPlayers();
    this.getPreviousPrediction();
  }

  validateUser() {
    if (!this.predictForm.value.userId) {
      alert('Login session expired. Please login again.');
      this.formSubmitted.emit(undefined);
      localStorage.removeItem('userId');
      this.router.navigate(['/login']);
    }
  }

  getPreviousPrediction() {
    this.service.getPredictionByMatchId(this.matchDetails.matchNo).subscribe((data) => {
      if (data.invalidUser) {
        alert(data.message);
        this.router.navigate(['/login']);
        this.formSubmitted.emit(undefined);
        return;
      }
      if (data.status && data.prediction !== null) {
        this.updateForm(data.prediction);
      }
    });
  }

  onSubmit(): void {
    this.validateUser();
    if (isMatchTimeBelowSixtyMins(this.matchDetails.dateTime)) {
      alert('You can only predict a match 60 minutes before the match starts.');
      return;
    }
    if (this.predictForm.valid) {
      const predictedMatch: PredictedMatch = this.predictForm.value;
      this.formSubmitted.emit(predictedMatch);
    } else if (this.predictForm.value.userId == '') {
      this.router.navigate(['/login']);
    }
  }

  updateForm(prediction: PredictedMatch) {
    this.predictForm.patchValue({
      predictionId: prediction.predictionId,
      tossPredicted: prediction.tossPredicted,
      firstInnScorePredicted: prediction.firstInnScorePredicted,
      teamPredicted: prediction.teamPredicted,
      mostRunsScorerPredicted: prediction.mostRunsScorerPredicted,
      mostWicketsTakerPredicted: prediction.mostWicketsTakerPredicted,
      momPredicted: prediction.momPredicted,
    });
  }

  setPredictForm() {
    this.predictForm = this.fb.group({
      predictionId: [''],
      userId: [localStorage.getItem('userId'), [Validators.required]],
      matchId: [this.matchDetails?.matchNo, Validators.required],
      tossPredicted: ['', Validators.required],
      firstInnScorePredicted: ['', Validators.required],
      teamPredicted: ['', Validators.required],
      mostRunsScorerPredicted: ['', Validators.required],
      mostWicketsTakerPredicted: ['', Validators.required],
      momPredicted: ['', Validators.required],
    });
  }

  setTeams(): void {
    this.teams = [
      {
        id: 1,
        name: this.matchDetails?.home,
        logo: this.teamService.getLogo(this.matchDetails.home),
        shortName: this.teamService.getShortName(this.matchDetails.home)
      },
      {
        id: 2,
        name: this.matchDetails?.away,
        logo: this.teamService.getLogo(this.matchDetails.away),
        shortName: this.teamService.getShortName(this.matchDetails.away)
      }
    ];
  }

  setPlayers(): void {
    const teamNames = this.teams.map(team => team.shortName);
    this.service.getPlayersByTeam(teamNames).subscribe({
      next: (data: Player[]) => {
        this.players = data.map((player: Player) => ({
          ...player,
          displayValue: player.playerName + ' - ' + player.category + ' - ' + player.team
        }));
      }
    });
  }

  onSelect(field: string, value: string): void {
    this.predictForm.get(field)?.setValue(value);
  }
}
