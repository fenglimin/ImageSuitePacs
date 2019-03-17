import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import * as moment from 'moment';
import { DialogResult } from '../../../models/messageBox';
import { WindowLevelData } from '../../../models/dailog-data/image-process';
import { DialogService } from '../../../services/dialog.service';
import { MessageBoxType, MessageBoxContent } from '../../../models/messageBox';

@Component({
  selector: 'app-manual-wl-dialog',
  templateUrl: './manual-wl-dialog.component.html',
  styleUrls: ['./manual-wl-dialog.component.css']
})
export class ManualWlDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ManualWlDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WindowLevelData,
    private dialogService: DialogService) { }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onOkClick(): void {
    if (typeof this.data.windowCenter !== 'number') {
      const content = new MessageBoxContent();
      content.title = 'Input error';
      content.messageText = 'Only number is allowed for window center and width!';
      content.messageType = MessageBoxType.Warning;

      this.dialogService.showMessageBox(content);
      return;
    }

    this.dialogRef.close(this.data);
  }
}
