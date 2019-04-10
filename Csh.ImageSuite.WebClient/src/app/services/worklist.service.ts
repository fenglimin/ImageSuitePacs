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
    displayedColumns: string[] = [];
    colPropertys: string[] = [];
    studyValues:Array<string> = new Array<string>();
    allStudyList: Array<Array<string>> = new Array<Array<string>>();


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
        this.shortcut.studyDate = 'Today';
        this.onQueryStudies(1);
    }

    onQueryStudyByShortcut(shortcut: Shortcut) {
        this.shortcut = shortcut;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    private formatStudies(recWorklistData) {
        this.allStudyList = new Array<Array<string>>();
        var studiesList = recWorklistData.studyList;
        for (let i = 0; i < studiesList.length; i++) {
            studiesList[i].checked = false;
            studiesList[i].detailsLoaded = false;
            for (let j = 0; j < studiesList[i].seriesList.length; j++) {
                studiesList[i].seriesList[j].study = studiesList[i];
            }
        }

        

        this.studies = studiesList;
        this.pageCount = recWorklistData.pageCount;
        this.worklistColumns = recWorklistData.worklistColumns;

        for (let study of studiesList) {
            for (let worklistColumn of recWorklistData.worklistColumns) {
                
                worklistColumn.shortcutType = this.shortcut;
                worklistColumn.studyCol = study;
                //switch (worklistColumn.columnId) {
                //    case "patientId":
                //        this.studyValues.push(study.patient.patientId);
                //        worklistColumn.columnId = "patientId";
                //        break;
                //    case "patientName":
                //        this.studyValues.push(study.patient.patientName);
                //        break;
                //    case "patientSex":
                //        this.studyValues.push(study.patient.patientSex);
                //        break;
                //    case "printed":
                //        this.studyValues.push(study.printed);
                //        break;
                //    case "accessionNo":
                //        this.studyValues.push(study.accessionNo);
                //        break;
                //    case "PatientAge":
                //        this.studyValues.push(study.patient.patientAge);
                //        break;
                //    case "PatientBirthDate":
                //        this.studyValues.push(study.patient.patientBirthDate);
                //        break;
                //    case "Modality":
                //        this.studyValues.push(study.modality);
                //        worklistColumn.controlType = "DropDownList";
                //        worklistColumn.valueList = { CR: "CR", CT: "CT", DX: "DX", MG: "MG", MR: "MR", OT: "OT", US:"US"};
                //        break;
                //    case "StudyDate":
                //        this.studyValues.push(study.studyDate);
                //        break;
                //    case "StudyTime":
                //        this.studyValues.push(study.studyTime);
                //        break;
                //    case "BodyPartExamined":
                //        this.studyValues.push(study.patient.bodyExpansion);
                //        break;
                //    case "StudyDescription":
                //        this.studyValues.push(study.studyDescription);
                //        break;
                //    case "StudyID":
                //        this.studyValues.push(study.studyId);
                //        break;
                //    case "NumberOfStudyRelatedSeries":
                //        this.studyValues.push(study.seriesCount);
                //        break;
                //    case "NumberOfStudyRelatedInstances":
                //        this.studyValues.push(study.imageCount);
                //        break;
                //    case "Reserved":
                //        this.studyValues.push(study.reserved);
                //        break;
                //    case "Readed":
                //        this.studyValues.push(study.readed);
                //        break;
                //    case "ReferringPhysiciansName":
                //        this.studyValues.push(study.referPhysician);
                //        break;
                //    case "InstanceAvailability":
                //        this.studyValues.push(study.instanceAvailability);
                //        break;
                //    case "AdditionalPatientHistory":
                //        this.studyValues.push(study.additionalPatientHistory);
                //        break;
                //    case "ScanStatus":
                //        this.studyValues.push(study.scanStatus);
                //        break;
                //    case "AccessGroups":
                //        this.studyValues.push("");
                //        break;
                //    case "Send":
                //        this.studyValues.push(study.send);
                //        break;
                //    default: 
                //        break; 
                //}
            }
            this.allStudyList.push(this.studyValues);
            this.studyValues = new Array<string>();

        }

        


        

        //this.colPropertys.push("study.patient.patientId");


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
