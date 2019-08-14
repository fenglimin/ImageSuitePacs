import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { DicomImageService } from "../../../services/dicom-image.service";

@Component({
    selector: 'app-dicom-header-dialog',
    templateUrl: './dicom-header-dialog.component.html',
    styleUrls: ['./dicom-header-dialog.component.css']
})
export class DicomHeaderDialogComponent implements OnInit {

    constructor(public dialogRef: MatDialogRef<DicomHeaderDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dicomImageService: DicomImageService) {

    }

    ngOnInit() {

    }

    onOkClick(): void {
        this.dialogRef.close();
    }
}
