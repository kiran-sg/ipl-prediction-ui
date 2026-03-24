import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-score-selector',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './score-selector.component.html',
  styleUrl: './score-selector.component.scss'
})
export class ScoreSelectorComponent {
  @Input() options: string[] = [];
  @Input() label = '';
  @Input() selected = '';
  @Output() selectionChange = new EventEmitter<string>();

  select(value: string): void {
    this.selected = value;
    this.selectionChange.emit(value);
  }
}
