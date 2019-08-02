import { Component, OnInit, ViewChildren, QueryList, AfterViewInit } from "@angular/core";
import { AnnType } from "../../models/annotation";
import { GroupViewerComponent } from "./group-viewer/group-viewer.component";
import { ShellNavigatorService } from "../../services/shell-navigator.service";
import { HangingProtocolService } from "../../services/hanging-protocol.service";
import { Subscription } from "rxjs";
import { ViewerShellData } from "../../models/viewer-shell-data";
import { ViewerGroupData } from "../../models/viewer-group-data";
import { LogService } from "../../services/log.service";
import { ImageOperationData, ImageOperationEnum, ImageContextData, ImageContextEnum } from "../../models/image-operation";
import { ImageOperationService } from "../../services/image-operation.service";
import { WindowLevelData } from "../../models/dailog-data/image-process";
import { DialogService } from "../../services/dialog.service";
import { ManualWlDialogComponent } from "../../components/dialog/manual-wl-dialog/manual-wl-dialog.component";
import { SelectMarkerDialogComponent } from "../../components/dialog/select-marker-dialog/select-marker-dialog.component";

@Component({
    selector: "app-viewer-shell",
    templateUrl: "./viewer-shell.component.html",
    styleUrls: ["./viewer-shell.component.css"] 
})
export class ViewerShellComponent implements OnInit, AfterViewInit {
    Arr = Array; //Array type captured in a variable

    viewerShellData: ViewerShellData;
    pageIndex = 0;
    pageCount: number;

    subscriptionShellNavigated: Subscription;
    private subscriptionImageOperation: Subscription;

    viewerGroupData: ViewerGroupData;

    @ViewChildren(GroupViewerComponent)
    childGroups: QueryList<GroupViewerComponent>;

    constructor(private shellNavigatorService: ShellNavigatorService,
        private imageOperationService: ImageOperationService,
        private hangingProtocolService: HangingProtocolService,
        private dialogService: DialogService,
        private logService: LogService) {
        this.subscriptionShellNavigated = shellNavigatorService.shellSelected$.subscribe(
            viewerShellData => {
                this.viewerShellData.hide =
                    (viewerShellData === null || viewerShellData.getId() !== this.viewerShellData.getId());
            });

        this.subscriptionImageOperation = imageOperationService.imageOperation$.subscribe(
            imageOperationData => {
                this.onImageOperation(imageOperationData);
            });
    }

    ngOnInit() {
        this.onChangeGroupLayout(this.viewerShellData.defaultGroupHangingProtocol);
    }

    ngAfterViewInit() {
        const self = this;
        $(".sp_panel-left").spResizable({
            handleSelector: ".sp_splitter",
            resizeHeight: false
        });

        $(window).resize(function() {
            self.onResize();
        });

        this.onResize();
    }

    onChangeGroupLayout(groupHangingProtocolNumber: number): void {
        if (this.childGroups) {
            this.childGroups.forEach(child => child.setHeight(0));
        }

        this.hangingProtocolService.applyGroupHangingProtocol(this.viewerShellData, groupHangingProtocolNumber);
        this.pageIndex = 0;
        this.pageCount = this.viewerShellData.getPageCount();
        this.onResize();
    }

    onResize(): void {
        //if (this.viewerShellData.hide)
        //    return;

        if (!this.childGroups)
            return;

        if (this.childGroups) {
            this.childGroups.forEach(child => child.setHeight(0));
        }

        this.logService.debug("Viewer: onResize()");

        this.childGroups.forEach((groupViewer) => {
            groupViewer.onResize();
        });
    }

    getGroupData(rowIndex: number, colIndex: number): ViewerGroupData {
        return this.viewerShellData.getGroup(this.pageIndex, rowIndex, colIndex);
    }

    onSaveImage(event) {
        this.childGroups.forEach(groupViewer => {
            if (groupViewer.isSelected()) {
                groupViewer.saveSelectedImage();
            }
        });
    }

    onNavigateGroup(delta) {
        this.pageIndex += delta;
    }

