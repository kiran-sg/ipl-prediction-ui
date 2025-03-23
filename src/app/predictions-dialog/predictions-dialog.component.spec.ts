import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictionsDialogComponent } from './predictions-dialog.component';

describe('PredictionsDialogComponent', () => {
  let component: PredictionsDialogComponent;
  let fixture: ComponentFixture<PredictionsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PredictionsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PredictionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
