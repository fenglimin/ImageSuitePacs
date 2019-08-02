import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Shortcut } from "../models/shortcut";
import { DatabaseService } from "./database.service"
import { ViewerShellData } from "../models/viewer-shell-data";
import { HangingProtocolService } from "./hanging-protocol.service";
import { ShellNavigatorService } from "./shell-navigator.service";
import { Study, RecWorklistData, WorklistColumn, StudyTemp } from "../models/pssi";
import { DataSource } from "../models/shortcut";
import { MessageBoxType, MessageBoxContent, DialogResult } from "../models/messageBox";
import { DialogService } from "./dialog.service";

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
    bDisableLoadImageButton = true;
    bDisableLoadKeyImage = true;
    bDisableChangeImageSeriesOrder = true;
    bDisableReassign = true;
    bDisableTransfer = true;
    bDisableTagEdit = true;
    bDisableDeleteStudy = true;
    bDisableSetReadBtn = true;
    bDisableSetUnreadBtn = true;
    bDisableDeletePreventBtn = true;
    bDisableDeleteAllowBtn = true;

    loadedStudyCount = 0;
    loadedStudy: Study[];
    studyUSBOfflineList: string[];
    popUpStudyOfflineMessage: string;
    isOffline = false;
    checkedSingleStudy: Study;
    checkedStudies: Study[];
    checkedStudiesUids: number[];
    checkedStudiesInstanceUids: string[];
    checkedStudiesCount = 0;
    getStudies: Study[];

    studyOnlineReadyTicketCountMax = 0;
    studyOnlineReadyTicketCount = 0;
    maxStudyOnlineReadyTicketCount = 300;
    checkStudyOnlineReadyStatusInterval = 500;
    sumMaxCheckStudyOnlineReadyCount = 10;

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
        private hangingProtocolService: HangingProtocolService,
        private dialogService: DialogService) {

        this._shortcut = new Shortcut();
        this._shortcut.dataSource = DataSource.MiniPacs;
        this.loadedStudy = new Array<Study>();
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
            this.hangingProtocolService.getDefaultImageHangingProtocol());

        if (this.isUsingLocalTestData()) {
            viewerShellData.addStudy(study);
            this.shellNavigatorService.shellNavigate(viewerShellData);
        } else {
            this.checkedStudiesUids = new Array<number>();
            this.checkedStudiesUids.push(study.id);
            this.databaseService.getStudiesForDcmViewer(this.checkedStudiesUids, this.showHistoryStudies, false).subscribe(value => this.checkOfflineBeforeLoadImage(1, value));
        }
    }

    onShowAllCheckedStudy() {
        if (this.isUsingLocalTestData()) {
            const viewerShellData = new ViewerShellData(this.hangingProtocolService.getDefaultGroupHangingProtocol(),
                this.hangingProtocolService.getDefaultImageHangingProtocol());
            this.studies.forEach(study => {
                if (study.studyChecked) {
                    viewerShellData.addStudy(study);
                }
            });

            this.shellNavigatorService.shellNavigate(viewerShellData);
        } else {

            this.databaseService.getStudiesForDcmViewer(this.checkedStudiesUids, this.showHistoryStudies, false)
                .subscribe(value => this.checkOfflineBeforeLoadImage(this.checkedStudiesCount, value));
        }
    }

    onLoadKeyImage() {
        let checkedCount = 0;
        this.studies.forEach(study => {
            if (study.studyChecked) {
                checkedCount++;
            }
        });

        this.studies.forEach(study => {
            if (study.studyChecked) {
                this.databaseService.getStudiesForDcmViewer(this.checkedStudiesUids, this.showHistoryStudies, true)
                    .subscribe(value => this.studyDetailsLoaded(checkedCount, value));
            }
        });
    }

    onSetRead(study: Study = null) {
        if (study == null) {
            this.studies.forEach(study => {
                if (study.studyChecked) {
                    this.databaseService.setRead(study.studyInstanceUid)
                        .subscribe(() => this.refreshShortcuts());
                }
            });
        } else {
            this.databaseService.setRead(study.studyInstanceUid)
                .subscribe(() => this.refreshShortcuts());
        }
    }

    onSetUnread(study: Study = null) {
        if (study == null) {
            this.studies.forEach(study => {
                if (study.studyChecked) {
                    this.databaseService.setUnread(study.studyInstanceUid)
                        .subscribe(() => this.refreshShortcuts());
                }
            });
        } else {
            this.databaseService.setUnread(study.studyInstanceUid)
                .subscribe(() => this.refreshShortcuts());
        }
    }

    //onGetThumbnailFiles(study: Study) {
    //    this.databaseService.getThumbnailFiles(study)
    //        .subscribe(() => this.refreshShortcuts());
    //}

    onTransferStudy(study: Study) {
        //this.databaseService.transferStudy(study).subscribe(() => this.refreshShortcuts());
    }

    onCheckStudyChanged(study: Study = null) {
        let scanStatusCompletedCount = 0;
        let scanStatusEndedCount = 0;
        let deletePreventCount = 0;
        let deleteAllowCount = 0;
        let checkedStudyCount = 0;
        let onlineStudiesCount = 0;
        let offlineStudiesCount = 0;
        this.checkedStudies = new Array<Study>();
        this.checkedStudiesUids = new Array<number>();
        this.checkedStudiesInstanceUids = new Array<string>();
        this.checkedStudiesCount = 0;
       
        this.studies.forEach(study => {
            if (study.studyChecked) {
                this.checkedStudies.push(study);
                this.checkedStudiesUids.push(study.id);
                this.checkedStudiesInstanceUids.push(study.studyInstanceUid);
                this.checkedStudiesCount++;
                this.checkedSingleStudy = study;

                checkedStudyCount++;

                if (study.scanStatus === "Completed") {
                    scanStatusCompletedCount++;
                }
                else if ((study.scanStatus === "Ended")) {
                    scanStatusEndedCount++;
                }

                if (study.reserved === "N") {
                    deletePreventCount++;
                }
                else if ((study.reserved === "Y")) {
                    deleteAllowCount++;
                }

                if (study.instanceAvailability === "Online") {
                    onlineStudiesCount++;
                }
                else if (study.instanceAvailability === "Offline") {
                    offlineStudiesCount++;
                }
            }
        });

        if (checkedStudyCount === 0) {
            this.initAllButton();
        }
        else {
            // Check Offline Image
            this.checkStudiesIncludeOffline(this.checkedStudiesInstanceUids);

            this.bDisableLoadImageButton = false;
            this.bDisableLoadKeyImage = false;
            this.bDisableChangeImageSeriesOrder = false;
            this.bDisableReassign = false;
            this.bDisableTransfer = false;
            this.bDisableTagEdit = false;
            this.bDisableDeleteStudy = false;

            // Scan Status
            if (scanStatusCompletedCount === 0) {
                this.bDisableSetUnreadBtn = true;
            } else {
                this.bDisableSetUnreadBtn = false;
            }

            if (scanStatusEndedCount === 0) {
                this.bDisableSetReadBtn = true;
            } else {
                this.bDisableSetReadBtn = false;
            }

            if (scanStatusCompletedCount !== 0 && scanStatusEndedCount !== 0) {
                this.bDisableSetReadBtn = true;
                this.bDisableSetUnreadBtn = true;
            }

            // reserved
            if (deletePreventCount === 0) {
                this.bDisableDeletePreventBtn = true;
            } else {
                this.bDisableDeletePreventBtn = false;
            }

            if (deleteAllowCount === 0) {
                this.bDisableDeleteAllowBtn = true;
            } else {
                this.bDisableDeleteAllowBtn = false;
            }

            if (deletePreventCount !== 0 && deleteAllowCount !== 0) {
                this.bDisableDeletePreventBtn = true;
                this.bDisableDeleteAllowBtn = true;
            }

            if (offlineStudiesCount !== 0) {
                this.bDisableDeleteAllowBtn = true;
                this.bDisableDeletePreventBtn = true;
                this.bDisableDeleteStudy = true;
                this.bDisableLoadKeyImage = true;
                this.bDisableReassign = true;
                this.bDisableSetReadBtn = true;
                this.bDisableSetUnreadBtn = true;
                this.bDisableTagEdit = true;
                this.bDisableTransfer = true;
                this.bDisableChangeImageSeriesOrder = true;
            }
        }
    }

    checkStudiesIncludeOffline(checkedStudiesUid) {
        this.databaseService.checkStudiesIncludeOffline(checkedStudiesUid).subscribe(offlineStudiesInfo => this.collectOfflineStudiesInfo(offlineStudiesInfo));;
    }

    collectOfflineStudiesInfo(offlineStudiesInfo) {
        if (offlineStudiesInfo) {
            this.studyUSBOfflineList = offlineStudiesInfo.studyUSBOfflineList;
            this.popUpStudyOfflineMessage = offlineStudiesInfo.popUpStudyOfflineMessage;
            this.isOffline = offlineStudiesInfo.isOffline;
        }
        return offlineStudiesInfo.isOffline;
    }

    onDeletePrevent() {
        this.studies.forEach(study => {
            if (study.studyChecked) {
                this.databaseService.setDeletePrevent(study.studyInstanceUid)
                    .subscribe(() => this.refreshShortcuts());
            }
        });
    }

    onDeleteAllow() {
        this.studies.forEach(study => {
            if (study.studyChecked) {
                this.databaseService.setDeleteAllow(study.studyInstanceUid)
                    .subscribe(() => this.refreshShortcuts());
            }
        });
    }

    onDeleteStudy(deletionReason) {
        this.studies.forEach(study => {
            if (study.studyChecked) {
                this.databaseService.deleteStudy(study.studyInstanceUid, deletionReason)
                    .subscribe(() => this.refreshShortcuts());
            }
        });
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

    onUpdateStudy(study: Study) {
        this.databaseService.updateStudy(study).subscribe(
            value => {
                if (value) {
                    const content = new MessageBoxContent();
                    content.title = "Successful";
                    content.messageText = "Update Patient Information Successfully.";
                    content.messageType = MessageBoxType.Info;

                    this.dialogService.showMessageBox(content).subscribe();
                    this.refreshShortcuts();
                } else {
                    const content = new MessageBoxContent();
                    content.title = "Failed";
                    content.messageText = "Update Patient Information failed.";
                    content.messageType = MessageBoxType.Error;

                    this.dialogService.showMessageBox(content).subscribe();
                }

            }
        );
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    private formatStudies(recWorklistData) {

        var studiesList = recWorklistData.studyList;

        for (let i = 0; i < studiesList.length; i++) {
            studiesList[i].studyChecked = false;
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
        this.initAllButton();
    }

    private studyDetailsLoaded(allCheckedStudyCount: number, getStudies: Study[]) {
        getStudies.forEach(value => {
            if (value) {
                this.loadedStudy.push(value);
            }
        });

        if (this.loadedStudy.length === 0) {
            const content = new MessageBoxContent();
            content.title = "No Key Image";
            content.messageText = "There is no key image!";
            content.messageType = MessageBoxType.Error;

            this.dialogService.showMessageBox(content).subscribe();
            this.loadedStudyCount = 0;

            return;
        }

        const viewerShellData = new ViewerShellData(this.hangingProtocolService.getDefaultGroupHangingProtocol(),
            this.hangingProtocolService.getDefaultImageHangingProtocol());
        this.loadedStudy.forEach(value => {
            value.detailsLoaded = true;
            value.studyChecked = true;
            viewerShellData.addStudy(value);
        });

        this.shellNavigatorService.shellNavigate(viewerShellData);

        this.loadedStudy = new Array<Study>();
        this.loadedStudyCount = 0;

        this.refreshShortcuts();
    }

    private checkOfflineBeforeLoadImage(allCheckedStudyCount: number, getStudies: Study[]) {
        this.getStudies = getStudies;
        this.checkedStudiesCount = this.checkedStudiesCount;
        if (this.isOffline) {
            const content = new MessageBoxContent();
            content.title = "Restore Offline Image";
            content.messageText = this.popUpStudyOfflineMessage;
            content.messageType = MessageBoxType.InfoCancel;
            content.callbackFunction = this.databaseService.studyOfflineInsertCDJobList;
            content.callbackOwner = this.databaseService;
            content.callbackArg = this.checkedStudiesInstanceUids;

            this.dialogService.showMessageBox(content).subscribe(
                val => {
                    if (val.dialogResult === DialogResult.Ok) {
                        this.studyDetailsLoaded(this.checkedStudiesCount, this.getStudies);
                    }
                });
        } else {
            this.studyDetailsLoaded(this.checkedStudiesCount, this.getStudies);
        }
    }

    private initAllButton() {
        this.bDisableLoadImageButton = true;
        this.bDisableLoadKeyImage = true;
        this.bDisableChangeImageSeriesOrder = true;
        this.bDisableReassign = true;
        this.bDisableTransfer = true;
        this.bDisableTagEdit = true;
        this.bDisableDeleteStudy = true;
        this.bDisableSetReadBtn = true;
        this.bDisableSetUnreadBtn = true;
        this.bDisableDeletePreventBtn = true;
        this.bDisableDeleteAllowBtn = true;
    }

}
