import { Component, OnInit, Inject } from '@angular/core';
import { DialogService } from "../../../../services/dialog.service";
import { MAT_DIALOG_DATA, MatDialogRef, MatDatepickerInputEvent } from "@angular/material";
import { MessageBoxType, MessageBoxContent } from "../../../../models/messageBox";
import { Study, Series, StudyTemp, WorklistColumn } from "../../../../models/pssi";
import { WorklistService } from "../../../../services/worklist.service";

// Import DatePicker format
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";

import * as moment from 'moment';

export const MY_FORMATS = {
    parse: {
        dateInput: "LL",
    },
    display: {
        dateInput: "LL",
        monthYearLabel: "MMM YYYY",
        dateA11yLabel: "LL",
        monthYearA11yLabel: "MMMM YYYY",
    },
};

@Component({
  selector: 'app-patient-edit',
  templateUrl: './patient-edit.component.html',
  styleUrls: ['./patient-edit.component.css'],
})
export class PatientEditComponent {
    study: Study = new Study();
    series: Series = new Series();
    seriesNum: number = 0;
    patientBirthDate: Date;
    patientSexColumn: WorklistColumn = new WorklistColumn();

    constructor(
        public worklistService: WorklistService,
        public dialogRef: MatDialogRef<PatientEditComponent>,
        @Inject(MAT_DIALOG_DATA) study: Study,
        private dialogService: DialogService) {

        this.study = study;
        this.patientBirthDate = new Date(this.study.patient.patientBirthDate);
        this.patientSexColumn = worklistService.worklistColumns[2];

        this.getSeriesValue(0);
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.study.patient.patientBirthDate = moment(this.patientBirthDate).format('MM/DD/YYYY');
        this.worklistService.onUpdateStudy(this.study);
        this.dialogRef.close();
    }

    getSeriesValue(seriesNum: number): void {
        // Remove Study in Series for circular json issue
        for (let i = 0; i < this.study.seriesList.length; i++) {
            let seriesTemp = this.study.seriesList[i];
            seriesTemp.study = new Study();
            this.study.seriesList[i] = seriesTemp;
        }

        this.series = this.study.seriesList[seriesNum];

        if (this.series.seriesNo == null) {
            this.series.seriesNo = 1;
        }
    }

    onSeriesChanged(optionValue) {
        this.series = this.study.seriesList[optionValue];
    }

    onPatientSexChanged(optionValue) {
        this.study.patient.patientSex = optionValue;
    }
}

