import { Component, OnInit, SimpleChange } from "@angular/core";
import { Shortcut } from "../../../models/shortcut";
import { Subscription } from "rxjs";
import { Study, WorklistColumn } from "../../../models/pssi";
import { WorklistService } from "../../../services/worklist.service";
import {
    MatDatepickerInputEvent, MatButton
} from "@angular/material";
import { DialogService } from "../../../services/dialog.service";
import { SelectStudydateDialogComponent } from "../../../components/dialog/select-studydate-dialog/select-studydate-dialog.component";
// Import DatePicker format
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { DateRange } from "../../../models/dailog-data/date-range";

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

export interface PeriodicElement {
    name: string;
    position: number;
    weight: number;
    symbol: string;
}


@Component({
    selector: "app-worklist",
    templateUrl: "./worklist.component.html",
    styleUrls: ["./worklist.component.less"],
    providers: [
        // i18n
        { provide: MAT_DATE_LOCALE, useValue: "zh-CN" },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class WorklistComponent implements OnInit {
    color = "#primary";
    mode = "indeterminate";
    value = 50;

    shortcutSelected: Subscription;

    events: string[] = [];

    fromMinDate = new Date(1900, 1, 1);
    fromMaxDate = new Date();

    toMinDate = new Date();
    toMaxDate = new Date();

    currentPage = 1;

    isDesc = false;
    orderHeader = ""; 

    initStudyDate: DateRange;

    myplaceHolder: string = 'Enter Name';


    fromDateChanged(type: string, event: MatDatepickerInputEvent<Date>) {
        this.toMinDate = event.value;
    }

    toDateChanged(type: string, event: MatDatepickerInputEvent<Date>) {
        this.fromMaxDate = event.value;
    }

    constructor(public worklistService: WorklistService, public dialogService: DialogService) {
        this.shortcutSelected = this.worklistService.shortcutSelected$.subscribe(
            shortcut => this.onShortcutSelected(shortcut));

        
    }

    onShortcutSelected(shortcut: Shortcut) {
        this.worklistService.shortcut = shortcut;
    }

    worklistColumnsTemp: string[] = [
        "PatientID",
        "PatientName",
        "Gender",
        "BirthDate",
        "AccessionNo",
        "Modality",
        "StudyDate",
        "StudyTime",
        "SeriesCount",
        "ImageCount",
        "StudyID"
    ];

    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        //alert('aa');
    }


    ngOnInit() {
        this.worklistService.onQueryStudies(1);
        this.worklistService.onQueryShortcuts();
        this.worklistService.onQueryWorklistCol();
    }

    onStudyChecked(study: Study) {
        study.studyChecked = !study.studyChecked;
        this.onCheckStudyChanged();
    }

    onAllStudyChecked(event) {
        this.worklistService.studies.forEach(study => study.studyChecked = event.target.studyChecked);
    }

    doShowStudy(study: Study) {
        study.studyChecked = true;
        this.worklistService.onShowSingleStudy(study);
    }

    onStudyDateChangeSelect(optionValue) {
        if (optionValue == "7") {
            let studyDate = new DateRange;
            this.dialogService.showDialog(SelectStudydateDialogComponent, studyDate).subscribe(
                val => {
                    this.getStudyDate(val);
                }
            );
        }
    }

    getStudyDate(studyDate: DateRange) {
        this.initStudyDate = studyDate;
        this.worklistService.shortcut.studyDateFrom = studyDate.dateFrom;
        this.worklistService.shortcut.studyDateTo = studyDate.dateTo;
    }

    onPrevPageClicked() {
        this.currentPage = this.currentPage - 1;
        this.worklistService.onQueryStudies(this.currentPage);
    }

    onNextPageClicked() {
        this.currentPage = this.currentPage + 1;
        this.worklistService.onQueryStudies(this.currentPage);
    }

    onCurrentPageClicked(i) {
        this.currentPage = +i;
        this.worklistService.onQueryStudies(this.currentPage);
    }

    onWorklistHeaderClicked(clickedHeader) {
        this.orderHeader = clickedHeader;

        if (!this.isDesc) {
            this.isDesc = true;
            this.worklistService.onQueryStudies(this.currentPage, clickedHeader + "|Desc");
        }
        else {
            this.isDesc = false;
            this.worklistService.onQueryStudies(this.currentPage, clickedHeader + "|");
        }
    }

    onStudyDateRangeTableClicked() {
        this.initStudyDate = null;
    }

    onSetRead(study: Study) {
        this.worklistService.onSetRead(study);
    }

    onSetUnread(study: Study) {
        this.worklistService.onSetUnread(study);
    }

    onCheckStudyChanged() {
        this.worklistService.onCheckStudyChanged();
    }

    checkPlaceHolder() {
        if (this.myplaceHolder) {
            this.myplaceHolder = null;
            return;
        } else {
            this.myplaceHolder = 'Enter Name';
            return;
        }
    }
}
