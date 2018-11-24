import { Component, OnInit, EventEmitter, Output } from '@angular/core';


import { Shortcut } from '../../../models/shortcut';
import { Patient } from '../../../models/pssi';
import { WorklistService } from '../../../services/worklist.service';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-query-shortcut',
  templateUrl: './query-shortcut.component.html',
  styleUrls: ['./query-shortcut.component.css']
})
export class QueryShortcutComponent implements OnInit {

  allShortcuts: Shortcut[];

  constructor(private worklistService: WorklistService, private dialogService: DialogService) {
    
  }

  ngOnInit() {
   // this.databaseService.getShortcuts().subscribe(shortcuts => this.allShortcuts = shortcuts);
  }

  doQuery(shortcut: Shortcut): void {

  }

  onQueryTodayStudy(): void {
    this.worklistService.onQueryTodayStudy();
  }

  onQueryAllStudies(): void {
    this.worklistService.onQueryAllStudies();
  }

  deleteShortcut(): void {
    this.dialogService.showMessageBox().subscribe(
      val => console.log("Dialog output:", val)
    );
  }
}
