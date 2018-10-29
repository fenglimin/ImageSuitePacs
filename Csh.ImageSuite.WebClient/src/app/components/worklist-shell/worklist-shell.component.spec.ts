import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorklistShellComponent } from './worklist-shell.component';

describe('WorklistShellComponent', () => {
  let component: WorklistShellComponent;
  let fixture: ComponentFixture<WorklistShellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorklistShellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorklistShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
