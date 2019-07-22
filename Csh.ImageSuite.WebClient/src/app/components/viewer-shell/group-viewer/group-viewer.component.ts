import { Component, OnInit, Input, AfterContentInit, ViewChildren, QueryList } from "@angular/core";
import { ImageSelectorService } from "../../../services/image-selector.service";
import { ImageInteractionService } from "../../../services/image-interaction.service";
import { ImageInteractionData, ImageInteractionEnum } from "../../../models/image-operation";
import { ImageHangingProtocol } from "../../../models/hanging-protocol";
import { HangingProtocolService } from "../../../services/hanging-protocol.service";
import { Subscription } from "rxjs";
import { ViewerGroupData } from "../../../models/viewer-group-data";
import { ViewerImageData } from "../../../models/viewer-image-data";
import { ImageViewerComponent } from "./image-viewer/image-viewer.component";
import { Image } from "../../../models/pssi";
import { LogService } from "../../../services/log.service";

@Component({
    selector: "app-group-viewer",
    templateUrl: "./group-viewer.component.html",
    styleUrls: ["./group-viewer.component.css"]
})
export class GroupViewerComponent implements OnInit, AfterContentInit {
    Arr = Array; //Array type captured in a variable
    _groupData: ViewerGroupData;
    logPrefix: string;
    pageIndex = 0;
    pageCount: number;

    imageDataList: ViewerImageData[];

    @ViewChildren(ImageViewerComponent)
    childImages: QueryList<ImageViewerComponent>;

    @Input()
    set groupData(groupData: ViewerGroupData) {
        this.logPrefix = "Group" + groupData.getId() + ": ";
        const log = this.logPrefix + "set groupData, protocol is " + ImageHangingProtocol[groupData.imageHangingProtocol];
        this.logService.debug(log);

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
    subscriptionImageInteraction: Subscription;

    constructor(private imageSelectorService: ImageSelectorService,
        private imageInteractionService: ImageInteractionService,
        private hangingProtocolService: HangingProtocolService,
        private logService: LogService) {
        this.subscriptionImageSelection = imageSelectorService.imageSelected$.subscribe(
            viewerImageData => {
                this.doSelectGroup(viewerImageData);
            });

        this.subscriptionImageInteraction = imageInteractionService.imageInteraction$.subscribe(
            imageInteractionData => {
                this.doImageInteraction(imageInteractionData);
            });

        this.subscriptionThumbnailSelection = imageSelectorService.thumbnailSelected$.subscribe(
            image => {
                this.doSelectGroupByThumbnail(image);
            });

        this.subscriptionImageLayoutChange = imageSelectorService.imageLayoutChanged$.subscribe(
            imageLayoutStyle => {
                this.onChangeImageLayout(imageLayoutStyle);
            });

        this.logService.debug("Group: a new GroupViewerComponent is created!");
    }

    ngOnInit() {

    }

    ngAfterContentInit() {
    }

    ngAfterViewChecked() {
        if (this.childImages) {
            this.setHeight(this.childImages.first.canvas.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.clientHeight);

            this.childImages.forEach(child => child.adjustHeight());
        }
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
        if (this.childImages)
        {
            this.childImages.forEach(child => child.setHeight(0));
        }
        
        this.hangingProtocolService.applyImageHangingProtocol(this.groupData, imageLayoutStyle);
        this.imageDataList = this.groupData.imageDataList;
        this.pageIndex = 0;
        this.pageCount = this.groupData.getPageCount();
        this.onResize();
    }

    getId(): string {
        return `DivLayoutViewer${this.groupData.getId()}`;
    }

    onResize() {
        if (!this.childImages)
            return;

        this.logService.debug("Group: onResize()");

        this.childImages.forEach((imageViewer, index) => {
            
            imageViewer.onResize();
        });
    }

    getImageData(rowIndex: number, colIndex: number): ViewerImageData {
        return this.groupData.getImage(this.pageIndex, rowIndex, colIndex);
    }

    setHeight(height: number) {
        const o = document.getElementById(this.getId());
        if (o !== undefined && o !== null) {
            if (this.childImages) {
                this.childImages.forEach(child => child.setHeight(0));
            }

            o.style.height = height.toString() + "px";

        }
    }

    saveSelectedImage() {
        this.childImages.forEach(imageViewer => {
            if (imageViewer.selected) {
                imageViewer.saveImage();
            }
        });
    }

    doNavigate(up: boolean) {
        if (!this.selected) {
            return;
        }

        if (up) {
            if (this.pageIndex > 0) {
                this.pageIndex--;
            }
        } else {
            if (this.pageIndex < this.pageCount - 1) {
                this.pageIndex++;
            }
        }
    }

    doImageInteraction(imageInteractionData: ImageInteractionData) {
        const itsMe = imageInteractionData.sameGroup(this.groupData);

        switch (imageInteractionData.getType()) {
            case ImageInteractionEnum.NavigationImageInGroup:
                if (itsMe) {
                    this.doNavigate(imageInteractionData.getPara());
                }
                
                break;
        }
    }
}