import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictDialogComponent } from './predict-dialog.component';

describe('PredictDialogComponent', () => {
  let component: PredictDialogComponent;
  let fixture: ComponentFixture<PredictDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PredictDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PredictDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
