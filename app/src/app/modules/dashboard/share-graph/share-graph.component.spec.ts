import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareGraphComponent } from './share-graph.component';

describe('ShareGraphComponent', () => {
  let component: ShareGraphComponent;
  let fixture: ComponentFixture<ShareGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
