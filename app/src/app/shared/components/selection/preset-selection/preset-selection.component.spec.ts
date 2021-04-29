import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PresetSelectionComponent } from './preset-selection.component';

describe('PresetSelectionComponent', () => {
  let component: PresetSelectionComponent;
  let fixture: ComponentFixture<PresetSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PresetSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresetSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
