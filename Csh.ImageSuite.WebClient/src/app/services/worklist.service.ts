import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Shortcut } from "../models/shortcut";
import { DatabaseService } from "./database.service"
import { ViewerShellData } from "../models/viewer-shell-data";
import { HangingProtocolService } from "./hanging-protocol.service";
import { ShellNavigatorService } from "./shell-navigator.service";
import { Study } from "../models/pssi";
import { DataSource } from "../models/shortcut";

@Injectable({
    providedIn: "root"
})
export class WorklistService {
    studies: Study[];
    shortcuts: Shortcut[];
    querying = false;

    private _shortcut: Shortcut;

    set shortcut(value: Shortcut) {
        this._shortcut.copyConditionFrom(value);
        this.studies = this.onQueryStudies();
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
    }

    onQueryStudies(): Study[] {

        this.querying = true;
        if (this.isUsingLocalTestData()) {
            this.studies = this.databaseService.getStudiesTest();
            this.querying = false;
        } else {
            this.databaseService.getStudies(this._shortcut).subscribe(studies => this.formatStudies(studies));
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

    onSaveShortcut(name: string) {
        if (this.isUsingLocalTestData()) {
            //this.studies = this.databaseService.getStudiesTest();
            //this.querying = false;
        } else {
            this._shortcut.name = name;
            this.databaseService.saveShortcut(this._shortcut).subscribe(shortcuts => this.afterDeleteShortcut());
        }

    }

    onDeleteShortcut(shortcut: Shortcut) {
        if (this.isUsingLocalTestData()) {
            //this.studies = this.databaseService.getStudiesTest();
            //this.querying = false;
        } else {
            //this._shortcut.name = name;
            this.databaseService.deleteShortcut(shortcut).subscribe(shortcuts => this.afterDeleteShortcut());
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

    isUsingLocalTestData(): boolean {
        return this._shortcut.dataSource === DataSource.LocalTestData;
    }

    setDataSource(dataSource: DataSource) {
        this._shortcut.dataSource = dataSource;
        this.studies = this.onQueryStudies();
        this.shortcuts = this.onQueryShortcuts();
    }

    onCleanCondition() {
        this.shortcut.clearCondition();
    }

    onQueryAllStudies() {
        this.shortcut.clearCondition();
        this.onQueryStudies();
        this.onQueryShortcuts();
    }

    onQueryTodayStudy() {
        this.shortcut.clearCondition();
        this.shortcut.studyDate = "Today";
        this.onQueryStudies();
    }

    onQueryStudyByShortcut(shortcut: Shortcut) {
        this.shortcut = shortcut;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    private formatStudies(studies) {
        for (let i = 0; i < studies.length; i++) {
            studies[i].checked = false;
            studies[i].detailsLoaded = false;
            for (let j = 0; j < studies[i].seriesList.length; j++) {
                studies[i].seriesList[j].study = studies[i];
            }
        }

        this.studies = studies;
        this.querying = false;
    }

    private formatShortcuts(shortcuts) {
        //for (let i = 0; i < shortcuts.length; i++) {
        //    let shortcurtName = shortcuts[i].name.split('|');

        //}
        this.shortcuts = shortcuts;
    }

    private afterDeleteShortcut() {
        this.onQueryStudies();
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
