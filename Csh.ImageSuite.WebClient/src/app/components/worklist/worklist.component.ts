import { Component, OnInit, OnChanges, SimpleChange, Input } from '@angular/core';
import { Shortcut } from '../../models/shortcut';


@Component({
  selector: 'app-worklist',
  templateUrl: './worklist.component.html',
  styleUrls: ['./worklist.component.css']
})
export class WorklistComponent implements OnInit {
  @Input() shortcut: Shortcut;

  worklistColumns: string[] = [
    "Patient ID",
    "Patient Name"
  ];

  studyInfoList: string[][] = [
    ["PID001", "Tom"],
    ["PID002", "Jerry"]
  ];

  private _test = null;
  @Input()
  set test(test: Shortcut) {
    this._test = test;
  }
  get test(): Shortcut {
    return this._test;
  }

  test1() {
      alert('test');
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    //alert('aa');
  }

  constructor() { }

  ngOnInit() {
  }

  doShowStudy() {
    alert('study clicked');
  }
}
