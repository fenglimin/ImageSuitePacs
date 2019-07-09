import { Component, OnInit, Inject } from '@angular/core';
import { DialogService } from "../../../../services/dialog.service";
import { MAT_DIALOG_DATA, MatDialogRef, MatDatepickerInputEvent } from "@angular/material";
import { MessageBoxType, MessageBoxContent } from "../../../../models/messageBox";
import { Study, Series, StudyTemp, WorklistColumn } from "../../../../models/pssi";
import { WorklistService } from "../../../../services/worklist.service";

@Component({
  selector: 'app-export-study',
  templateUrl: './export-study.component.html',
  styleUrls: ['./export-study.component.less']
})
export class ExportStudyComponent {
    studyNumber: number = 0;
    studies: Study[];


    constructor(
        public worklistService: WorklistService,
        public dialogRef: MatDialogRef<ExportStudyComponent>,
        @Inject(MAT_DIALOG_DATA) studies: Study[],
        private dialogService: DialogService) {
        this.studyNumber = studies.length;
        this.studies = new Array<Study>();
        this.studies = studies;
    }

    ngOnInit() {
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        
        this.dialogRef.close();
    }

}
