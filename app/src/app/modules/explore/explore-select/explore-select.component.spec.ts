import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreSelectComponent } from './explore-select.component';

describe('ExploreSelectComponent', () => {
  let component: ExploreSelectComponent;
  let fixture: ComponentFixture<ExploreSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
