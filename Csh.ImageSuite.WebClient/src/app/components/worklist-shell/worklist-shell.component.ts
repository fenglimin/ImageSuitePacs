import { Component, OnInit, Input } from '@angular/core';
import { Shortcut } from '../../models/shortcut';

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

  hideMe = false;

  constructor() { }

  ngOnInit() {
  }

  onSelected(shortcut: Shortcut) {
      this.selectedShortcut = shortcut;
  }
}
