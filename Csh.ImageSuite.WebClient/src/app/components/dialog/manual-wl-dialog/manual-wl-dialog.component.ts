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
export class ManualWlDialogComponent implements OnInit {

  form: FormGroup;
  dialogResult: DialogResult;
  windowLevelData: WindowLevelData;
  needDisableYesButton = false;
  windowCenter: number;

  constructor(private fb: FormBuilder,
    private dialogRef: MatDialogRef<ManualWlDialogComponent>,
    @Inject(MAT_DIALOG_DATA) windowLevelData: WindowLevelData) {
    this.windowLevelData = windowLevelData;
    this.windowCenter = this.windowLevelData.windowCenter;

    this.form = fb.group({
      dialogResult: [DialogResult.Yes],
      windowCenter: [this.windowCenter, Validators.required]
    });
  }

  ngOnInit() {
  }

  onOk() {
    this.form.value.dialogResult = DialogResult.Ok;
    this.dialogRef.close(this.form.value);
  }

  onCancel() {
    this.form.value.dialogResult = DialogResult.Cancel;
    this.dialogRef.close(this.form.value);
  }

  onInput(event) {
  }
}
