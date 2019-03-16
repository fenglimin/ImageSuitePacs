import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import * as moment from 'moment';
import { DialogResult } from '../../../models/messageBox';
import { WindowLevelData } from '../../../models/dailog-data/image-process';

@Component({
  selector: 'app-manual-wl-dialog',
  templateUrl: './manual-wl-dialog.component.html',
  styleUrls: ['./manual-wl-dialog.component.css']
})
export class ManualWlDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ManualWlDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WindowLevelData) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
