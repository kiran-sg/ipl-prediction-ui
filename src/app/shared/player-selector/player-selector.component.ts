import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Player } from '../../models/player.model';

@Component({
  selector: 'app-player-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatChipsModule],
  templateUrl: './player-selector.component.html',
  styleUrl: './player-selector.component.scss'
})
export class PlayerSelectorComponent implements OnChanges {
  @Input() players: Player[] = [];
  @Input() label = '';
  @Input() selected = '';
  @Input() points = '';
  @Input() defaultCategories: string[] = [];
  @Input() requireTeamFilter = false;
  @Output() selectionChange = new EventEmitter<string>();

  searchText = '';
  filteredPlayers: Player[] = [];
  allCategories: string[] = [];
  selectedCategories: string[] = [];
  allTeams: string[] = [];
  selectedTeam = '';

  ngOnChanges(): void {
    this.allCategories = [...new Set(this.players.map(p => p.category))].sort();
    this.allTeams = [...new Set(this.players.map(p => p.team))].sort();
    if (this.selectedCategories.length === 0 && this.defaultCategories.length > 0) {
      this.selectedCategories = [...this.defaultCategories];
    }
    if (this.requireTeamFilter && !this.selectedTeam && this.selected) {
      const player = this.players.find(p => p.playerNo === this.selected);
      if (player) {
        this.selectedTeam = player.team;
      }
    }
    this.filter();
  }

  toggleTeam(team: string): void {
    this.selectedTeam = this.selectedTeam === team ? '' : team;
    this.filter();
  }

  toggleCategory(cat: string): void {
    const idx = this.selectedCategories.indexOf(cat);
    if (idx >= 0) {
      this.selectedCategories.splice(idx, 1);
    } else {
      this.selectedCategories.push(cat);
    }
    this.filter();
  }

  clearFilters(): void {
    this.selectedCategories = [];
    this.selectedTeam = '';
    this.filter();
  }

  filter(): void {
    let result = this.players;
    if (this.selectedTeam) {
      result = result.filter(p => p.team === this.selectedTeam);
    }
    if (this.selectedCategories.length > 0) {
      result = result.filter(p => this.selectedCategories.includes(p.category));
    }
    const search = this.searchText.toLowerCase();
    if (search) {
      result = result.filter(p => p.playerName.toLowerCase().includes(search) || p.team.toLowerCase().includes(search));
    }
    this.filteredPlayers = result.sort((a, b) =>
      (b.playerNo === this.selected ? 1 : 0) - (a.playerNo === this.selected ? 1 : 0)
    );
  }

  select(playerNo: string): void {
    this.selected = playerNo;
    this.selectionChange.emit(playerNo);
  }

  getSelectedPlayer(): Player | undefined {
    return this.players.find(p => p.playerNo === this.selected);
  }

  isCategorySelected(cat: string): boolean {
    return this.selectedCategories.includes(cat);
  }

  get showGrid(): boolean {
    return !this.requireTeamFilter || !!this.selectedTeam;
  }
}
