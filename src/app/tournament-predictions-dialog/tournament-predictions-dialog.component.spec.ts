import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentPredictionsDialogComponent } from './tournament-predictions-dialog.component';

describe('TournamentPredictionsDialogComponent', () => {
  let component: TournamentPredictionsDialogComponent;
  let fixture: ComponentFixture<TournamentPredictionsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentPredictionsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TournamentPredictionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
