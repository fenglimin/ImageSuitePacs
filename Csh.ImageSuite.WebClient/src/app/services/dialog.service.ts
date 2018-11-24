import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { MessageBoxComponent } from '../components/common/message-box/message-box.component';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) { }

  showMessageBox(): Observable<any> {
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
    return dialogRef.afterClosed();
  }
}
