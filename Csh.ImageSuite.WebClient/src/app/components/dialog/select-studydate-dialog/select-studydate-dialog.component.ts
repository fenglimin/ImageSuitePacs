import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef, MatDatepickerInputEvent } from "@angular/material";
import { DateRange } from "../../../models/dailog-data/date-range";
import { DialogService } from "../../../services/dialog.service";
import { MessageBoxType, MessageBoxContent } from "../../../models/messageBox";

// Import DatePicker format
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";

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
  selector: 'app-select-studydate-dialog',
  templateUrl: './select-studydate-dialog.component.html',
    styleUrls: ['./select-studydate-dialog.component.css'],
  providers: [
      // i18n
      { provide: MAT_DATE_LOCALE, useValue: "zh-CN" },
      { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
      { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class SelectStudydateDialogComponent {
    fromMinDate = new Date(1900, 1, 1);
    fromMaxDate = new Date();

    toMinDate = new Date();
    toMaxDate = new Date();


    constructor(
        public dialogRef: MatDialogRef<SelectStudydateDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dateRange: DateRange,
        private dialogService: DialogService) {
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {


        this.dialogRef.close(this.dateRange);

    }

    fromDateChanged(type: string, event: MatDatepickerInputEvent<Date>) {
        this.toMinDate = event.value;
        this.dateRange.dateFrom = event.value;
    }

    toDateChanged(type: string, event: MatDatepickerInputEvent<Date>) {
        this.fromMaxDate = event.value;
        this.dateRange.dateTo = event.value;
    }

}
