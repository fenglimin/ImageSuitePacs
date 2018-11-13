import { Component, OnInit, OnChanges, SimpleChange, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

  formatStudies(studies) {
    for (let i = 0; i < studies.length; i++) {
      studies[i].checked = false;
      studies[i].detailsLoaded = false;
      for (let j = 0; j < studies[i].seriesList.length; j++) {
        studies[i].seriesList[j].study = studies[i];
      }    
    }

    this.studies = studies;
  }

  ngOnInit() {
    this.databaseService.getStudies().subscribe(studies => this.formatStudies(studies));
    //this.studies = this.databaseService.getStudiesTest();
  }

  onStudyChecked(study: Study) {
  }

  onAllStudyChecked(event) {
    this.studies.forEach(study => study.checked = event.target.checked);
  }

  doShowStudy(study: Study) {
    study.checked = true;
    this.studies.forEach(study1 => {
      if (study1.checked) {
        this.databaseService.getStudy(study1.id).subscribe(value => this.studyDetailsLoaded(this.studies.indexOf(study1), value));
      }
    });
  }

  studyDetailsLoaded(index: number, studyNew: Study) {

    studyNew.checked = true;
    studyNew.detailsLoaded = true;
    this.studies[index] = studyNew;

    if (this.studies.every(study => study.checked === study.detailsLoaded)) {
      const viewerShellData = new ViewerShellData();
      this.studies.forEach(value => {
        if (value.checked && value.detailsLoaded) {
          viewerShellData.addStudy(value);
        }
      });
      this.shellNavigatorService.shellNavigate(viewerShellData);

      this.studies.forEach(value => value.detailsLoaded = false);
    }
  }
}