    private onImageOperation(imageOperationData: ImageOperationData) {
        if (!imageOperationData.needResponse(this.viewerShellData.getId(), true))
            return;

        switch (imageOperationData.operationType) {
            case ImageOperationEnum.SelectAllImages:
                this.viewerShellData.selectAllImages(true);
                break;

            case ImageOperationEnum.SelectAllImagesInSelectedGroup:
                this.viewerShellData.selectAllImagesInFirstShownAndSelectedGroup();
                break;

            case ImageOperationEnum.SelectAllVisibleImages:
                this.viewerShellData.selectAllVisibleImages();
                break;

            case ImageOperationEnum.SelectAllVisibleImagesInSelectedGroup:
                this.viewerShellData.selectAllVisibleImagesInFirstShownAndSelectedGroup();
                break;

            case ImageOperationEnum.SelectOneImageInSelectedGroup:
                this.viewerShellData.selectFirstShowImageInFirstShownGroup();
                break;

            case ImageOperationEnum.ClickImageInViewer:
                this.viewerShellData.clickImage(this.imageOperationService.getShellImageSelectType(this.viewerShellData.getId()), imageOperationData.operationPara);
                break;

            case ImageOperationEnum.DisplayImageInGroup:
                imageOperationData.operationPara.viewerImageData.groupData.displayImage(this.imageOperationService.getShellImageSelectType(this.viewerShellData.getId()), imageOperationData.operationPara.index);
                break;

            case ImageOperationEnum.ManualWlSelectedImage:
                this.doManualWl();
                break;

            case ImageOperationEnum.MoveSelectedImage:
                this.doMove(imageOperationData.operationPara);
                break;

            case ImageOperationEnum.ZoomSelectedImage:
                this.doZoom(imageOperationData.operationPara);
                break;

            case ImageOperationEnum.WlSelectedImage:
                this.doWl(imageOperationData.operationPara);
                break;

            case ImageOperationEnum.SetContext:
                this.setContext(imageOperationData);
                break;
        }
    }

    doManualWl() {

        const windowLevelData = new WindowLevelData();
        windowLevelData.windowCenter = 4096;
        windowLevelData.windowWidth = 2048;
        this.dialogService.showDialog(ManualWlDialogComponent, windowLevelData).subscribe(
            val => {
                if (val) {
                    this.childGroups.forEach(groupViewer => {
                        if (groupViewer.groupData.isSelected()) {
                            groupViewer.childImages.forEach(imageViewer => {
                                if (imageViewer.imageData.selected) {
                                    imageViewer.doWlByValue(val.windowCenter, val.windowWidth);
                                }
                            });
                        }
                    });
                    
                }
            }
        );
    }

    private doMove(movePara: any) {
        this.childGroups.forEach(groupViewer => {
            if (groupViewer.groupData.isSelected()) {
                groupViewer.childImages.forEach(imageViewer => {
                    if (imageViewer.imageData.selected && imageViewer.imageData !== movePara.viewerImageData) {
                        imageViewer.translate(movePara.deltaX, movePara.deltaY);
                        imageViewer.refresh();
                    }
                });
            }
        });
    }

    private doZoom(zoomPara: any) {
        this.childGroups.forEach(groupViewer => {
            if (groupViewer.groupData.isSelected()) {
                groupViewer.childImages.forEach(imageViewer => {
                    if (imageViewer.imageData.selected && imageViewer.imageData !== zoomPara.viewerImageData) {
                        imageViewer.doZoom(zoomPara.zoomOut, zoomPara.zoomPoint, false);
                        imageViewer.refresh();
                    }
                });
            }
        });
    }

    private doWl(wlPara: any) {
        this.childGroups.forEach(groupViewer => {
            if (groupViewer.groupData.isSelected()) {
                groupViewer.childImages.forEach(imageViewer => {
                    if (imageViewer.imageData.selected && imageViewer.imageData !== wlPara.viewerImageData) {
                        imageViewer.doWl(wlPara.deltaX, wlPara.deltaY, false);
                        imageViewer.refresh();
                    }
                });
            }
        });
    }

    setContext(imageOperationData: ImageOperationData) {
        const imageContextData = imageOperationData.operationPara as ImageContextData;
        if (imageContextData.imageContextType === ImageContextEnum.CreateAnn && imageContextData.imageContextPara === AnnType.Stamp) {
            this.dialogService.showDialog(SelectMarkerDialogComponent, undefined).subscribe(
                stampFileName => {
                    if (stampFileName) {
                        this.imageOperationService.setShellStampFileName(imageOperationData.shellId, stampFileName);
                    }
                }
            );
        }
    }
}
