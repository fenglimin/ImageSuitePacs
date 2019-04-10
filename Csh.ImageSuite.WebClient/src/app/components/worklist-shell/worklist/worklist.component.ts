import { Component, OnInit, SimpleChange } from "@angular/core";
import { Shortcut } from "../../../models/shortcut";
import { Subscription } from "rxjs";
import { Study, WorklistColumn } from "../../../models/pssi";
import { WorklistService } from "../../../services/worklist.service";
import {
    MatDatepickerInputEvent, MatButton
} from "@angular/material";

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

export interface PeriodicElement {
    name: string;
    position: number;
    weight: number;
    symbol: string;
}


@Component({
    selector: "app-worklist",
    templateUrl: "./worklist.component.html",
    styleUrls: ["./worklist.component.css"],
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

    fromDateChanged(type: string, event: MatDatepickerInputEvent<Date>) {
        this.toMinDate = event.value;
    }

    toDateChanged(type: string, event: MatDatepickerInputEvent<Date>) {
        this.fromMaxDate = event.value;
    }

    constructor(public worklistService: WorklistService) {
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

    onAllStudyChecked(event) {

        this.worklistService.studies.forEach(study => study.checked = event.target.checked);
    }

    doShowStudy(study: Study) {
        study.checked = true;
        this.worklistService.onShowSingleStudy(study);
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
}
