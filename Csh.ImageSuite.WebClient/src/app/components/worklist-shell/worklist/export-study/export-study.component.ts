import { Component, OnInit, Inject, ViewChildren, QueryList } from '@angular/core';
import { DialogService } from "../../../../services/dialog.service";
import { MAT_DIALOG_DATA, MatDialogRef, MatDatepickerInputEvent } from "@angular/material";
import { MessageBoxType, MessageBoxContent } from "../../../../models/messageBox";
import { Study, Series, Image, StudyTemp, WorklistColumn, OtherPacs } from "../../../../models/pssi";
import { WorklistService } from "../../../../services/worklist.service";
import { DatabaseService } from "../../../../services/database.service";
import { DicomImageService } from "../../../../services/dicom-image.service";
import { ThumbnailComponent } from "../../../viewer-shell/navigation/thumbnail/thumbnail.component";


@Component({
  selector: 'app-export-study',
  templateUrl: './export-study.component.html',
  styleUrls: ['./export-study.component.less']
})
export class ExportStudyComponent {
    studyNumber: number = 0;
    studies: Study[];
    study: Study;
    imageList: Image[];
    seriesList : Series[];
    thumbnailToShow: any;
    _image: Image;
    thumbnails: any[];
    checkedImages: Image[];
    checkedOtherPacs: OtherPacs[];
    isCheckAll: boolean = true;
    isCheckedAllModel: boolean = true;
    isCompression: boolean = false;
    isNoCheckedImage: boolean = true;
    isNoCheckedPacs: boolean = true;


    isRemovePatientInfo: boolean = true;
    isRemoveInstitutionName: boolean = true;
    isIncludeCdViewer: boolean = true;
    isIncludeCdBurningTool: boolean = true;

    isShowPacs: boolean = true;
    isCreateNewGuid: boolean = true;

    transferCompressList: any;
    selectedTransferCompress : string;

    pacsList: OtherPacs[];

    @ViewChildren(ThumbnailComponent)
    childImages: QueryList<ThumbnailComponent>;

    constructor(
        public worklistService: WorklistService,
        public databaseService: DatabaseService,
        public dicomImageService: DicomImageService,
        public dialogRef: MatDialogRef<ExportStudyComponent>,
        @Inject(MAT_DIALOG_DATA) studies: Study[],
        private dialogService: DialogService) {
            this.studyNumber = studies.length;
            this.studies = new Array<Study>();
            this.studies = studies;
            this.study = studies[0];
            this.seriesList = new Array<Series>();
            this.seriesList = this.study.seriesList;
            this._image = new Image();
            this._image.id = this.seriesList[0].seriesNo;
            this.thumbnails = new Array<any>();

            // Remove Study in Series for circular json issue
            for (let i = 0; i < this.study.seriesList.length; i++) {
                let seriesTemp = this.study.seriesList[i];
                seriesTemp.study = new Study();
                this.study.seriesList[i] = seriesTemp;
            }

            this.refreshImage();

            this.getPacsList();

            this.databaseService.getTransferCompress().subscribe(ret => {
                this.transferCompressList = ret;
                this.selectedTransferCompress = "1";

            });

    }

    ngOnInit() {
        
    }

    ngAfterViewInit() {
        this.checkAllImages();
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        
        if (this.isShowPacs) {
            this.checkedImages = new Array<Image>();
            this.checkedOtherPacs = new Array<OtherPacs>();

            this.childImages.forEach(child => {
                if (child.isSelected()) {
                    this.checkedImages.push(child.image);
                }
            });

            for (let pacs of this.pacsList) {
                if (pacs.pacsChecked === true) {
                    this.checkedOtherPacs.push(pacs);
                }
            }

            let compressType: string;
            if (!this.isCompression) {
                compressType = "-1";
            } else {
                compressType = this.selectedTransferCompress;
            }

            this.databaseService.doTransfer(this.studies,
                this.seriesList,
                this.checkedImages,
                this.checkedOtherPacs,
                this.isCheckAll,
                compressType,
                this.isCreateNewGuid).subscribe();
        } else {
            let strLastExportPatientInfoConfig = "8";

            if (!this.isRemovePatientInfo && !this.isRemoveInstitutionName) {
                strLastExportPatientInfoConfig = "7";
            }
            else if (!this.isRemovePatientInfo && this.isRemoveInstitutionName) {
                strLastExportPatientInfoConfig = "6";
            }
            else if (this.isRemovePatientInfo && !this.isRemoveInstitutionName) {
                strLastExportPatientInfoConfig = "1";
            }
            else if (this.isRemovePatientInfo && this.isRemoveInstitutionName) {
                strLastExportPatientInfoConfig = "8";
            }

        }

        
        this.dialogRef.close();
    }

    refreshImage() {
        this.databaseService.getStudy(this.study.id).subscribe(data => {
                this.imageList = new Array<Image>();
                for (let series of data.seriesList) {
                    for (let image of series.imageList) {
                        this.imageList.push(image);
                    }
                }
            },
            error => {
                console.log(error);
            });
    }

    onPacsIconClick() {
        this.isShowPacs = true;
    }

    onMediaIconClick() {
        this.isShowPacs = false;
    }

    checkAllImages() {
        this.isCheckAll = !this.isCheckedAllModel;

        if (this.childImages.length === 0) {
            this.childImages.changes.subscribe(() => {
                this.setCheckAllImages();
            });
        } else {
            this.setCheckAllImages();
        }
    }

    setCheckAllImages() {
        if (!this.isCheckedAllModel) {
            this.childImages.forEach(child => child.setSelect(true));
            this.isCheckedAllModel = true;
        } else {
            this.childImages.forEach(child => child.setSelect(false));
            this.isCheckedAllModel = false;
        }

        this.setIsCheckedImage();
    }

    getPacsList() {
        this.databaseService.getOtherPacs().subscribe(pacsList => {
            this.pacsList = new Array();
            this.pacsList = pacsList;
        });
    }

    appThumbnailClicked() {
        this.isCheckedAllModel = true;

        if (this.childImages.length !== 0) {
            this.childImages.forEach(child => {
                if (!child.isSelected()) {
                    this.isCheckedAllModel = false;

                }
            });
        }

        this.setIsCheckedImage();
    }

    setIsCheckedImage() {
        this.isNoCheckedImage = true;
        this.childImages.forEach(child => {
            if (child.isSelected()) {
                this.isNoCheckedImage = false;
            } 
        });
    }

    onPacsCheckChanged() {
        this.isNoCheckedPacs = true;

        for (let pacs of this.pacsList) {
            if (pacs.pacsChecked) {
                this.isNoCheckedPacs = false;
                break;
            }
        }
    }
}
