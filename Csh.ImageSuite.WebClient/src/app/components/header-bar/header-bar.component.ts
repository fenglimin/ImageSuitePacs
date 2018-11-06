import { Component, OnInit, SimpleChanges, AfterContentInit, AfterViewInit, AfterViewChecked } from '@angular/core';
import { ShellNavigatorService } from '../../services/shell-navigator.service';
import { Subscription }   from 'rxjs';
import { Study } from '../../models/pssi';

@Component({
  selector: 'app-header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.css']
})
export class HeaderBarComponent implements OnInit, AfterContentInit, AfterViewInit, AfterViewChecked {

  hideMe = false;
  openedStudies: Array<Study> = [];
  studyShown: Study;

  subscriptionShellNavigated: Subscription;
  subscriptionShellCreated: Subscription;

  constructor(private shellNavigatorService: ShellNavigatorService) {
    this.subscriptionShellCreated = shellNavigatorService.shellCreated$.subscribe(
      study => {
        this.openedStudies = shellNavigatorService.createdShell;
        this.studyShown = study;
      });

    this.subscriptionShellNavigated = shellNavigatorService.shellSelected$.subscribe(
      study => { this.highlightStudyButton(study);});
  }

  ngOnInit() {
  }

  ngAfterContentInit() {
    
  }
 
  ngAfterViewInit() {
    
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  ngAfterViewChecked(): void {
    this.highlightStudyButton(this.studyShown);
  }

  showStudy(study: Study) {
    this.shellNavigatorService.shellNavigate(study);
    this.studyShown = study;
  }

  closeStudy(study: Study) {
    this.openedStudies = this.openedStudies.filter((value, index, array) => value.studyInstanceUid !== study.studyInstanceUid);
    const nextStudy = this.shellNavigatorService.shellDelete(study);
    this.studyShown = nextStudy;
  }

  highlightStudyButton(study: Study) {
    if (study === null) {
      return;
    }

    const len = this.openedStudies.length;
    for (let i = 0; i < len; i++) {
      const id = "headerButton" + this.openedStudies[i].studyInstanceUid;
      const o = document.getElementById(id);
      if (o !== undefined && o !== null) {
        o.style.color = (this.openedStudies[i].studyInstanceUid === study.studyInstanceUid) ? '#ff9900' : 'white';
      }
    }
  }
}
