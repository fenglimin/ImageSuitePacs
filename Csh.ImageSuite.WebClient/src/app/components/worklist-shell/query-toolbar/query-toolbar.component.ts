import { Component, OnInit } from '@angular/core';
import { WorklistService } from '../../../services/worklist.service';
import { DataSource } from '../../../models/shortcut';
import { DialogService } from '../../../services/dialog.service';
import { MessageBoxType, MessageBoxContent, DialogResult } from '../../../models/messageBox';

@Component({
  selector: 'app-query-toolbar',
  templateUrl: './query-toolbar.component.html',
  styleUrls: ['./query-toolbar.component.css']
})
export class QueryToolbarComponent implements OnInit {

  constructor(private worklistService: WorklistService, private dialogService: DialogService) { }

  ngOnInit() {
  }

  onChangeDataSource(event) {
    this.worklistService.setDataSource(event.target.checked? DataSource.LocalTestData : DataSource.MiniPacs);
  }

  onQuery() {
    this.worklistService.onQueryStudies();
  }

  onClearCondition() {
    this.worklistService.onCleanCondition();
  }

  onSaveShortcut() {
    const content = new MessageBoxContent();
    content.title = 'Add Shortcut';
    content.messageText = 'Please input the name of the shortcut:';
    content.messageType = MessageBoxType.Input;

    this.dialogService.showMessageBox(content).subscribe(
      val => this.onSaveShortcutCallback(val));
  }

  onSaveShortcutCallback(val: any) {
    if (val.dialogResult === DialogResult.Ok) {
      alert('add shortcut ' + val.valueInput);
    }
  }
}
