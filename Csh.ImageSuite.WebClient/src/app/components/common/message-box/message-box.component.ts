import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {FormBuilder, Validators, FormGroup} from "@angular/forms";
import * as moment from 'moment';
import { Shortcut } from '../../../models/shortcut';

@Component({
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.css']
})
export class MessageBoxComponent implements OnInit {

  form: FormGroup;
  title:string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MessageBoxComponent>) {


    this.form = fb.group({
      patientId: ['aa', Validators.required]
    });

  }

  ngOnInit() {

  }


  save() {
    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close();
  }
}
