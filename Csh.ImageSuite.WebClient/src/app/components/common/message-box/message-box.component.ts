import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { MessageBoxType, MessageBoxContent, DialogResult } from "../../../models/messageBox";

@Component({
    selector: "app-message-box",
    templateUrl: "./message-box.component.html",
    styleUrls: ["./message-box.component.css"]
})
export class MessageBoxComponent implements OnInit {

    form: FormGroup;
    dialogResult: DialogResult;
    valueInput: string;
    needDisableYesButton = false;
    content: MessageBoxContent;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<MessageBoxComponent>,
        @Inject(MAT_DIALOG_DATA) messageBoxContent: MessageBoxContent) {

        this.content = messageBoxContent;

        this.form = fb.group({
            dialogResult: [DialogResult.Yes],
            valueInput: [this.valueInput, Validators.required]
        });

    }

    ngOnInit() {
        this.needDisableYesButton = this.content.messageType === MessageBoxType.Input;
    }


    onYes() {
        this.form.value.dialogResult = DialogResult.Yes;
        this.dialogRef.close(this.form.value);
    }

    onNo() {
        this.form.value.dialogResult = DialogResult.No;
        this.dialogRef.close(this.form.value);
    }

    onOk() {
        this.form.value.dialogResult = DialogResult.Ok;
        this.dialogRef.close(this.form.value);
    }

    onCancel() {
        this.form.value.dialogResult = DialogResult.Cancel;
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

    onInput(event) {
        this.needDisableYesButton = this.content.messageType === MessageBoxType.Input &&
        (this.form.value.valueInput === null ||
            this.form.value.valueInput === undefined ||
            this.form.value.valueInput === "");

        //if (!this.needDisableYesButton && event.code === "Enter") {
        //  this.onOk();
        //}
    }
}
