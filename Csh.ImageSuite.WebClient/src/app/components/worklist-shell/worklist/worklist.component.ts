import { Component, OnInit, OnChanges, SimpleChange, Input } from '@angular/core';
import { Shortcut } from '../../../models/shortcut';
import { Subscription }   from 'rxjs';
import { Study } from '../../../models/pssi';
import { WorklistService } from '../../../services/worklist.service';

@Component({
  selector: 'app-worklist',
  templateUrl: './worklist.component.html',
  styleUrls: ['./worklist.component.css']
})
export class WorklistComponent implements OnInit {
  
  shortcutSelected: Subscription;

  constructor(public worklistService: WorklistService) {
    this.shortcutSelected = this.worklistService.shortcutSelected$.subscribe(
      shortcut => this.onShortcutSelected(shortcut));

  }

  onShortcutSelected(shortcut: Shortcut) {
    this.worklistService.shortcut = shortcut;
  }

  worklistColumns: string[] = [
    "",
    "Patient ID",
    "Patient Name",
    "Gender",
    "BirthDate",
    "AccessionNo",
    "Modality",
    "StudyDate",
    "StudyTime",
    "SeriesCount",
    "ImageCount",
    "StudyID"
  ];

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    //alert('aa');
  }



  ngOnInit() {
    this.worklistService.onQueryStudies();
  }

  onStudyChecked(study: Study) {
    study.checked = !study.checked;
  }

  onAllStudyChecked(event) {
    this.worklistService.studies.forEach(study => study.checked = event.target.checked);
  }

  doShowStudy(study: Study) {
    study.checked = true;
    this.worklistService.onShowSingleStudy(study);
  }
}
