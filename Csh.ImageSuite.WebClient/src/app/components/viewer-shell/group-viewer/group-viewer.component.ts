import { Component, OnInit, Input, AfterContentInit, ViewChildren, QueryList } from "@angular/core";
import { ImageInteractionService } from "../../../services/image-interaction.service";
import { ImageInteractionData, ImageInteractionEnum } from "../../../models/image-operation";
import { ImageOperationData, ImageOperationEnum, ImageContextEnum } from "../../../models/image-operation";
import { ImageOperationService } from "../../../services/image-operation.service";
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

    @ViewChildren(ImageViewerComponent)
    childImages: QueryList<ImageViewerComponent>;

    @Input()
    set groupData(groupData: ViewerGroupData) {
        this.logPrefix = "Group" + groupData.getId() + ": ";
        const log = this.logPrefix + "set groupData, protocol is " + ImageHangingProtocol[groupData.imageHangingProtocol];
        this.logService.debug(log);

        if (this._groupData) {
            this._groupData.hide = true;
        }

        groupData.hide = false;
        this._groupData = groupData;    
        
        this.setImageLayout(this.groupData.imageHangingProtocol);
    }

    get groupData() {
        return this._groupData;
    }

    private subscriptionImageInteraction: Subscription;
    private subscriptionImageOperation: Subscription;

    constructor(private imageInteractionService: ImageInteractionService,
        private imageOperationService: ImageOperationService,
        private hangingProtocolService: HangingProtocolService,
        private logService: LogService) {

        this.subscriptionImageInteraction = imageInteractionService.imageInteraction$.subscribe(
            imageInteractionData => {
                this.onImageInteraction(imageInteractionData);
            });

        this.subscriptionImageOperation = imageOperationService.imageOperation$.subscribe(
            imageOperationData => {
                this.onImageOperation(imageOperationData);
            });

        this.logService.debug("Group: a new GroupViewerComponent is created!");
    }

    ngOnInit() {

    }

    ngAfterContentInit() {
    }

    ngAfterViewChecked() {
        if (this.childImages.length !== 0) {
            this.setHeight(this.childImages.first.canvas.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.clientHeight);
            this.childImages.forEach(child => child.adjustHeight());
            //this.logService.debug("Group:  ngAfterViewChecked");
        }
    }

    isSelected() {
        return this._groupData.selected;
    }

    getBorderStyle(): string {
        return this._groupData.selected ? "1px solid green" : "1px solid #555555";
    }

    getId(): string {
        return `DivLayoutViewer${this.groupData.getId()}`;
    }

    onResize() {
        if (!this.childImages || this.childImages.length === 0)
            return;

        this.logService.debug("Group: onResize()");

        this.childImages.forEach((imageViewer, index) => {
            
            imageViewer.onResize();
        });
    }

    getImageData(rowIndex: number, colIndex: number): ViewerImageData {
        return this.groupData.getImage(rowIndex, colIndex);
    }

    setHeight(height: number) {
        const o = document.getElementById(this.getId());
        if (o !== undefined && o !== null) {
            if (this.childImages.length !== 0) {
                this.childImages.forEach(child => child.setHeight(0));
            }

            o.style.height = height.toString() + "px";

        }
    }

    saveSelectedImage() {
        this.childImages.forEach(imageViewer => {
            if (imageViewer.isSelected()) {
                imageViewer.saveImage();
            }
        });
    }

    //setSelected(selected: boolean) {
    //    this._groupData.selected = selected;
    //    this.childImages.forEach(imageViewer => {
    //        imageViewer.setSelected(selected);
    //    });
    //}

    private onChangeImageLayout(imageLayoutStyle: number): void {
        if (this._groupData.selected) {
            this.setImageLayout(imageLayoutStyle);
        }
    }

    private setImageLayout(imageLayoutStyle: number): void {
        if (this.childImages) {
            this.childImages.forEach(child => child.setHeight(0));
        }

        this.hangingProtocolService.applyImageHangingProtocol(this.groupData, imageLayoutStyle);
        this.onResize();
    }

    private doSelectGroup(viewerGroupData: ViewerGroupData) {
        this._groupData.selected = (this._groupData === viewerGroupData);
    }

    private doSelectGroupByThumbnail(image: Image) {
        const result = this._groupData.getViewerImageDataByImage(image);
        this._groupData.selected = (result !== undefined);
    }

    private onImageInteraction(imageInteractionData: ImageInteractionData) {
        if (!imageInteractionData.sameShellData(this.groupData.viewerShellData)) {
            return;
        }

        switch (imageInteractionData.getType()) {
            //case ImageInteractionEnum.NavigationImageInGroup:
            //    if (imageInteractionData.sameGroupData(this.groupData)) {
            //        this.doNavigate(imageInteractionData.getPara());
            //    }
            //    break;

            case ImageInteractionEnum.SelectThumbnailInNavigator:
                this.doSelectGroupByThumbnail(imageInteractionData.getPssiImage());
                break;

            case ImageInteractionEnum.ChangeImageLayoutForSelectedGroup:
                this.onChangeImageLayout(imageInteractionData.getPara());
                break;
        }
    }

    private onImageOperation(imageOperationData: ImageOperationData) {
        if (!imageOperationData.needResponse(this.groupData.viewerShellData.getId(), this._groupData.selected))
            return;

        //switch (imageOperationData.operationType) {
        //case ImageOperationEnum.SelectAllImages:
        //    this.doSelectGroup(this.groupData);
        //    break;
        //}
    }
}