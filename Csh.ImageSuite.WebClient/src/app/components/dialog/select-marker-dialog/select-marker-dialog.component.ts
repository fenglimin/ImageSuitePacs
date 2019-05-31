import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { DialogService } from "../../../services/dialog.service";
import { ConfigurationService } from "../../../services/configuration.service";
import { MarkerData, MarkerGroupData} from "../../../models/misc-data"

@Component({
  selector: 'app-select-marker-dialog',
  templateUrl: './select-marker-dialog.component.html',
  styleUrls: ['./select-marker-dialog.component.css']
})
export class SelectMarkerDialogComponent {

    baseUrl: string;
    markerGroupList: Array<MarkerGroupData> = [];

    constructor(
        public dialogRef: MatDialogRef<SelectMarkerDialogComponent>,
        private dialogService: DialogService,
        private configService: ConfigurationService) {

        this.baseUrl = this.configService.getBaseUrl();

        this.markerGroupList = this.configService.getMarkerConfig();
    }

    ngOnInit() {
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

    onOkClick(markerData: MarkerData): void {
        this.dialogRef.close(markerData.imageName.substr(0, markerData.imageName.length-4));
    }

    getImageUrl(markerData: MarkerData): string {
        return this.baseUrl + "assets/img/Stamp/" + markerData.imageName;
    }
}
