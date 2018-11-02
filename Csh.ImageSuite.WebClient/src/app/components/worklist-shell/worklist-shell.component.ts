import { Component, OnInit, Input } from '@angular/core';
import { Shortcut } from '../../models/shortcut';
import { ShellNavigatorService } from '../../services/shell-navigator.service';
import { Subscription }   from 'rxjs';

@Component({
  selector: 'app-worklist-shell',
  templateUrl: './worklist-shell.component.html',
  styleUrls: ['./worklist-shell.component.css']
})
export class WorklistShellComponent implements OnInit {
  selectedShortcut: Shortcut = {
    id: 11,
    name: 'Default'
  }

  subscriptionShellNavigated: Subscription;
  hideMe = false;
  studyUid: string;

  constructor(private shellNavigatorService: ShellNavigatorService) {
    this.subscriptionShellNavigated = shellNavigatorService.shellSelected$.subscribe(
      studyUid => {
        this.hideMe = studyUid !== this.studyUid;
      });
  }

  ngOnInit() {
  }

  onSelected(shortcut: Shortcut) {
      this.selectedShortcut = shortcut;
  }
}
