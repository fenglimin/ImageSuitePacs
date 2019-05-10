import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectMarkerDialogComponent } from './select-marker-dialog.component';

describe('SelectMarkerDialogComponent', () => {
  let component: SelectMarkerDialogComponent;
  let fixture: ComponentFixture<SelectMarkerDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectMarkerDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectMarkerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
