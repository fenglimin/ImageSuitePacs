import { Component, OnInit, Inject } from '@angular/core';
import { DialogService } from "../../../../services/dialog.service";
import { MAT_DIALOG_DATA, MatDialogRef, MatDatepickerInputEvent } from "@angular/material";
import { MessageBoxType, MessageBoxContent } from "../../../../models/messageBox";
import { Study, Series, StudyTemp, WorklistColumn } from "../../../../models/pssi";
import { WorklistService } from "../../../../services/worklist.service";
import { DatabaseService } from "../../../../services/database.service";
import { TransferJob, TransferJobItem } from "../../../../models/settings";


@Component({
  selector: 'app-delivery-status',
  templateUrl: './delivery-status.component.html',
  styleUrls: ['./delivery-status.component.less']
})
export class DeliveryStatusComponent implements OnInit {

    transferJobList: TransferJob[];
    transferJobItemList: TransferJobItem[];
    selectedTransferJob: TransferJob = new TransferJob();

    constructor(
        public worklistService: WorklistService,
        public databaseService: DatabaseService,

        public dialogRef: MatDialogRef<DeliveryStatusComponent>,
        @Inject(MAT_DIALOG_DATA) study: Study,
        private dialogService: DialogService) {
    }

    ngOnInit() {
        this.refreshTransferJob();
    }

    refreshTransferJob() {
        this.databaseService.getTransferJob().subscribe(ret => {
            this.transferJobList = ret;

            for (let transferJob of this.transferJobList) {
                this.onTransferJobRowClicked(transferJob);
                break;
            }

        });
    }

    onTransferJobRowClicked(transferJob) {
        this.selectedTransferJob = transferJob;

        this.databaseService.getTransferJobItem(transferJob.jobUid).subscribe(ret => {
            this.transferJobItemList = ret;
        });
    }

    onResumeClicked(): void {
        this.databaseService.setSelectedJobStatus(this.selectedTransferJob.jobUid, "FRESH").subscribe(ret => {
            this.refreshTransferJob();

        });

    }

    onPauseClicked(): void {
        this.databaseService.setSelectedJobStatus(this.selectedTransferJob.jobUid, "PAUSED").subscribe(ret => {
            this.refreshTransferJob();

        });

    }

    onCancelTransferClicked(): void {
        this.databaseService.setSelectedJobStatus(this.selectedTransferJob.jobUid, "canceled").subscribe(ret => {
            this.refreshTransferJob();

        });

    }

    onResendClicked(): void {
        this.databaseService.setSelectedJobStatus(this.selectedTransferJob.jobUid, "FRESH").subscribe(ret => {
            this.refreshTransferJob();

        });

    }

    onDeleteClicked(): void {
        //this.databaseService.setSelectedJobStatus(this.selectedTransferJob.jobUid, "processing").subscribe(ret => {
        //});

    }

    onRefreshClicked(): void {
        this.refreshTransferJob();
    }


    onCancelClick(): void {
        this.dialogRef.close();
    }
}
