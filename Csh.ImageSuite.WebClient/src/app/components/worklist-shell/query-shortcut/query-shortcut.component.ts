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

  allShortcuts: Shortcut[] = [];

  constructor(private worklistService: WorklistService, private dialogService: DialogService) {
    const shortcut = new Shortcut();
    shortcut.name = "All CR";
    shortcut.id = 1;
    shortcut.modality = "CR";
    this.allShortcuts.push(shortcut);
  }

  ngOnInit() {
    this.onRefreshShortcut();
  }

  onQuery(shortcut: Shortcut): void {
    this.worklistService.onQueryStudyByShortcut(shortcut);
  }

  onQueryTodayStudy(): void {
    this.worklistService.onQueryTodayStudy();
  }

  onQueryAllStudies(): void {
    this.worklistService.onQueryAllStudies();
  }

  onDeleteShortcut(shortcut: Shortcut): void {

    const content = new MessageBoxContent();
    content.title = 'Confirm Delete';
    content.messageText = 'Are you sure to delete this shortcut?';
    content.messageType = MessageBoxType.Question;

    this.dialogService.showMessageBox(content).subscribe(
      val => this.onConfirmDeleteCallback(val,shortcut));
  }

  onConfirmDeleteCallback(val: any, shortcut: Shortcut) {
      if (val.dialogResult === DialogResult.Yes) {
          this.worklistService.onDeleteShortcut(shortcut);

      //alert('delete shortcut ' + shortcut.name);
    }
  }

  onRefreshShortcut() {
    // this.databaseService.getShortcuts().subscribe(shortcuts => this.allShortcuts = shortcuts);
  }

  onRefreshThirdpartyPacs() {

  }
}
