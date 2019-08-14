import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DicomHeaderDialogComponent } from './dicom-header-dialog.component';

describe('DicomHeaderDialogComponent', () => {
  let component: DicomHeaderDialogComponent;
  let fixture: ComponentFixture<DicomHeaderDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DicomHeaderDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DicomHeaderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
