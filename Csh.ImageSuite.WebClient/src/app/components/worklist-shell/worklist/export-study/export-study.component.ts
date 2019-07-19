import { Component, OnInit, Inject } from '@angular/core';
import { DialogService } from "../../../../services/dialog.service";
import { MAT_DIALOG_DATA, MatDialogRef, MatDatepickerInputEvent } from "@angular/material";
import { MessageBoxType, MessageBoxContent } from "../../../../models/messageBox";
import { Study, Series, Image, StudyTemp, WorklistColumn } from "../../../../models/pssi";
import { WorklistService } from "../../../../services/worklist.service";
import { DatabaseService } from "../../../../services/database.service";
import { DicomImageService } from "../../../../services/dicom-image.service";



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
            this.imageList = new Array<Image>();
            this.imageList = this.seriesList[0].imageList;
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
    }

    ngOnInit() {
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.worklistService.onTransferStudy(this.study);

        this.dialogRef.close();
    }

    refreshImage() {
        this.databaseService.getStudy(this.study.id).subscribe(data => {
                for (let series of data.seriesList) {
                    for (let image of series.imageList) {
                        this.getImageFromService(image);
                    }
                }
            },
            error => {
                console.log(error);
            });
    }

    createImageFromBlob(image: Blob) {
        const reader = new FileReader();
        reader.addEventListener("load",
            () => {
                this.thumbnailToShow = reader.result;
                this.thumbnails.push(this.thumbnailToShow);
            },
            false);

        if (image) {
            reader.readAsDataURL(image);
        }
    }

    getImageFromService(image: Image) {
        this.dicomImageService.getThumbnailFile(image).subscribe(data => {
                this.createImageFromBlob(data);
            },
            error => {
                console.log(error);
            });
    }

    onPacsIconClick() {

    }
}
