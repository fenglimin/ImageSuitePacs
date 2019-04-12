import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectStudydateDialogComponent } from './select-studydate-dialog.component';

describe('SelectStudydateDialogComponent', () => {
  let component: SelectStudydateDialogComponent;
  let fixture: ComponentFixture<SelectStudydateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectStudydateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectStudydateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
