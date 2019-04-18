import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Shortcut } from "../models/shortcut";
import { DatabaseService } from "./database.service"
import { ViewerShellData } from "../models/viewer-shell-data";
import { HangingProtocolService } from "./hanging-protocol.service";
import { ShellNavigatorService } from "./shell-navigator.service";
import { Study, RecWorklistData, WorklistColumn } from "../models/pssi";
import { DataSource } from "../models/shortcut";

@Injectable({
    providedIn: "root"
})
export class WorklistService {
    studies: Study[];
    shortcuts: Shortcut[];
    worklistColumns: WorklistColumn[];
    recWorklistData: RecWorklistData;
    pageCount: number;
    pages: number[];
    querying = false;
    bShowSetReadBtn = true;
    bShowSetUnreadBtn = true;


    private _shortcut: Shortcut;
    set shortcut(value: Shortcut) {
        this._shortcut.copyConditionFrom(value);
        this.studies = this.onQueryStudies(1);
    }
    get shortcut(): Shortcut {
        return this._shortcut;
    }


    private _showHistoryStudies = true;

    set showHistoryStudies(value: boolean) {
        this._showHistoryStudies = value;
    }

    get showHistoryStudies(): boolean {
        return this._showHistoryStudies;
    }

    // Observable Shortcut sources
    private shortcutSelectedSource = new Subject<Shortcut>();

    // Observable Shortcut streams
    shortcutSelected$ = this.shortcutSelectedSource.asObservable();

    // Service Shortcut commands
    shortcutSelected(shortcut: Shortcut) {
        this.shortcutSelectedSource.next(shortcut);
    }

    constructor(private databaseService: DatabaseService,
        private shellNavigatorService: ShellNavigatorService,
        private hangingProtocolService: HangingProtocolService) {

        this._shortcut = new Shortcut();
        this._shortcut.dataSource = DataSource.MiniPacs;
    }

    onQueryStudies(pageIndex: number, sortItem: String = ""): Study[] {

        this.querying = true;
        if (this.isUsingLocalTestData()) {
            this.studies = this.databaseService.getStudiesTest();
            this.querying = false;
        } else {
            this.databaseService.getStudies(this._shortcut, pageIndex, sortItem).subscribe(recWorklistData => this.formatStudies(recWorklistData));
        }

        return this.studies;
    }

    onQueryShortcuts(): Shortcut[] {

        this.querying = true;
        if (this.isUsingLocalTestData()) {
            //this.shortcuts = this.databaseService.getShortcuts();
            this.querying = false;
        } else {
            this.databaseService.getShortcuts().subscribe(shortcuts => this.formatShortcuts(shortcuts));
        }

        return this.shortcuts;
    }

    onQueryWorklistCol(): Shortcut[] {

        this.querying = true;
        if (this.isUsingLocalTestData()) {
            //this.shortcuts = this.databaseService.getShortcuts();
            this.querying = false;
        } else {
            this.databaseService.getWorklistCol().subscribe(shortcuts => this.formatShortcuts(shortcuts));
        }

        return this.shortcuts;
    }

    onSaveShortcut(name: string) {
        if (this.isUsingLocalTestData()) {
            //this.studies = this.databaseService.getStudiesTest();
            //this.querying = false;
        } else {
            this._shortcut.name = name;
            this.databaseService.saveShortcut(this._shortcut).subscribe(shortcuts => this.refreshShortcuts());
        }
    }

    onDeleteShortcut(shortcut: Shortcut) {
        if (this.isUsingLocalTestData()) {
            //this.studies = this.databaseService.getStudiesTest();
            //this.querying = false;
        } else {
            //this._shortcut.name = name;
            this.databaseService.deleteShortcut(shortcut).subscribe(shortcuts => this.refreshShortcuts());
        }
    }

    onShowSingleStudy(study: Study) {
        const viewerShellData = new ViewerShellData(this.hangingProtocolService.getDefaultGroupHangingProtocol(),
            this.hangingProtocolService.getDefaultImageHangingPrococal());

        if (this.isUsingLocalTestData()) {
            viewerShellData.addStudy(study);
            this.shellNavigatorService.shellNavigate(viewerShellData);
        } else {
            this.databaseService.getStudy(study.id).subscribe(value => {
                viewerShellData.addStudy(value);
                // If the PSSI information changed, need to update worklist ??
                // study = value;
                // study = Study.clone(value, false);
                // study.patient = Patient.clone(value.patient, false);
                this.shellNavigatorService.shellNavigate(viewerShellData);
            });
        }
    }

    onShowAllCheckedStudy() {
        if (this.isUsingLocalTestData()) {
            const viewerShellData = new ViewerShellData(this.hangingProtocolService.getDefaultGroupHangingProtocol(),
                this.hangingProtocolService.getDefaultImageHangingPrococal());
            this.studies.forEach(study => {
                if (study.checked) {
                    viewerShellData.addStudy(study);
                }
            });

            this.shellNavigatorService.shellNavigate(viewerShellData);
        } else {
            this.studies.forEach(study => {
                if (study.checked) {
                    this.databaseService.getStudy(study.id)
                        .subscribe(value => this.studyDetailsLoaded(this.studies.indexOf(study), value));
                }
            });
        }
    }

