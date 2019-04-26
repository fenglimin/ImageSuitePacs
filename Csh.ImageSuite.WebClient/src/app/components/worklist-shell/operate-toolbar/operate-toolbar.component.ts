import { Component, OnInit } from "@angular/core";
import { WorklistService } from "../../../services/worklist.service";
import { DialogService } from "../../../services/dialog.service";
import { MessageBoxType, MessageBoxContent, DialogResult } from "../../../models/messageBox";

@Component({
    selector: "app-operate-toolbar",
    templateUrl: "./operate-toolbar.component.html",
    styleUrls: ["./operate-toolbar.component.css"]
})
export class OperateToolbarComponent implements OnInit {

    disableLoadImageButton: boolean;

    constructor(private worklistService: WorklistService, public dialogService: DialogService) {
        this.disableLoadImageButton = false;
    }

    ngOnInit() {
    }

    onLoadImage() {
        this.worklistService.onShowAllCheckedStudy();
    }

    onLoadKeyImage() {

    }

    onSetRead() {
        this.worklistService.onSetRead();
    }

    onSetUnread() {
        this.worklistService.onSetUnread();
    }

    onChangeImageSeriesOrder() {

    }

    onReassign() {

    }

    onTransfer() {

    }

    onTagEdit() {

    }

    onDeletePrevent() {
        this.worklistService.onDeletePrevent();
    }

    onDeleteAllow() {
        this.worklistService.onDeleteAllow();
    }

    onDeleteStudy() {
        //this.dialogService.showDialog(DeleteStudyDialogComponent, 0).subscribe(
        //    deletionReason => {
        //        this.worklistService.onDeleteStudy(deletionReason);
        //    }
        //);

        const content = new MessageBoxContent();
        content.title = "Deletion Reason";
        content.messageText = "WARNING:The report of the deleted study cannot be restored.";
        content.messageType = MessageBoxType.Input;

        this.dialogService.showMessageBox(content).subscribe(
            val => this.getMessageBoxValue(val));
    }

    getMessageBoxValue(val) {
        if (val.dialogResult == DialogResult.Ok) {
            this.worklistService.onDeleteStudy(val.valueInput);
        }
    }

    onImport() {

    }
}
