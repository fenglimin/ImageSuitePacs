import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import {MatDialog, MatDialogConfig} from "@angular/material";

import { Shortcut } from '../../../models/shortcut';
import { Patient } from '../../../models/pssi';
import { WorklistService } from '../../../services/worklist.service';
import { MessageBoxComponent } from '../../common/message-box/message-box.component';

@Component({
  selector: 'app-query-shortcut',
  templateUrl: './query-shortcut.component.html',
  styleUrls: ['./query-shortcut.component.css']
})
export class QueryShortcutComponent implements OnInit {

  allShortcuts: Shortcut[];

  constructor(private worklistService: WorklistService, private dialog: MatDialog) {
    
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
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;

    const title = 'Confirm Delete';
    const messageText = 'Please input the name of the shortcut:';//Are you sure to delete this shortcut?';
    const messageType = 4;
    dialogConfig.data = {
      title,
      messageText,
      messageType
    };

    const dialogRef = this.dialog.open(MessageBoxComponent, dialogConfig);


    dialogRef.afterClosed().subscribe(
      val => console.log("Dialog output:", val)
    );
  }
}
