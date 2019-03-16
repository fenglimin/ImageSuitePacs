import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { MessageBoxComponent } from '../components/common/message-box/message-box.component';
import { Observable, of } from 'rxjs';
import { MessageBoxType, MessageBoxContent } from '../models/messageBox';

import { ManualWlDialogComponent } from '../components/dialog/manual-wl-dialog/manual-wl-dialog.component';
import { WindowLevelData } from '../models/dailog-data/image-process';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) { }

  showMessageBox(messageBoxContent: MessageBoxContent): Observable<any> {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = messageBoxContent.messageType === MessageBoxType.Input;
    dialogConfig.data = messageBoxContent;

    const dialogRef = this.dialog.open(MessageBoxComponent, dialogConfig);
    return dialogRef.afterClosed();
  }

  //showManualWlDialog(windowLevelData: WindowLevelData): Observable<any> {
  //  const dialogConfig = new MatDialogConfig();

  //  dialogConfig.disableClose = true;
  //  dialogConfig.autoFocus = true;
  //  dialogConfig.data = windowLevelData;

  //  const dialogRef = this.dialog.open(ManualWlDialogComponent, dialogConfig);
  //  return dialogRef.afterClosed();
  //}

  showManualWlDialog(windowLevelData: WindowLevelData): Observable<any> {
    const dialogRef = this.dialog.open(ManualWlDialogComponent, {
      autoFocus: true,
      data: windowLevelData
    });

    return dialogRef.afterClosed();
  }
}
