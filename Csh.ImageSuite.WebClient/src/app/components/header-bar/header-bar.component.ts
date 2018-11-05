import { Component, OnInit } from '@angular/core';
import { ShellNavigatorService } from '../../services/shell-navigator.service';
import { Subscription }   from 'rxjs';
import { Study } from '../../models/pssi';

@Component({
  selector: 'app-header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.css']
})
export class HeaderBarComponent implements OnInit {

  subscriptionShellNavigated: Subscription;
  hideMe = false;

  openedStudies: Array<Study> = [];

  subscriptionShellCreated: Subscription;

  constructor(private shellNavigatorService: ShellNavigatorService) {
    this.subscriptionShellCreated = shellNavigatorService.shellCreated$.subscribe(
      studyUid => {
        this.openedStudies = shellNavigatorService.createdShell;
            });
  }

  ngOnInit() {
  }

  doShowStudy(study: Study) {
    this.shellNavigatorService.shellNavigate(study);
  }

  doHideStudy(study: Study) {
    this.openedStudies = this.openedStudies.filter((value, index, array) => value.studyInstanceUid !== study.studyInstanceUid);
    this.shellNavigatorService.shellDelete(study);
  }
}
