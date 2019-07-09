import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportStudyComponent } from './export-study.component';

describe('ExportStudyComponent', () => {
  let component: ExportStudyComponent;
  let fixture: ComponentFixture<ExportStudyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportStudyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportStudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
