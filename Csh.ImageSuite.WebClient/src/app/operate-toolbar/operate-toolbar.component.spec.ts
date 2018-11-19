import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperateToolbarComponent } from './operate-toolbar.component';

describe('OperateToolbarComponent', () => {
  let component: OperateToolbarComponent;
  let fixture: ComponentFixture<OperateToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperateToolbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperateToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
