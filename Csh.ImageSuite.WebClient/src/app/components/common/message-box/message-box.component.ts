import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {FormBuilder, Validators, FormGroup} from "@angular/forms";
import * as moment from 'moment';
import { Shortcut } from '../../../models/shortcut';
import { MessageBoxType, MessageBoxContent } from '../../../models/messageBox';

@Component({
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.css']
})
export class MessageBoxComponent implements OnInit {

  form: FormGroup;
  content = new MessageBoxContent();
  confirmed: boolean;
  valueInput: string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MessageBoxComponent>,
    @Inject(MAT_DIALOG_DATA) { title, messageText, messageType }: MessageBoxContent) {

    this.content.title = title;
    this.content.messageText = messageText;
    this.content.messageType = messageType;

    this.form = fb.group({
      confirmed: [true],
      valueInput: [this.valueInput, Validators.required]
    });

  }

  ngOnInit() {

  }


  onYes() {
    if (this.content.messageType === MessageBoxType.Input &&
      (this.form.value.valueInput === null || this.form.value.valueInput === undefined)) {
      return;
    }

    this.form.value.confirmed = true;
    this.dialogRef.close(this.form.value);
  }

  onNo() {
    this.form.value.confirmed = false;
    this.dialogRef.close(this.form.value);
  }

  needShowYesNoButton(): boolean {
    return this.content.messageType === MessageBoxType.Question;
  }

  needShowOkButton(): boolean {
    return this.content.messageType !== MessageBoxType.Question;
  }

  needShowCancelButton(): boolean {
    return this.content.messageType === MessageBoxType.Input;
  }

}