    onSetRead(study: Study = null) {
        if (study == null) {
            this.studies.forEach(study => {
                if (study.checked) {
                    this.databaseService.setRead(study.studyInstanceUid)
                        .subscribe(shortcuts => this.refreshShortcuts());
                }
            });
        } else {
            this.databaseService.setRead(study.studyInstanceUid)
                .subscribe(shortcuts => this.refreshShortcuts());
        }
    }

    onSetUnread(study: Study = null) {
        if (study == null) {
            this.studies.forEach(study => {
                if (study.checked) {
                    this.databaseService.setUnread(study.studyInstanceUid)
                        .subscribe(shortcuts => this.refreshShortcuts());
                }
            });
        } else {
            this.databaseService.setUnread(study.studyInstanceUid)
                .subscribe(shortcuts => this.refreshShortcuts());
        }
    }

    onCheckStudyChanged(study: Study = null) {
        let scanStatusCompletedCount = 0;
        let scanStatusEndedCount = 0;


        this.studies.forEach(study => {
            if (study.checked) {
                if (study.scanStatus == "Completed") {
                    scanStatusCompletedCount++;
                }
                else if ((study.scanStatus == "Ended")) {
                    scanStatusEndedCount++;
                }
            }
        });

        if (scanStatusCompletedCount == 0) {
            this.bShowSetReadBtn = false;
        } else {
            this.bShowSetReadBtn = true;
        }
            
        if (scanStatusEndedCount == 0) {
            this.bShowSetUnreadBtn = false;
        } else {
            this.bShowSetUnreadBtn = true;
        }

        if (scanStatusCompletedCount == 0 && scanStatusEndedCount == 0) {
            this.bShowSetReadBtn = false;
            this.bShowSetUnreadBtn = false;
        }

    }

    isUsingLocalTestData(): boolean {
        return this._shortcut.dataSource === DataSource.LocalTestData;
    }

    setDataSource(dataSource: DataSource) {
        this._shortcut.dataSource = dataSource;
        this.studies = this.onQueryStudies(1);
        this.shortcuts = this.onQueryShortcuts();
    }

    onCleanCondition() {
        this.shortcut.clearCondition();
    }

    onQueryAllStudies() {
        this.shortcut.clearCondition();
        this.onQueryStudies(1);
        this.onQueryShortcuts();
    }

    onQueryTodayStudy() {
        this.shortcut.clearCondition();
        this.shortcut.studyDate = '1';
        this.onQueryStudies(1);
    }

    onQueryStudyByShortcut(shortcut: Shortcut) {
        this.shortcut = shortcut;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    private formatStudies(recWorklistData) {

        var studiesList = recWorklistData.studyList;

        for (let i = 0; i < studiesList.length; i++) {
            studiesList[i].checked = false;
            studiesList[i].detailsLoaded = false;
            studiesList[i].bodyPartList = new Array<string>();
            for (let j = 0; j < studiesList[i].seriesList.length; j++) {
                studiesList[i].seriesList[j].study = studiesList[i];
                if (!studiesList[i].bodyPartList.includes(studiesList[i].seriesList[j].localBodyPart)) {
                    studiesList[i].bodyPartList.push(studiesList[i].seriesList[j].localBodyPart);
                }
            }
        }

        this.studies = studiesList;
        this.pageCount = recWorklistData.pageCount;
        this.worklistColumns = recWorklistData.worklistColumns;
        

        for (let worklistColumn of recWorklistData.worklistColumns) {
            worklistColumn.shortcutType = this.shortcut;
        }

        for (let study of studiesList) {
            for (let worklistColumn of recWorklistData.worklistColumns) {
                worklistColumn.studyCol = study;
            }
        }

        this.pages = Array.from(Array(this.pageCount), (x, i) => i);
        this.querying = false;
    }

    private formatShortcuts(shortcuts) {
        this.shortcuts = shortcuts;
    }

    private refreshShortcuts() {
        this.onQueryStudies(1);
        this.onQueryShortcuts();
    }

    private studyDetailsLoaded(index: number, studyNew: Study) {

        studyNew.detailsLoaded = true;
        studyNew.checked = true;
        this.studies[index] = studyNew;

        if (this.studies.every(study => !study.checked || (study.checked && study.detailsLoaded))) {
            const viewerShellData = new ViewerShellData(this.hangingProtocolService.getDefaultGroupHangingProtocol(),
                this.hangingProtocolService.getDefaultImageHangingPrococal());
            this.studies.forEach(value => {
                if (value.checked && value.detailsLoaded) {
                    viewerShellData.addStudy(value);
                }
            });
            this.shellNavigatorService.shellNavigate(viewerShellData);

            this.studies.forEach(value => {
                value.detailsLoaded = false;
                value.checked = false;
            });
        }
    }
}
