import { Component, OnInit } from '@angular/core';
import { ShellNavigatorService } from '../../services/shell-navigator.service';
import { Subscription }   from 'rxjs';

@Component({
  selector: 'app-header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.css']
})
export class HeaderBarComponent implements OnInit {

  subscriptionShellNavigated: Subscription;
  hideMe = false;

  constructor(private shellNavigatorService: ShellNavigatorService) {
  }

  ngOnInit() {
  }

  doShowStudy(studyUid) {
    this.shellNavigatorService.shellNavigate(studyUid);
  }
}
