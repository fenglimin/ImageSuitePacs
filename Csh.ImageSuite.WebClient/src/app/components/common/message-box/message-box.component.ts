import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {FormBuilder, Validators, FormGroup} from "@angular/forms";
import * as moment from 'moment';
import { Shortcut } from '../../../models/shortcut';
import { MessageBoxContent } from '../../../models/messageBox';

@Component({
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.css']
})
export class MessageBoxComponent implements OnInit {

  form: FormGroup;
  content = new MessageBoxContent();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MessageBoxComponent>,
    @Inject(MAT_DIALOG_DATA) { title, messageText, messageType }: MessageBoxContent) {

    this.content.title = title;
    this.content.messageText = messageText;
    this.content.messageType = messageType;

    this.form = fb.group({
    });

  }

  ngOnInit() {

  }


  onYes() {
    this.dialogRef.close(this.form.value);
  }

  onNo() {
    this.dialogRef.close();
  }

  onOk() {
    this.dialogRef.close();
  }

  getClass(): string {
    return 'glyphicon-warning-sign';
  }
}
