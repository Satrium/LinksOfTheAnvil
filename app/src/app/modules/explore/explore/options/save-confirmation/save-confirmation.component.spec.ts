import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveConfirmationComponent } from './save-confirmation.component';

describe('SaveConfirmationComponent', () => {
  let component: SaveConfirmationComponent;
  let fixture: ComponentFixture<SaveConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
