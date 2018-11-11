import { Component, OnInit, OnChanges, SimpleChange, Input } from '@angular/core';
import { Shortcut } from '../../../models/shortcut';
import { ShellNavigatorService } from '../../../services/shell-navigator.service';
import { Subscription }   from 'rxjs';
import { Study } from '../../../models/pssi';
import { DatabaseService } from '../../../services/database.service'
import { ViewerShellData } from '../../../models/viewer-shell-data';

@Component({
  selector: 'app-worklist',
  templateUrl: './worklist.component.html',
  styleUrls: ['./worklist.component.css']
})
export class WorklistComponent implements OnInit {
  @Input() shortcut: Shortcut;
  
  studies: Study[];
  subscriptionShellNavigated: Subscription;

  constructor(private shellNavigatorService: ShellNavigatorService, private databaseService: DatabaseService) {
  }

  worklistColumns: string[] = [
    "",
    "Patient ID",
    "Patient Name",
    "Gender",
    "BirthDateString",
    "AccessionNo",
    "Modality",
    "StudyDate",
    "StudyTime",
    "SeriesCount",
    "ImageCount",
    "StudyID"
  ];

  studyInfoList: string[][] = [
    ["PID001", "Tom"],
    ["PID002", "Jerry"],
    ["PID003", "Mike"],
    ["PID004", "John"]
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

  setStudies(studies) {
    for (let i = 0; i < studies.length; i++) {
      for (let j = 0; j < studies[i].seriesList.length; j++) {
        studies[i].seriesList[j].study = studies[i];
      }    
    }

    this.studies = studies;
  }

  ngOnInit() {
    //this.databaseService.getStudies().subscribe(studies => this.setStudies(studies));
    this.studies = this.databaseService.getStudiesTest();
  }

  doShowStudy(study: Study) {
    const viewerShellData = new ViewerShellData();
    viewerShellData.studies.push(study);
    //viewerShellData.studies.push(this.studies[5]);
    this.shellNavigatorService.shellNavigate(viewerShellData);
  }
}
