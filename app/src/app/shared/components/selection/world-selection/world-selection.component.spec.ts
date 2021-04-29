import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldSelectionComponent } from './world-selection.component';

describe('WorldSelectionComponent', () => {
  let component: WorldSelectionComponent;
  let fixture: ComponentFixture<WorldSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorldSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorldSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
