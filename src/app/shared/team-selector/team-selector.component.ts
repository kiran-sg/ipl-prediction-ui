import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Team } from '../../models/team.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-team-selector',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './team-selector.component.html',
  styleUrl: './team-selector.component.scss'
})
export class TeamSelectorComponent {
  @Input() teams: Team[] = [];
  @Input() label = '';
  @Input() selected = '';
  @Input() showNoResult = false;
  @Input() points = '';
  @Output() selectionChange = new EventEmitter<string>();

  select(value: string): void {
    this.selected = value;
    this.selectionChange.emit(value);
  }
}
