import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerBottombarComponent } from './viewer-bottombar.component';

describe('ViewerBottombarComponent', () => {
  let component: ViewerBottombarComponent;
  let fixture: ComponentFixture<ViewerBottombarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewerBottombarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerBottombarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
