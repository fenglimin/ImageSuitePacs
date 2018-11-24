import { Component, OnInit, EventEmitter, Output } from '@angular/core';


import { Shortcut } from '../../../models/shortcut';
import { Patient } from '../../../models/pssi';
import { WorklistService } from '../../../services/worklist.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageBoxType, MessageBoxContent, DialogResult } from '../../../models/messageBox';

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

    const content = new MessageBoxContent();
    content.title = 'Confirm Delete';
    content.messageText = 'Are you sure to delete this shortcut?';
    content.messageType = MessageBoxType.Question;

    this.dialogService.showMessageBox(content).subscribe(
      val => this.onConfirmDeleteCallback(val));
  }

  onConfirmDeleteCallback(val: any) {
    if (val.dialogResult === DialogResult.Yes) {
      alert('delete');
    }
  }

}
