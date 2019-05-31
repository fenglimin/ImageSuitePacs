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

        //this.content.messageText = this.content.callbackFunction();
        if (this.content.callbackFunction) {
            this.content.callbackFunction.call(this.content.callbackOwner, this.content.callbackArg).subscribe(value => {
                if (value === "") {
                    this.form.value.dialogResult = DialogResult.Ok;
                    this.dialogRef.close(this.form.value);
                } else {
                    this.content.messageText = value;
                }

            });
        }
        
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

    public closeDialog() {
        this.dialogRef.close();
    }

    needShowYesNoButton(): boolean {
        return this.content.messageType === MessageBoxType.Question;
    }

    needShowOkButton(): boolean {
        return this.content.messageType !== MessageBoxType.Question && this.content.messageType !== MessageBoxType.InfoCancel;
    }

    needShowCancelButton(): boolean {
        return this.content.messageType === MessageBoxType.Input || this.content.messageType === MessageBoxType.InfoCancel;
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
