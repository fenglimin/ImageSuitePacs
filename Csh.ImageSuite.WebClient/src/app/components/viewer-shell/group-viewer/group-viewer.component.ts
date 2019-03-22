import { Component, OnInit, Input, AfterContentInit, ViewChildren, QueryList } from "@angular/core";
import { ImageSelectorService } from "../../../services/image-selector.service";
import { HangingProtocolService } from "../../../services/hanging-protocol.service";
import { Subscription } from "rxjs";
import { ViewerGroupData } from "../../../models/viewer-group-data";
import { ViewerImageData } from "../../../models/viewer-image-data";
import { ImageViewerComponent } from "./image-viewer/image-viewer.component";
import { Image } from "../../../models/pssi";

@Component({
    selector: "app-group-viewer",
    templateUrl: "./group-viewer.component.html",
    styleUrls: ["./group-viewer.component.css"]
})
export class GroupViewerComponent implements OnInit, AfterContentInit {
    Arr = Array; //Array type captured in a variable
    _groupData: ViewerGroupData;

    @ViewChildren(ImageViewerComponent)
    childImages: QueryList<ImageViewerComponent>;

    @Input()
    set groupData(groupData: ViewerGroupData) {
        this._groupData = groupData;
        this.setImageLayout(this.groupData.imageHangingProtocol);
    }

    get groupData() {
        return this._groupData;
    }

    selected = false;

    subscriptionThumbnailSelection: Subscription;
    subscriptionImageSelection: Subscription;
    subscriptionImageLayoutChange: Subscription;

    constructor(private imageSelectorService: ImageSelectorService,
        private hangingProtocolService: HangingProtocolService) {
        this.subscriptionImageSelection = imageSelectorService.imageSelected$.subscribe(
            viewerImageData => {
                this.doSelectGroup(viewerImageData);
            });

        this.subscriptionThumbnailSelection = imageSelectorService.thumbnailSelected$.subscribe(
            image => {
                this.doSelectGroupByThumbnail(image);
            });

        this.subscriptionImageLayoutChange = imageSelectorService.imageLayoutChanged$.subscribe(
            imageLayoutStyle => {
                this.onChangeImageLayout(imageLayoutStyle);
            });
    }

    ngOnInit() {

    }

    ngAfterContentInit() {
    }

    onSelected() {
    }

    doSelectGroup(viewerImageData: ViewerImageData) {
        this.selected = (this._groupData === viewerImageData.groupData);
    }

    doSelectGroupByThumbnail(image: Image) {
        const find = this._groupData.imageDataList.find(imageData => imageData.image === image);
        this.selected = (find !== undefined);
    }

    getBorderStyle(): string {
        return this.selected ? "1px solid green" : "1px solid #555555";
    }

    //doSelectById(id: string, selected: boolean): void {
    //  const o = document.getElementById(id);
    //  if (o !== undefined && o !== null) {
    //    o.style.border = selected ? '1px solid yellow' : '1px solid #555555';
    //  }
    //}

    //doSelectByImageViewerId(imageViewerId: string): void {
    //  const id = this.groupData.getId();
    //  this.selected = imageViewerId.startsWith(id);
    //  var divId = 'DivLayoutViewer' + id;

    //  this.doSelectById(divId, this.selected);
    //}

    onChangeImageLayout(imageLayoutStyle: number): void {
        if (this.selected) {
            this.setImageLayout(imageLayoutStyle);
        }
    }

    setImageLayout(imageLayoutStyle: number): void {
        this.hangingProtocolService.applyImageHangingProtocol(this.groupData, imageLayoutStyle);
        this.onResize();
    }

    getId(): string {
        return `DivLayoutViewer${this.groupData.getId()}`;
    }

    onResize() {
        if (!this.childImages)
            return;

        this.childImages.forEach((imageViewer, index) => {
            imageViewer.onResize();
        });
    }
}
