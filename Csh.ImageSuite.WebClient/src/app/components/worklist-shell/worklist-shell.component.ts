import { Component, OnInit, Input } from '@angular/core';
import { Shortcut } from '../../models/shortcut';
import { ShellNavigatorService } from '../../services/shell-navigator.service';
import { Subscription }   from 'rxjs';
import { OpenedViewerShell } from '../../models/openedViewerShell';

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

  constructor(private shellNavigatorService: ShellNavigatorService) {
    this.subscriptionShellNavigated = shellNavigatorService.shellSelected$.subscribe(
      openedViewerShell => {
        this.hideMe = openedViewerShell !== null;
      });
  }

  ngOnInit() {
  }

  onSelected(shortcut: Shortcut) {
      this.selectedShortcut = shortcut;
  }
}
