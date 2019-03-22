import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { LocationStrategy } from "@angular/common";

import { ViewerShellData } from "../../../models/viewer-shell-data";
import { Series, Pssi } from "../../../models/pssi";
import { GroupHangingData, ImageHangingData } from "../../../models/hanging-protocol";
import { HangingProtocolService } from "../../../services/hanging-protocol.service";
import { ImageSelectorService } from "../../../services/image-selector.service";

@Component({
    selector: "app-navigation",
    templateUrl: "./navigation.component.html",
    styleUrls: ["./navigation.component.css"]
})
export class NavigationComponent implements OnInit {
    Arr = Array; //Array type captured in a variable
    @Input()
    viewerShellData: ViewerShellData;
    @Output()
    layout = new EventEmitter<number>();

    private baseUrl: string;

    groupLayoutList = ["1X1", "1X2", "2X1", "2X2", "3X3"];
    imageHangingList = ["1X1", "1X2", "2X1", "2X2", "3X3", "3X4", "5X6"];

    selectedGroupHangingData: GroupHangingData;
    selectedGroupLayoutData: GroupHangingData;
    selectedImageLayoutData: ImageHangingData;

    groupLayout = "1X1";
    imageLayout = "1X1";

    constructor(public hangingProtocolService: HangingProtocolService,
        private imageSelectorService: ImageSelectorService,
        private locationStrategy: LocationStrategy) {
        this.selectedGroupHangingData = this.hangingProtocolService.getDefaultGroupHangingData();
        this.selectedGroupLayoutData = this.hangingProtocolService.getDefaultGroupLayoutData();
        this.selectedImageLayoutData = this.hangingProtocolService.getDefaultImageLayoutData();
    }

    ngOnInit() {
        this.baseUrl = window.location.origin + this.locationStrategy.getBaseHref();
    }

    onClickPssi(pssi: Pssi) {
        const hide = !pssi.hide;
        pssi.setHide(hide);
    }

    getPssiVisibility(pssi: Pssi) {
        return (pssi.hide || this.viewerShellData.hide) ? "hidden" : "visible";
    }

    getPssiHeight(pssi: Pssi) {
        return (pssi.hide || this.viewerShellData.hide) ? "0px" : "100%";
    }

    getThumbnailListRowCount(series: Series): number {
        const count = Math.trunc((series.imageList.length + 1) / 2);
        return count;
    }

    getHpMenuBackground(name: string) {
        const background = `url(${this.baseUrl}assets/img/DicomViewer/${name}_N1.gif)`;
        return background;
    }

    onMouseOver(event, triggerClick: boolean) {
        event.target.style.backgroundImage = event.target.style.backgroundImage.replace("N1", "N2");
        if (triggerClick) {
            //event.target.click();
        }
    }

    onMouseOut(event) {
        const imageUrl = event.target.style.backgroundImage.replace("N2", "N1");
        if (imageUrl === event.target.style.backgroundImage) {
            event.target.style.backgroundImage = event.target.style.backgroundImage.replace("N3", "N1");
        } else {
            event.target.style.backgroundImage = imageUrl;
        }
    }

    onMouseDown(event) {
        event.target.style.backgroundImage = event.target.style.backgroundImage.replace("N2", "N3");
    }

    onMouseUp(event) {
        event.target.style.backgroundImage = event.target.style.backgroundImage.replace("N3", "N1");
    }

    onSelectGroupHangingProtocol(groupHangingData: GroupHangingData) {
        this.selectedGroupHangingData = groupHangingData;
        this.layout.emit(this.selectedGroupHangingData.groupHangingProtocol);
    }

    onSelectGroupLayout(groupHangingData: GroupHangingData) {
        this.selectedGroupLayoutData = groupHangingData;
        this.layout.emit(this.selectedGroupLayoutData.groupHangingProtocol);
    }

    onSelectImageLayout(imageLayoutData: ImageHangingData) {
        this.selectedImageLayoutData = imageLayoutData;
        this.imageSelectorService.changeImageLayout(this.selectedImageLayoutData.imageHangingProtocol);
    }
}
