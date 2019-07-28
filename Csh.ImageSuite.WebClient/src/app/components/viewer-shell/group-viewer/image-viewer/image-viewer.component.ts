import { Component, OnInit, Input, AfterContentInit, ViewChild, ElementRef, NgZone } from "@angular/core";
import { Location, LocationStrategy, PathLocationStrategy } from "@angular/common";
import { ImageInteractionService } from "../../../../services/image-interaction.service";
import { ImageInteractionData, ImageInteractionEnum } from "../../../../models/image-operation";
import { DicomImageService } from "../../../../services/dicom-image.service";
import { AnnotationService } from "../../../../services/annotation.service";
import { ImageOperationData, ImageOperationEnum, ImageContextEnum } from "../../../../models/image-operation";
import { ImageOperationService } from "../../../../services/image-operation.service";
import { ViewContextEnum, ViewContext, OperationEnum, OperationData, ViewContextService } from "../../../../services/view-context.service"
import { Subscription } from "rxjs";
import { Image as DicomImage } from "../../../../models/pssi";
import { ViewerImageData } from "../../../../models/viewer-image-data";
import { WorklistService } from "../../../../services/worklist.service";
import { ConfigurationService } from "../../../../services/configuration.service";
import { DialogService } from "../../../../services/dialog.service";
import { LogService } from "../../../../services/log.service";
import { WindowLevelData } from "../../../../models/dailog-data/image-process";
import { ManualWlDialogComponent } from "../../../dialog/manual-wl-dialog/manual-wl-dialog.component";
import { SelectMarkerDialogComponent } from "../../../dialog/select-marker-dialog/select-marker-dialog.component";
import { FontData } from "../../../../models/misc-data"
import { MessageBoxType, MessageBoxContent, DialogResult } from "../../../../models/messageBox";
import { IImageViewer } from "../../../../interfaces/image-viewer-interface";
import { Point, MouseEventType, AnnType, Rectangle } from "../../../../models/annotation";
import { AnnObject } from "../../../../annotation/ann-object";
import { AnnTool } from "../../../../annotation/ann-tool";
import { AnnText } from "../../../../annotation/extend-object/ann-text";
import { AnnExtendObject } from "../../../../annotation/extend-object/ann-extend-object";
import { AnnGuide } from "../../../../annotation/layer-object/ann-guide";
import { AnnImageRuler } from "../../../../annotation/layer-object/ann-image-ruler";
import { AnnImage } from "../../../../annotation/extend-object/ann-image";
import { AnnSerialize } from "../../../../annotation/ann-serialize";
import { AnnGraphicOverlay } from "../../../../annotation/layer-object/ann-graphic-overlay";
import { AnnTextOverlay } from "../../../../annotation/layer-object/ann-text-overlay";
import { AnnMagnify } from "../../../../annotation/layer-object/ann-magnify";
import { AnnBaseRectangle } from "../../../../annotation/base-object/ann-base-rectangle";

@Component({
    selector: "app-image-viewer",
    templateUrl: "./image-viewer.component.html",
    styleUrls: ["./image-viewer.component.css"],
    providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }]
})
export class ImageViewerComponent implements OnInit, AfterContentInit, IImageViewer {
    private _imageData: ViewerImageData;
    private image: DicomImage;
    private isImageLoaded: boolean;
    private needResize = false;
    private dragging = false;

    private baseUrl: string;
    private isViewInited: boolean;

    private subscriptionImageLayoutChange: Subscription;
    private subscriptionViewContextChange: Subscription;
    private subscriptionOperation: Subscription;
    private subscriptionImageInteraction: Subscription;
    private subscriptionImageOperation: Subscription;

    @ViewChild("viewerCanvas")
    private canvasRef: ElementRef;
    public canvas;

    @ViewChild("helpElement")
    private helpElementRef: ElementRef;
    private helpElement;
    private cornerstoneEnabled: boolean;

    //layers
    private imgLayer: any;
    private imgLayerId: string;
    private annLayer: any;
    private annLayerId: string;
    private annLabelLayer: any;
    private annLabelLayerId: string;
    private mgLayer: any;
    private mgLayerId: string;
    private olLayer: any;
    private olLayerId: string;
    private imgRulerLayer: any;
    private imgRulerLayerId: string;
    private tooltipLayer: any;
    private tooltipLayerId: string;

    private jcImage: any;
    private jcanvas: any;


    private mouseEventHelper: any = {};
    private eventHandlers: any = {};

    private originalWindowWidth: number;
    private originalWindowCenter: number;

    private waitingLabel: any;
    private logPrefix: string;
    private curSelectObj: AnnExtendObject;
    private ctrlKeyPressed = false;

    private annObjList = [];
    private annMagnify: AnnMagnify;
    private annGraphicOverlay: AnnGraphicOverlay;
    private annTextOverlay: AnnTextOverlay;
    private annGuide: AnnGuide;
    private annImageRuler: AnnImageRuler;
    private annSerialize: AnnSerialize;

    private annRoiRectangle: AnnBaseRectangle;

    @Input()
    set imageData(imageData: ViewerImageData) {
        this.logPrefix = "Image" + imageData.getId() + ": ";
        const log = this.logPrefix + "set imageData, image " + (imageData.image === null ? "is null" : `id is ${imageData.image.id}`);
        this.logService.debug(log);

        if (this._imageData !== imageData) {
            // We will start to show a new image in this viewer, need to delete all artifacts already drawn for the old image
            this.deleteAll();
            this.disableCornerstone();
            if (this._imageData) {
                this._imageData.hide = true;
            }
            

            // Save new image data
            imageData.hide = false
            this._imageData = imageData;
            this.image = this._imageData.image;

            // If the view is NOT inited, will load image after view inited ( in ngAfterViewInit )
            // If the view is already inited, which means this component is created before, load image here
            if (this.isViewInited) {
                this.loadImage();
            }
        }
    }

    get imageData() {
        return this._imageData;
    }

    constructor(private imageInteractionService: ImageInteractionService,
        private imageOperationService: ImageOperationService,
        private dicomImageService: DicomImageService,
        private configurationService: ConfigurationService,
        private viewContext: ViewContextService,
        public worklistService: WorklistService,
        private dialogService: DialogService,
        private logService: LogService,
        private ngZone: NgZone,
        private annotationService: AnnotationService) {

        this.subscriptionViewContextChange = viewContext.viewContextChanged$.subscribe(
            context => {
                if (!(this._imageData.groupData.viewerShellData.hide) && this.imageData.selected) {
                    this.setContext(context);
                }
            });

        this.subscriptionOperation = viewContext.onOperation$.subscribe(
            operation => {
                this.onOperation(operation);
            });

        this.subscriptionImageInteraction = imageInteractionService.imageInteraction$.subscribe(
            imageInteractionData => {
                this.onImageInteraction(imageInteractionData);
            });

        this.subscriptionImageOperation = imageOperationService.imageOperation$.subscribe(
            imageOperationData => {
                this.onImageOperation(imageOperationData);
            });

        this.logService.debug("Image: a new ImageViewerComponent is created!");
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Angular lifecycle functions
    ngOnInit() {
        this.logService.debug(this.logPrefix + "ngOnInit");
        this.baseUrl = this.configurationService.getBaseUrl();
    }

    ngAfterContentInit() {
        this.logService.debug(this.logPrefix + "ngAfterContentInit");
    }

    ngAfterViewInit() {
        this.logService.debug(this.logPrefix + "ngAfterViewInit");

        this.canvas = this.canvasRef.nativeElement;
        this.helpElement = this.helpElementRef.nativeElement;

        this.startJCanvas();
        this.createLayers();

        this.registerCornerstoneEvent();
        this.registerCanvasEvents();
        this.registerImgLayerEvents();

        if (this.image) {
            this.showWaitingText();
        }

        this.loadImage();
        this.annGuide = new AnnGuide(this);
        this.annImageRuler = new AnnImageRuler(this);

        this.isViewInited = true;
    }

    ngAfterViewChecked() {
        if (this.needResize && this.isImageLoaded) {
            this.restartJCanvas();

            this.logService.debug(this.logPrefix + 'ngAfterViewChecked() - canvas width: ' + this.canvas.width + ', canvas height: ' + this.canvas.height);

            if (this.image) {
                this.fitWindow();
                if (this.olLayer) {
                    this.showTextOverlay();
                }
                if (this.imgRulerLayer) {
                    this.annImageRuler.reDraw(this);
                }
            } else {
                this.deleteAll();
            }

            this.needResize = false;
        }
    }

    ngOnDestroy() {
        this.deleteAll();

        if (this.jcanvas) {
            this.jcanvas.del();
        }

        this.disableCornerstone();
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Functions for loading/unloading image
    private enableCornerstone() {
        if (this.cornerstoneEnabled) {
            alert("Internal error in enableCornerstone() - Cornerstone was already enabled!");
            return;
        }

        if (!this.helpElement) {
            alert("Internal error in enableCornerstone() - Help element NOT assigned!");
            return;
        }

        if (!this.image || !this.image.cornerStoneImage) {
            alert("Internal error in enableCornerstone() - Image or Image.cornerstoneImage is NULL!");
            return;
        }

        this.ngZone.runOutsideAngular(() => {
            $(this.helpElement).width(this.image.imageColumns).height(this.image.imageRows);
            cornerstone.enable(this.helpElement);
        });

        this.cornerstoneEnabled = true;
    }

    private disableCornerstone() {
        if (this.image && this.image.cornerStoneImage && this.cornerstoneEnabled) {
            if (!this.helpElement) {
                alert("Internal error in disableCornerstone() - Help element NOT assigned!");
                return;
            }

            this.ngZone.runOutsideAngular(() => {
                cornerstone.disable(this.helpElement);
            });

            this.cornerstoneEnabled = false;
        }
    }

    private startJCanvas() {
        const canvasId = this.getCanvasId();
        jCanvaScript.start(canvasId, true);
        this.jcanvas = jCanvaScript.canvas(canvasId);

        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;

        this.jcanvas.width(this.canvas.width);
        this.jcanvas.height(this.canvas.height);
    }

    private restartJCanvas() {
        const parent = this.canvas.parentElement.parentElement;

        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;

        this.jcanvas.width(this.canvas.width);
        this.jcanvas.height(this.canvas.height);

        this.jcanvas.restart();
    }

    private loadImage() {
        //// Make sure this function is called after view is inited.
        //if (!this.isViewInited) {
        //    alert("Internal error : Must load image after view is inited");
        //    return;
        //}

        // The image is null, which means to clear the image viewer
        if (!this.image) {
            this.redraw(1);
            return;
        }

        if (this.image.cornerStoneImage) {
            // The image is already downloaded, show the image
            this.showImage();
        } else {
            // The image is NOT downloaded, get the image from server and show it after download
            this.dicomImageService.getCornerStoneImage(this.image).then(ctImage => this.onImageDownloaded(ctImage));
        }

    }

    // Call back functions when image is loaded by CornerStone
    private onImageDownloaded(ctImage: any) {
        this.logService.info(this.logPrefix + "Image is downloaded from server. Start to show it by cornerstone.");
        this.image.setCornerStoneImage(ctImage);
        this.image.graphicOverlayDataList = this.dicomImageService.getGraphicOverlayList(this.image);
        this.showImage();
    }

    // Show image when image is loaded
    private showImage() {

        if (this.image.cornerStoneImage) {
            this.enableCornerstone();

            this.restartJCanvas();

            this.logService.debug(this.logPrefix + 'showImage() - canvas width: ' + this.canvas.width + ', canvas height: ' + this.canvas.height);

            this.isImageLoaded = false;
            cornerstone.displayImage(this.helpElement, this.image.cornerStoneImage);

            this.logService.debug(this.logPrefix + 'image is loaded, displaying it...');
        } else {
            this.logService.debug(this.logPrefix + 'local test data, no image to show.');
        }

        const id = this.getId();
        const index = id.substr(id.length - 4, 4);
        if (index === "0000" || this.imageData.selected) {
            this.onSelected();
        }
    }


    private onImageRendered(e, data) {
        this.logService.debug(this.logPrefix + 'onImageRendered() - canvas width: ' + this.canvas.width + ', canvas height: ' + this.canvas.height);
        this.redraw(1);
    }

    private onImageLoaded(e, data) {
        this.logService.debug(this.logPrefix + 'onImageLoaded() - canvas width: ' + this.canvas.width + ', canvas height: ' + this.canvas.height);

        const ctCanvas = cornerstone.getEnabledElement(this.helpElement).canvas;
        this.jcImage = jCanvaScript.image(ctCanvas).layer(this.imgLayerId);
        this.toggleGraphicOverlay(true);

        //fit window
        this.fitWindow();

        // Save the original window center/width for later reset.
        this.originalWindowCenter = this.image.cornerStoneImage.windowCenter;
        this.originalWindowWidth = this.image.cornerStoneImage.windowWidth;

        this.hideWaitingText();
        this.showTextOverlay();

        this.updateImageTransform();
        this.syncAnnLabelLayerTransform();
        this.viewContext.setContext(ViewContextEnum.SelectAnn, this.imageData.groupData.viewerShellData.getId());
        this.annSerialize = new AnnSerialize(this.image.annData, this);
        this.deleteAllAnnotation();
        if (!this.annSerialize.createAnn()) {
            this.setContext(this.viewContext.curContext);
        }

        this.redraw(2);
    }

    adjustHeight() {
        const parent = this.canvas.parentElement.parentElement;
        this.setHeight(parent.clientHeight);
    }
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Implementation of interface IImageViewer
    isCtrlKeyPressed(): boolean {
        return this.ctrlKeyPressed;
    }

    getImageLayerId(): string {
        return this.imgLayerId;
    }

    getAnnotationLayerId(): string {
        return this.annLayerId;
    }

    getAnnLabelLayerId(): string {
        return this.annLabelLayerId;
    }

    getAnnGuideLayerId(): string {
        return this.tooltipLayerId;
    }

    getAnnImageRulerLayerId(): string {
        return this.imgRulerLayerId;
    }

    getTextOverlayLayerId(): string {
        return this.olLayerId;
    }

    getImageLayer(): any {
        return this.imgLayer;
    }

    getMgLayer(): any {
        return this.mgLayer;
    }

    getAnnLabelLayer(): any {
        return this.annLabelLayer;
    }

    getAnnGuideLayer(): any {
        return this.tooltipLayer;
    }

    getImage(): DicomImage {
        return this.image;
    }

    getCanvas(): any {
        return this.canvas;
    }

    getCtCanvas(): any {
        return cornerstone.getEnabledElement(this.helpElement).canvas;
    }

    getContext(): ViewContext {
        return this.viewContext.curContext;
    }

    getBaseUrl(): string {
        return this.baseUrl;
    }

    getTextFont(): FontData {
        return this.configurationService.getTextOverlayFont();
    }

    selectAnnotation(annObj: AnnExtendObject) {
        if (annObj) {
            if (this.curSelectObj !== annObj) {
                if (this.curSelectObj) {
                    this.curSelectObj.onSelect(false, false);
                }

                this.curSelectObj = annObj;
                if (!this.curSelectObj.isSelected()) {
                    this.curSelectObj.onSelect(true, true);
                }
            }
        } else {
            if (this.curSelectObj) {
                if (!this.curSelectObj.isCreated()) {
                    this.deleteAnnotation(this.curSelectObj);
                } else {
                    this.curSelectObj.onSelect(false, false);
                }

            }

            this.curSelectObj = undefined;
        }

        const stepIndex = (this.curSelectObj && this.curSelectObj.isGuideNeeded()) ? this.curSelectObj.getFocusedObj().getStepIndex() : -1;
        if (stepIndex !== -1) {
            this.annGuide.setGuideTargetObj(this.curSelectObj);
            this.annGuide.show(this.curSelectObj.getTypeName(), stepIndex);
        } else {
            this.annGuide.hide();
        }
    }

    selectNextAnnotation(backward: boolean) {
        const len = this.annObjList.length;
        if (len === 0) return;

        if (!this.curSelectObj) {
            this.selectAnnotation(this.annObjList[0]);
            return;
        }

        let i = 0;
        for (; i < len; i++) {
            if (this.curSelectObj === this.annObjList[i]) break;
        }

        let nextIndex = i;
        if (backward) {
            nextIndex = (i === 0) ? len - 1 : i - 1;
        } else {
            nextIndex = (i === len - 1) ? 0 : i + 1;
        }

        this.selectAnnotation(this.annObjList[nextIndex]);
    }

    onAnnotationCreated(annObj: AnnExtendObject) {
        if (!annObj.isCreated()) {
            alert("Internal error in onAnnotationCreated()");
            return;
        }

        this.annObjList.push(annObj);
        if (!annObj.isLoadedFromTag()) {
            this.curSelectObj = annObj;
            this.viewContext.setContext(ViewContextEnum.SelectAnn, this.imageData.groupData.viewerShellData.getId());
        }
    }

    stepGuide() {
        this.annGuide.step();
    }

    getCurrentStepIndex(): number {
        return this.annGuide.getStepIndex();
    }

    cancelCreate(needRecreate: boolean) {
        this.deleteAnnotation(this.curSelectObj);
        this.curSelectObj = undefined;
        this.annGuide.stepTo(0);

        if (!needRecreate) {
            this.viewContext.setContext(ViewContextEnum.SelectAnn, this.imageData.groupData.viewerShellData.getId());
        }
    }

    selectChildByStepIndex(stepIndex: number) {
        if (this.curSelectObj) {
            this.curSelectObj.selectChildByStepIndex(stepIndex);
        }
    }

    getCursor(): any {
        this.logService.debug(`Get cursor return ${this.canvas.style.cursor}`);
        return this.canvas.style.cursor;
    }

    setCursor(cursor: any): void {
        if (!cursor) {
            cursor = this.getCursorFromContext();
        }
        this.logService.debug(`Set cursor to ${cursor}`);
        this.canvas.style.cursor = cursor;
    }

    isDragging(): boolean {
        return this.dragging;
    }

    refresh() {
        this.redraw(1);
    }

    getAnnotationService(): AnnotationService {
        return this.annotationService;
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////'

    onKeyUp(event) {

        let needRedraw = true;
        if (event.code === "Delete") {
            this.deleteSelectedAnnotation();
        } else if (event.code === "KeyA") {
            this.selectNextAnnotation(event.shiftKey);
        } else if (event.code === "KeyF") {
            if (this.curSelectObj) {
                this.curSelectObj.onSwitchFocus();
            }
        }
        else if (event.code === "ArrowUp" || event.code === "ArrowDown" || event.code === "ArrowLeft" || event.code === "ArrowRight") {
            if (this.curSelectObj) {
                this.curSelectObj.onKeyDown(event);
            } else {
                needRedraw = false;
            }
        } else if (event.code === "ControlLeft" || event.code === "ControlRight") {
            this.ctrlKeyPressed = false;
            needRedraw = false;
        }

        if (needRedraw) {
            this.redraw(1);
        }
    }

    onKeyDown(event) {

        if (event.code === "ControlLeft" || event.code === "ControlRight") {
            this.ctrlKeyPressed = true;
        }
    }

    getId(): string {
        //TODO: make sure the viewid is unique, even two viewer opened the same image
        return `DivImageViewer${this.imageData.getId()}`;
    }

    getCanvasId(): string {
        //TODO: make sure the canvas is unique, even two viewer opened the same image
        return `viewerCanvas_${this.imageData.getId()}`;
    }





    private showWaitingText() {
        this.olLayer.visible(true);

        const font = this.configurationService.getTextOverlayFont();
        this.waitingLabel = jCanvaScript.text("Loading.....", this.canvas.width / 2, this.canvas.height / 2).layer(this.olLayerId)
            .color(font.color).font(font.getCanvasFontString()).align("center");
        this.redraw(1);
    }

    private hideWaitingText() {
        if (this.waitingLabel) {
            this.waitingLabel.del();
            this.waitingLabel = null;
        }
    }

    private showTextOverlay() {
        this.olLayer.visible(true);

        if (!this.annTextOverlay) {
            this.annTextOverlay = new AnnTextOverlay(this, this.dicomImageService);
        }
        this.annTextOverlay.redraw();
        this.redraw(1);
    }

    private createLayers() {
        //create layers
        const canvasId = this.getCanvasId();

        this.imgLayerId = canvasId + "_imgLayer";
        this.imgLayer = jCanvaScript.layer(this.imgLayerId).level(0); //layer to hold the image
        this.imgLayer.id = this.imgLayerId;
        this.imgLayer.needRedraw = true;

        this.annLayerId = canvasId + "_annLayer";
        this.annLayer = jCanvaScript.layer(this.annLayerId).level(1); //layer to draw annotations
        this.annLayer.onBeforeDraw = () => this.onBeforeDrawAnnLayer();
        this.annLayer.id = this.annLayerId;
        this.annLayer.needRedraw = true;

        this.annLabelLayerId = canvasId + "_annLabelLayer";
        this.annLabelLayer = jCanvaScript.layer(this.annLabelLayerId).level(2); //layer to draw annotations label.
        this.annLabelLayer.id = this.annLabelLayerId;
        this.annLabelLayer.needRedraw = true;

        this.mgLayerId = canvasId + "_mgLayer";
        this.mgLayer = jCanvaScript.layer(this.mgLayerId).level(4); //layer to show magnified image
        this.mgLayer.visible(false);
        this.mgLayer.id = this.mgLayerId;
        this.mgLayer.needRedraw = true;

        this.olLayerId = canvasId + "_overlayLayer";
        this.olLayer = jCanvaScript.layer(this.olLayerId).level(10); //layer to show overlay
        this.olLayer.id = this.olLayerId;
        this.olLayer.needRedraw = true;

        this.imgRulerLayerId = canvasId + "_imgRulerLayer"; // layer to show ruler
        this.imgRulerLayer = jCanvaScript.layer(this.imgRulerLayerId).level(9);
        this.imgRulerLayer.id = this.imgRulerLayerId;
        this.imgRulerLayer.needRedraw = true;

        this.tooltipLayerId = canvasId + "_tooltipLayer"; // layer to show tooltip dialog
        this.tooltipLayer = jCanvaScript.layer(this.tooltipLayerId).draggable(true).level(20);
        this.tooltipLayer.id = this.tooltipLayerId;
        this.tooltipLayer.needRedraw = true;
    }

    private onBeforeDrawAnnLayer() {
        if (!this.isImageLoaded)
            return;

        //apply transform
        this.annLayer.transform(1, 0, 0, 1, 0, 0, true);
        this.annLayer.optns.scaleMatrix = this.imgLayer.optns.scaleMatrix;
        this.annLayer.optns.rotateMatrix = this.imgLayer.optns.rotateMatrix;
        this.annLayer.optns.translateMatrix = this.imgLayer.optns.translateMatrix;
        this.annLayer.scale(1);

        this.syncAnnLabelLayerTransform();
    }

    private syncAnnLabelLayerTransform() {
        this.annLabelLayer.transform(1, 0, 0, 1, 0, 0, true);
        this.annLabelLayer.optns.scaleMatrix = this.imgLayer.optns.scaleMatrix;
        this.annLabelLayer.optns.translateMatrix = this.imgLayer.optns.translateMatrix;
        this.annLabelLayer.scale(1);
    }

    onSelected() {
        this.imageInteractionService.onSelectImageInGroup(this.imageData);
        this.canvas.focus();
    }

    getBorderStyle(): string {
        return this.imageData.selected ? "1px solid #F90" : "1px solid #555555";
    }

    private doSelectImage(image: DicomImage) {
        this.imageData.selected = (this.image === image);
    }

    setHeight(height: number) {
        const o = document.getElementById(this.getId());
        if (o !== undefined && o !== null) {
            o.style.height = height.toString() + "px";
        }
    }

    setSelected(selected: boolean) {
        this.imageData.selected = selected;
    }

    isSelected(): boolean {
        return this.imageData.selected;
    }

    private setContext(context: ViewContext) {
        if (!this.isImageLoaded) {
            return;
        }

        const draggable = context.action === ViewContextEnum.Pan;
        this.draggable(draggable);

        //each time context changed, we should unselect cur selected object
        this.selectAnnotation(undefined);
        this.annGuide.hide();

        this.setCursorFromContext();
    }

    private onImageOperation(imageOperationData: ImageOperationData) {
        if (!this.isImageLoaded)
            return;

        if (!imageOperationData.needResponse(this.imageData.groupData.viewerShellData.getId(), this.imageData.selected))
            return;

        switch(imageOperationData.operationType) {
            case ImageOperationEnum.ShowAnnotation:
                this.doToggleLayerDisplay(this.annLayer);
                this.doToggleLayerDisplay(this.annLabelLayer);
                break;

            case ImageOperationEnum.ShowTextOverlay:
                this.doToggleLayerDisplay(this.olLayer);
                break;

            case ImageOperationEnum.ShowRuler:
                this.doToggleLayerDisplay(this.imgRulerLayer);
                break;

            case ImageOperationEnum.ShowGraphicOverlay:
                this.doToggleLayerDisplay(undefined);
                break;

            case ImageOperationEnum.FitWidthSelectedImage:
            case ImageOperationEnum.FitHeightSelectedImage:
            case ImageOperationEnum.FitOriginalSelectedImage:
            case ImageOperationEnum.FitWindowSelectedImage:
                this.doFit(imageOperationData.operationType);
                break;

            case ImageOperationEnum.RotateCwSelectedImage:
                this.doRotate(90);
                break;

            case ImageOperationEnum.RotateCcwSelectedImage:
                this.doRotate(-90);
                break;

            case ImageOperationEnum.FlipHorizontalSelectedImage:
                this.doFlip(false);
                break;

            case ImageOperationEnum.FlipVerticalSelectedImage:
                this.doFlip(true);
                break;

            case ImageOperationEnum.InvertSelectedImage:
                this.doInvert();
                break;

            case ImageOperationEnum.ResetSelectedImage:
                this.doReset();
                break;

            case ImageOperationEnum.ManualWlSelectedImage:
                this.doManualWl();
                break;

            case ImageOperationEnum.ToggleKeyImageSelectedImage:
                this.doToggleKeyImage();
                break;

            //case ImageOperationEnum.SelectAllImages:
            //    this.doSelectImage(this.image);
            //    break;

            case ImageOperationEnum.SelectOneImageInSelectedGroup:
                this.doSelectFirstImageInFirstGroup();
                break;
        }

        this.redraw(1);
    }

    private onOperation(operation: OperationData) {
        if (!this.isImageLoaded)
            return;

        if (!this.imageData.selected)
            return;

        switch (operation.type) {
            //case OperationEnum.Rotate: {
            //    this.rotate(operation.data.angle);
            //    break;
            //}

            //case OperationEnum.Flip: {
            //    this.flip(operation.data);
            //    break;
            //}

            //case OperationEnum.Invert: {
            //    this.invert();
            //    break;
            //}

            //case OperationEnum.FitWidth:
            //case OperationEnum.FitHeight:
            //case OperationEnum.FitOriginal:
            //case OperationEnum.FitWindow: {
            //    //this.doFit(operation.type);
            //    break;
            //}

            //case OperationEnum.ShowOverlay: {
            //    this.olLayer.visible(operation.data.show);
            //    break;
            //}

            //case OperationEnum.ShowRuler: {
            //    this.imgRulerLayer.visible(operation.data.show);
            //    break;
            //}

            //case OperationEnum.ShowAnnotation: {
            //    this.annLayer.visible(operation.data.show);
            //    break;
            //}

            //case OperationEnum.ShowGraphicOverlay: {
            //    this.toggleGraphicOverlay(operation.data.show);
            //    break;
            //}

            //case OperationEnum.ManualWL: {
            //    this.doManualWl();
            //    break;
            //}

            //case OperationEnum.ToggleKeyImage: {
            //    if (this.image.keyImage === 'Y') {
            //        this.image.keyImage = 'N';
            //        this.setKeyImage(false);
            //    } else {
            //        this.image.keyImage = 'Y';
            //        this.setKeyImage(true);
            //    }
            //    break;
            //}

            //case OperationEnum.Reset: {
            //    this.doReset();
            //    break;
            //}
        }

        this.redraw(1);
    }

    private getCursorFromContext() {
        const curContext = this.viewContext.curContext;
        const cursorUrl = `url(${this.baseUrl}/assets/img/cursor/{0}.cur),move`;

        let cursor = "default";

        switch (curContext.action) {
            case ViewContextEnum.WL:
                cursor = cursorUrl.format("adjustwl");
                break;

            case ViewContextEnum.Pan:
                cursor = cursorUrl.format("hand");
                break;

            case ViewContextEnum.Zoom:
                cursor = cursorUrl.format("zoom");
                break;

            case ViewContextEnum.Magnify:
                cursor = cursorUrl.format("magnify");
                break;

            case ViewContextEnum.RoiZoom:
                cursor = cursorUrl.format("rectzoom");
                break;

            case ViewContextEnum.RoiWl:
                cursor = cursorUrl.format("rectwl");
                break;

            case ViewContextEnum.SelectAnn:
                cursor = cursorUrl.format("select");
                break;

            case ViewContextEnum.CreateAnn:
                const cursorName = this.annotationService.getCursorNameByType(curContext.data);
                cursor = cursorUrl.format(cursorName);
                break;
        }

        return cursor;
    }

    private setCursorFromContext() {
        const cursor = this.getCursorFromContext();
        this.setCursor(cursor);

        const curContext = this.viewContext.curContext;
        if (curContext.action === ViewContextEnum.CreateAnn) {
            const annDefData = this.annotationService.getAnnDefDataByType(curContext.data);
            if (!annDefData) return;

            if (annDefData.needGuide) {
                this.annGuide.show(annDefData.className);
                this.redraw(1);
            } else if (annDefData.cursorName === "ann_stamp") {
                this.selectMarker();
            }
        }
    }

    private doRotate(angle) {
        if (angle == 0) //rotate 0 will cause the transform messed
            return;

        this.imgLayer.rotate(angle, "center");
        this.updateImageTransform();

        this.annObjList.forEach(obj => obj.onRotate(angle));
    }

    private doFlip(flipVertical: boolean) {

        const viewPort = cornerstone.getViewport(this.helpElement);

        const rotateAngle = this.getRotate();
        if (Math.abs(rotateAngle % 180) === 90) {
            flipVertical = !flipVertical;
        }

        if (flipVertical) {
            viewPort.vflip = !viewPort.vflip;
        } else {
            viewPort.hflip = !viewPort.hflip;
        }

        cornerstone.setViewport(this.helpElement, viewPort);

        this.annObjList.forEach(annObj => annObj.onFlip(flipVertical));
        if (this.annGraphicOverlay) {
            this.annGraphicOverlay.onFlip(flipVertical);
        }
    }

    private doInvert() {
        const viewPort = cornerstone.getViewport(this.helpElement);
        viewPort.invert = !viewPort.invert;
        cornerstone.setViewport(this.helpElement, viewPort);
    }

    scale(value) {
        if (value > 0) {
            this.imgLayer.scale(value);
            this.updateImageTransform();
        }
    }

    translate(x, y) {
        this.imgLayer.translate(x, y);
        this.updateImageTransform();
    }

    getScale() {
        if (this.image)
            return this.image.getScaleValue();

        return 1;
    }

    getRotate() {
        if (this.image)
            return this.image.getRotateAngle();

        return 0;
    }

    private updateImageTransform() {
        if (this.image) {
            this.image.transformMatrix = this.imgLayer.transform();
        }
    }

    onResize() {

        this.logService.debug("Image: onResize()");
        setTimeout(() => {
            this.needResize = true;
        },
            1);
    }

    fitWindow() {
        if (!this.isImageLoaded)
            return;

        const curRotate = 0 - this.getRotate(); //get rotate return the minus value
        const width = this.image.width();
        const height = this.image.height();

        const parent = this.canvas.parentElement.parentElement;
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;

        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const widthScale = canvasWidth / width;
        const heightScale = canvasHeight / height;

        this.logService.debug(this.logPrefix + 'fitWindow() - canvas width: ' + this.canvas.width + ', canvas height: ' + this.canvas.height);

        //log('bestfit, canvas width:' + canvasWidth + ",height:" + canvasHeight);

        //this.trueSize();//each time bestfit, need to reset the transform, then apply the scale value.
        this.imgLayer.transform(1, 0, 0, 1, 0, 0, true);

        if (widthScale < heightScale) {
            this.scale(widthScale);
            this.translate(0, (canvasHeight - height * widthScale) / 2);
        } else {
            this.scale(heightScale);
            this.translate((canvasWidth - width * heightScale) / 2, 0);
        }

        this.doRotate(curRotate);
        this.refreshUi();
    }

    doReset() {
        if (!this.isImageLoaded)
            return;

        const width = this.image.width();
        const height = this.image.height();
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        const widthScale = canvasWidth / width;
        const heightScale = canvasHeight / height;

        this.imgLayer.transform(1, 0, 0, 1, 0, 0, true);

        if (widthScale < heightScale) {
            this.scale(widthScale);
            this.translate((canvasWidth - width * widthScale) / 2, (canvasHeight - height * widthScale) / 2);
        } else {
            this.scale(heightScale);
            this.translate((canvasWidth - width * heightScale) / 2, (canvasHeight - height * heightScale) / 2);
        }

        // Reset W/L
        this.image.cornerStoneImage.windowWidth = this.originalWindowWidth;
        this.image.cornerStoneImage.windowCenter = this.originalWindowCenter;

        const viewPort = cornerstone.getViewport(this.helpElement);
        viewPort.voi.windowCenter = this.originalWindowCenter;
        viewPort.voi.windowWidth = this.originalWindowWidth;

        // Reset Flip status
        viewPort.vflip = false;
        viewPort.hflip = false;

        cornerstone.setViewport(this.helpElement, viewPort);

        this.updateWlTextOverlay(this.originalWindowWidth, this.originalWindowCenter);
        this.updateZoomRatioTextOverlay(this.getScale());

        this.deleteAllAnnotation();
        this.curSelectObj = undefined;

        if (this.annGraphicOverlay) {
            this.annGraphicOverlay.onReset();
        }
        this.refreshUi();
    }

    private doFit(fitType: ImageOperationEnum) {
        const width = this.image.width();
        const height = this.image.height();
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        let widthScale = canvasWidth / width;
        let heightScale = canvasHeight / height;

        this.logService.debug(this.logPrefix + 'doFit() - canvas width: ' + this.canvas.width + ', canvas height: ' + this.canvas.height);

        const curRotate = 0 - this.getRotate(); //get rotate return the minus value
        // Sail : currently ignore the free rotate, since free rotate will change both width and height,
        // rotate 90 only switch width and height
        if (Math.abs(curRotate % 180) === 90) {
            widthScale = canvasWidth / height;
            heightScale = canvasHeight / width;
        }


        this.imgLayer.transform(1, 0, 0, 1, 0, 0, true);


        if (fitType === ImageOperationEnum.FitWindowSelectedImage) {
            if (widthScale < heightScale) {
                this.scale(widthScale);
                this.translate((canvasWidth - width * widthScale) / 2, (canvasHeight - height * widthScale) / 2);
            } else {
                this.scale(heightScale);
                this.translate((canvasWidth - width * heightScale) / 2, (canvasHeight - height * heightScale) / 2);
            }
        } else if (fitType === ImageOperationEnum.FitHeightSelectedImage) {
            this.scale(heightScale);
            this.translate((canvasWidth - width * heightScale) / 2, (canvasHeight - height * heightScale) / 2);
        } else if (fitType === ImageOperationEnum.FitWidthSelectedImage) {
            this.scale(widthScale);
            this.translate((canvasWidth - width * widthScale) / 2, (canvasHeight - height * widthScale) / 2);
        } else if (fitType === ImageOperationEnum.FitOriginalSelectedImage) {
            this.translate((canvasWidth - width) / 2, (canvasHeight - height) / 2);
        }


        this.doRotate(curRotate);
        this.updateZoomRatioTextOverlay(this.getScale());
        this.refreshUi();
    }

    showOverlay(visible) {
        if (!this.isImageLoaded) {
            return;
        }
        if (visible === undefined) {
            visible = false;
        }

        this.olLayer.visible(visible);
    }

    showAnnotation(visible) {
        if (!this.isImageLoaded) {
            return;
        }
        if (visible === undefined) {
            visible = false;
        }
        this.annLayer.visible(visible);
        this.annLabelLayer.visible(visible);
    }

    showRuler(visible) {
        if (!this.isImageLoaded) {
            return;
        }
        if (visible === undefined) {
            visible = false;
        }
        this.imgRulerLayer.visible(visible);
    }

    draggable(draggable: boolean) {
        var self = this;
        if (!self.isImageLoaded) {
            return;
        }

        var canvas = this.canvas;
        var curContext = this.viewContext.curContext;

        this.imgLayer.draggable({
            disabled: !draggable,
            start: function (arg) {
                if (curContext.action == ViewContextEnum.Select || curContext.action == ViewContextEnum.CreateAnn) {
                    canvas.style.cursor = "move";
                }
            },
            stop: function (arg) {
                if (curContext.action == ViewContextEnum.Select || curContext.action == ViewContextEnum.CreateAnn) {
                    canvas.style.cursor = "auto";
                }
            },
            drag: function (arg) {
            }
        });
    }

    saveImage() {
        const annString = this.annSerialize.getAnnString(this.annObjList);
        this.image.cornerStoneImage.data.elements["x0011101d"] = this.annSerialize.annData;
        this.dicomImageService.saveImageAnn(this.image.id, annString).subscribe(ret => {
            const content = new MessageBoxContent();
            content.title = "Save Image";
            if (ret) {
                content.messageText = "Save image failed! " + ret;
                content.messageType = MessageBoxType.Error;
            } else {
                content.messageText = "Save image successfully!";
                content.messageType = MessageBoxType.Info;
            }

            this.dialogService.showMessageBox(content);
        });
    }

    private doWL(deltaX, deltaY) {
        if (!this.isImageLoaded)
            return;

        const self = this;
        const dcmImg = self.image.cornerStoneImage;

        if (deltaX != 0 || deltaY != 0) {
            const maxVOI = dcmImg.maxPixelValue * dcmImg.slope + dcmImg.intercept;
            const minVOI = dcmImg.minPixelValue * dcmImg.slope + dcmImg.intercept;
            const imageDynamicRange = maxVOI - minVOI;
            const multiplier = imageDynamicRange / 1024;

            const width = dcmImg.windowWidth + Math.round(deltaX * multiplier);
            const center = dcmImg.windowCenter + Math.round(deltaY * multiplier);

            this.doWlByValue(center, width);
        }
    }

    private refreshUi() {
        this.annObjList.forEach(annObject => annObject.onScale(this.getScale()));
        this.annImageRuler.reDraw(this);
    }

    private registerImgLayerEvents() {
        var self = this;

        //register imglayer events, note the arg.x/y is screen (canvas) coordinates
        self.imgLayer.mousedown(function (arg) {
            self.onMouseDown(arg);
            return false;
        });
        self.imgLayer.mousemove(function (arg) {
            self.onMouseMove(arg);
        });
        self.imgLayer.mouseup(function (arg) {
            self.onMouseUp(arg);
        });
        self.imgLayer.mouseout(function (arg) {
            self.onMouseOut(arg);
        });
        self.imgLayer.click(function (arg) {
            //self.onClick(arg);
        });
        self.imgLayer.dblclick(function (arg) { //the event happend after div's dblclick and canva's dblclick, so no use.
            //log('imglayer dblclick ' + self.canvas.id);
        });
    }

    private onMouseDown(evt) {

        const self = this;
        if (!self.isImageLoaded) {
            return;
        }

        this.logService.debug("Image Layer - onMouseDown");

        const viewContext = self.viewContext;
        //log('viwer mouse down: ' + this.canvasId);

        //if in select context, and not click any object, will unselect all objects.
        if (viewContext.curContext.action == ViewContextEnum.Select) {
            if (!evt.event.cancelBubble) {
                //if (self.curSelectObj && self.curSelectObj.select) {
                //    self.curSelectObj.onSelect(false);
                //    self.curSelectObj = undefined;
                //}
                self.selectAnnotation(null);
                self.draggable(true);
            } else { //an annobject has been selected
                self.draggable(false);
            }
        } else if (viewContext.curContext.action == ViewContextEnum.CreateAnn) {
            const parm = viewContext.curContext.data;
            if (parm && parm.type && !parm.objCreated) {
                const newObj: AnnObject = new parm.type();
                //               self.createAnnObject(newObj, parm);

                parm.objCreated = true; //stop create the annObject again
            }
        }

        self.emitEvent(evt, MouseEventType.MouseDown, "onMouseDown");
    }

    private onMouseMove(evt) {
        //this.logService.debug("Image Layer - onMouseMove");
        this.emitEvent(evt, MouseEventType.MouseMove, "onMouseMove");
    }

    private onMouseOut(evt) {
        this.logService.debug("Image Layer - onMouseOut");
        //log('viwer mouse out: ' + this.canvasId);
        this.emitEvent(evt, MouseEventType.MouseOut, "onMouseOut");
    }

    private onMouseUp(evt) {
        this.logService.debug("Image Layer - onMouseUp");
        //log('viwer mouse up: ' +this.canvasId);
        this.emitEvent(evt, MouseEventType.MouseUp, "onMouseUp");
    }

    //image layer events
    registerEvent(obj, type) {
        if (!this.eventHandlers[type]) {
            this.eventHandlers[type] = [];
        }

        const handlers = this.eventHandlers[type];
        const len = handlers.length;
        let i: number;

        for (i = 0; i < len; i++) {
            if (handlers[i] === obj) {
                return; //exists already
            }
        }

        handlers.push(obj);
    }

    unRegisterEvent(obj, type) {
        if (!this.eventHandlers[type]) {
            return;
        }

        const handlers = this.eventHandlers[type];
        const len = handlers.length;
        let i: number;
        let found = false;

        for (i = 0; i < len; i++) {
            if (handlers[i] === obj) {
                found = true;
                break;
            }
        }

        if (found) {
            handlers.splice(i, 1);
        }
    }

    private emitEvent(arg, type, handler) {
        if (!this.isImageLoaded) {
            return;
        }
        const handlers = this.eventHandlers[type];
        if (!handlers || handlers.length == 0) {
            return;
        }

        //covert screen point to image point
        if (arg.x) {
            arg = AnnTool.screenToImage(arg, this.imgLayer.transform());
        }

        handlers.forEach(function (obj) {
            if (obj[handler]) {
                obj[handler](arg);
            }
        });
    }

    private registerCanvasEvents() {
        var self = this;

        self.canvas.addEventListener("contextmenu",
            function (evt) {
                self.onCanvasContextMenu(evt);
            });

        $(self.canvas).on("DOMMouseScroll mousewheel", function (evt) {
            self.onCanvasMouseWheel(evt);
        });

        $(self.canvas).on("dblclick",
            function (evt) {
                self.onCanvasDblClick(evt);
            });

        //TODO: keyup not work any more
        const parent = self.canvas.parentElement;
        $(parent).on("keyup",
            function (key) {
                self.onCanvasKeyUp(key);
            });

        $(self.canvas).on("mousemove",
            function (evt) {
                self.onCanvasMouseMove(evt);
            });

        $(self.canvas).on("mousedown",
            function (evt) {
                self.onCanvasMouseDown(evt);
            });

        $(self.canvas).on("mouseup",
            function (evt) {
                self.onCanvasMouseUp(evt);
            });

        $(self.canvas).on("mouseover",
            function (evt) {
                self.onCanvasMouseOver(evt);
            });

        $(self.canvas).on("mouseout",
            function (evt) {
                self.onCanvasMouseOut(evt);
            });
    }

    private registerCornerstoneEvent() {
        $(this.helpElement).on("cornerstoneimagerendered",
            (e, data) => {
                if (this.isImageLoaded) { //rendering, or invert/WL/Flip
                    this.onImageRendered(e, data);
                } else { //first load
                    this.isImageLoaded = true;
                    this.onImageLoaded(e, data); //this will set w/l, which will call Rendered again
                }
            });
    }

    private onCanvasKeyUp(key) {
        if (!this.isImageLoaded) {
            return;
        }
    }

    private onCanvasDblClick(evt) {
        //the imagelayer's double click events fires mousedown=>mouseup=>mousedown, which missed the last mosueup event, so we manually fire the mouseup here

        if (!this.isImageLoaded) {
            return;
        }

        const point = { x: evt.offsetX, y: evt.offsetY };

        if (this.annGuide.hitTest(point)) {
            return;
        }

        this.mouseEventHelper._mouseWhich = evt.which; //_mouseWhich has value means current is mouse down

        this.mouseEventHelper._mouseDownPosCvs = point;

        if (this.mouseEventHelper._mouseWhich === 1) {

            if (this.viewContext.curContext.action === ViewContextEnum.CreateAnn) {
                if (this.curSelectObj && !this.curSelectObj.isCreated()) {
                    this.curSelectObj.onMouseEvent(MouseEventType.DblClick, point, null);
                }
            }
        }

        if (this.canvas && this.canvas.on)
            this.canvas.onmouseup(evt); //cause jc to trigger mouseup event, which will stop the drag (imglayer)
        this.redraw(1);
        //log('canvas dblclick: ' + this.canvas.id);
    }

    private onCanvasContextMenu(evt) {
        if (!this.isViewInited) {
            return;
        }
        //todo: add context menus

        evt.stopImmediatePropagation();
        evt.stopPropagation();
        evt.preventDefault();
    }

    private onCanvasMouseWheel(evt) {
        const wheelUp = evt.originalEvent.wheelDelta > 0;
        this.imageInteractionService.onNavigationImageInGroup(this.imageData, wheelUp);
    }

    private onCanvasMouseDown(evt) {
        this.logService.debug("onCanvasMouseDown");
        if (!this.isImageLoaded) {
            return;
        }

        const point = { x: evt.offsetX, y: evt.offsetY };
        if (this.annGuide.hitTest(point)) {
            this.redraw(1);
            return;
        }

        this.dragging = true;
        this.mouseEventHelper._mouseWhich = evt.which; //_mouseWhich has value means current is mouse down

        this.mouseEventHelper._mouseDownPosCvs = point;

        if (this.mouseEventHelper._mouseWhich === 3) { //right mouse

            if (this.viewContext.curContext.action === ViewContextEnum.CreateAnn) {
                // Right click to cancel the creation of an annotation.
                this.cancelCreate(true);
            } else {
                this.mouseEventHelper._lastContext = this.viewContext.curContext;
                this.viewContext.setContext(ViewContextEnum.WL, this.imageData.groupData.viewerShellData.getId());
            }

        } else if (this.mouseEventHelper._mouseWhich === 1) {
            if (this.viewContext.curContext.action === ViewContextEnum.Magnify) {
                this.startMagnify(point);
            } else if (this.viewContext.curContext.action === ViewContextEnum.CreateAnn) {
                if (this.curSelectObj) {
                    // There is annotation selected
                    if (!this.curSelectObj.isCreated()) {
                        // The selected annotation is creating
                        this.curSelectObj.onMouseEvent(MouseEventType.MouseDown, point, null);
                    } else {
                        // The selected annotation is created
                        this.selectAnnotation(null);
                        // Start to create a new annotation and assign it as selected.
                        this.startCreateAnnAtPoint(point);
                    }
                } else {
                    // There is no annotation selected
                    this.startCreateAnnAtPoint(point);
                }
            } else if (this.viewContext.curContext.action === ViewContextEnum.SelectAnn) {

            } else if (this.viewContext.curContext.action === ViewContextEnum.RoiZoom || this.viewContext.curContext.action === ViewContextEnum.RoiWl) {
                if (!this.annRoiRectangle) {
                    const imagePoint = AnnTool.screenToImage(point, this.getImageLayer().transform());
                    this.annRoiRectangle = new AnnBaseRectangle(undefined, imagePoint, 0, 0, this);
                }
            }
        }

        this.redraw(1);
    }

    private onCanvasMouseMove(evt) {

        const self = this;
        if (!this.isImageLoaded) {
            return;
        }

        const point = { x: evt.offsetX, y: evt.offsetY };
        //console.log(evt.offsetX + "," + evt.offsetY);
        const curContext = this.viewContext.curContext;

        if (!self.mouseEventHelper._lastPosCvs) {
            self.mouseEventHelper._lastPosCvs = { x: evt.offsetX, y: evt.offsetY };
        }
        const deltaX = evt.offsetX - self.mouseEventHelper._lastPosCvs.x;
        const deltaY = evt.offsetY - self.mouseEventHelper._lastPosCvs.y;


        if (curContext.action === ViewContextEnum.CreateAnn) {
            if (this.curSelectObj && !this.curSelectObj.isCreated()) {
                this.curSelectObj.onMouseEvent(MouseEventType.MouseMove, point, null);
            }
        } else {
            if (self.mouseEventHelper._mouseWhich === 3) {

                if (curContext.action === ViewContextEnum.WL) {
                    self.doWL(deltaX, deltaY);
                }
            } else if (self.mouseEventHelper._mouseWhich === 1) {

                if (curContext.action === ViewContextEnum.Magnify) {
                    this.magnifyAtPoint(point);
                } else if (curContext.action === ViewContextEnum.WL) {
                    self.doWL(deltaX, deltaY);
                } else if (curContext.action === ViewContextEnum.Zoom) {
                    const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
                    if (Math.abs(delta) > 0) {
                        self.doZoom(delta);
                    }

                } else if (curContext.action === ViewContextEnum.RoiZoom || curContext.action === ViewContextEnum.RoiWl) {
                    if (this.annRoiRectangle) {
                        const topLeft = this.annRoiRectangle.getPosition();
                        const imagePoint = AnnTool.screenToImage(point, this.getImageLayer().transform());
                        this.annRoiRectangle.setWidth(imagePoint.x - topLeft.x);
                        this.annRoiRectangle.setHeight(imagePoint.y - topLeft.y);
                    }
                }
            }
        }

        this.redraw(this.dragging ? 2 : 1);
        self.mouseEventHelper._lastPosCvs = { x: evt.offsetX, y: evt.offsetY };
    }

    private onCanvasMouseUp(evt) {

        this.logService.debug("onCanvasMouseUp");
        const self = this;
        if (!self.isImageLoaded) {
            return;
        }

        const point = { x: evt.offsetX, y: evt.offsetY };
        if (this.annGuide.hitTest(point)) {
            this.redraw(2);
            return;
        }


        this.dragging = false;
        const curContext = this.viewContext.curContext;

        if (self.mouseEventHelper._mouseWhich === 3) {

            if (curContext.action === ViewContextEnum.WL) {
                if (self.mouseEventHelper._lastContext.action === ViewContextEnum.CreateAnn) { //cancel create
                    this.viewContext.setContext(ViewContextEnum.Select, this.imageData.groupData.viewerShellData.getId());
                } else {
                    this.viewContext.setContext(self.mouseEventHelper._lastContext.action, this.imageData.groupData.viewerShellData.getId(),
                        self.mouseEventHelper._lastContext.data);
                }
            }
        } else if (self.mouseEventHelper._mouseWhich === 1) {

            if (curContext.action === ViewContextEnum.Magnify) {
                this.endMagnify();
            }
            else if (curContext.action === ViewContextEnum.RoiZoom || curContext.action === ViewContextEnum.RoiWl) {
                if (this.annRoiRectangle && this.annRoiRectangle.getWidth() !== 0 && this.annRoiRectangle.getHeight() !== 0) {
                    const pointList = this.annRoiRectangle.getSurroundPointList();

                    curContext.action === ViewContextEnum.RoiZoom ? this.doRoiZoom(pointList) : this.doRoiWl(pointList);

                    this.annRoiRectangle.onDeleteChildren();
                    this.annRoiRectangle = undefined;
                }
            }
        }

        this.redraw(2);
        self.mouseEventHelper._mouseWhich = 0;
    }

    private onCanvasMouseOut(evt) {

        this.logService.debug("onCanvasMouseOut");
        const self = this;
        if (!self.isImageLoaded) {
            return;
        }

        self.canvas.onmouseup(evt); //cause jc to trigger mouseup event, which will stop the drag (imglayer)
        if (self.mouseEventHelper._mouseWhich !== 0) {
            self.onCanvasMouseUp(evt); //call mouseup to end the action
        }
    }

    private onCanvasMouseOver(evt) {

        this.logService.debug("onCanvasMouseOver");
        const self = this;
        if (!self.isImageLoaded) {
            return;
        }
    }

    private deleteAllAnnotation() {
        this.annObjList.forEach(annObj => annObj.onDeleteChildren());
        this.annObjList.length = 0;
    }

    private deleteAnnotation(annObj: AnnExtendObject) {

        if (!annObj) return;

        if (annObj.isCreated()) {
            // If this annotation is already created, need to remove it from the list
            const len = this.annObjList.length;

            let i = 0;
            for (; i < len; i++) {
                if (this.annObjList[i] === annObj) {
                    break;
                }
            }

            if (i !== len) {
                this.annObjList.splice(i, 1);
            }
        }

        annObj.onDeleteChildren();
    }

    private doManualWl() {
        const windowLevelData = new WindowLevelData();
        windowLevelData.windowCenter = this.image.cornerStoneImage.windowCenter;
        windowLevelData.windowWidth = this.image.cornerStoneImage.windowWidth;
        this.dialogService.showDialog(ManualWlDialogComponent, windowLevelData).subscribe(
            val => {
                if (val) {
                    this.doWlByValue(val.windowCenter, val.windowWidth);
                }
            }
        );

    }

    private doWlByValue(center: number, width: number) {
        const viewPort = cornerstone.getViewport(this.helpElement);
        viewPort.voi.windowCenter = center;
        viewPort.voi.windowWidth = width;
        cornerstone.setViewport(this.helpElement, viewPort);

        this.image.cornerStoneImage.windowWidth = width;
        this.image.cornerStoneImage.windowCenter = center;

        this.updateWlTextOverlay(width, center);
    }

    private updateWlTextOverlay(width: number, center: number) {
        if (this.annTextOverlay) {
            this.annTextOverlay.updateWindowCenter(width, center);
        }
    }

    private updateZoomRatioTextOverlay(roomRatio: number) {
        if (this.annTextOverlay) {
            this.annTextOverlay.updateZoomRatioTextOverlay(roomRatio);
        }
    }

    private startCreateAnnAtPoint(point: Point) {
        this.updateImageTransform();

        const annDefData = this.annotationService.getAnnDefDataByType(this.viewContext.curContext.data);
        if (!annDefData) return;

        if (annDefData.imageSuiteAnnType === AnnType.Text) {
            this.createFreeText(point);
        } else {
            this.curSelectObj = new annDefData.classType(undefined, this);
            if (annDefData.needGuide) {
                this.annGuide.setGuideTargetObj(this.curSelectObj);
            }
            this.curSelectObj.onMouseEvent(MouseEventType.MouseDown, point, null);
        }
    }

    private deleteSelectedAnnotation() {
        this.deleteAnnotation(this.curSelectObj);
        this.curSelectObj = undefined;
        this.annGuide.hide();
    }

    private selectMarker() {
        this.dialogService.showDialog(SelectMarkerDialogComponent, undefined).subscribe(
            val => {
                if (val) {
                    this.updateImageTransform();
                    const annImage = new AnnImage(undefined, this);
                    annImage.onCreate(val, new Point(0, 0));
                    this.curSelectObj = annImage;
                }
            }
        );
    }

    private setKeyImage(keyImage) {
        this.configurationService.setKeyImage(this.image.id, keyImage);
    }

    private redraw(count: number) {
        for (let i = 0; i < count; i++) {
            this.jcanvas.frame();
        }
    }

    private deleteAll() {
        if (!this.jcanvas) {
            return;
        }

        if (this.annMagnify) {
            this.annMagnify.del();
        }

        if (this.annTextOverlay) {
            this.annTextOverlay.del();
            this.annTextOverlay = undefined;
        }

        if (this.annGraphicOverlay) {
            this.annGraphicOverlay.del();
            this.annGraphicOverlay = undefined;
        }

        if (this.annImageRuler) {
            this.annImageRuler.reset(this);
        }

        if (this.image && this.annObjList) {
            this.deleteAllAnnotation();
        }

        if (this.jcImage) {
            this.jcImage.del();
        }
    }

    private toggleGraphicOverlay(show: boolean) {
        if (!this.image || this.image.graphicOverlayDataList.length === 0) {
            return;
        }

        if (show) {
            if (!this.annGraphicOverlay) {
                this.annGraphicOverlay = new AnnGraphicOverlay(this.image.graphicOverlayDataList, this);
            }
            this.annGraphicOverlay.setVisible(true);
        } else {
            if (this.annGraphicOverlay) {
                this.annGraphicOverlay.setVisible(false);
            }
        }
    }

    startMagnify(point: Point) {
        if (!this.annMagnify) {
            this.annMagnify = new AnnMagnify(this);
        }

        this.annMagnify.start(point, this.viewContext.curContext.data);
        this.canvas.style.cursor = "none";

        if (this.annGraphicOverlay) {
            this.annGraphicOverlay.drawToMgLayer();
        }
    }

    magnifyAtPoint(point: Point) {
        if (!this.annMagnify || !this.annMagnify.isStarted()) {
            return;
        }

        this.annMagnify.moveTo(point);
    }

    endMagnify() {
        if (!this.annMagnify || !this.annMagnify.isStarted()) {
            return;
        }

        this.annMagnify.end();
        this.setCursorFromContext();
    }

    private createFreeText(point: Point) {
        const content = new MessageBoxContent();
        content.title = "Text";
        content.messageText = "Please input the text:";
        content.messageType = MessageBoxType.Input;

        this.dialogService.showMessageBox(content).subscribe(
            val => {
                if (val.dialogResult === DialogResult.Ok) {
                    const imagePoint = AnnTool.screenToImage(point, this.image.transformMatrix);
                    const annObj = new AnnText(undefined, this);
                    annObj.onCreate(imagePoint, val.valueInput, false);
                    annObj.onDrawEnded();
                    this.curSelectObj = annObj;
                    this.redraw(1);
                }
            }
        );
    }

    private doZoom(delta) {
        if (!this.isImageLoaded)
            return;

        const imagePoint = AnnTool.screenToImage(this.mouseEventHelper._mouseDownPosCvs, this.image.transformMatrix);

        const scaleValue = delta > 0 ? 1.05 : 0.95;
        this.scale(scaleValue);

        const mouseDownPosCvsAfter = AnnTool.imageToScreen(imagePoint, this.image.transformMatrix);
        this.translate(this.mouseEventHelper._mouseDownPosCvs.x - mouseDownPosCvsAfter.x, this.mouseEventHelper._mouseDownPosCvs.y - mouseDownPosCvsAfter.y);

        this.updateZoomRatioTextOverlay(this.getScale());
        this.refreshUi();
    }

    private doRoiZoom(imagePointList: Point[]) {
        const imageRect = new Rectangle(0, 0, this.image.width(), this.image.height());
        for (let i = 0; i < 4; i++) {
            if (!AnnTool.pointInRect(imagePointList[i], imageRect)) {
                return;
            }
        }

        let width = imagePointList[2].x - imagePointList[0].x;
        let height = imagePointList[2].y - imagePointList[0].y;
        const imageCenterPoint = new Point(imagePointList[0].x + width / 2, imagePointList[0].y + height / 2);

        const rotateAngle = this.getRotate();
        if (Math.abs(rotateAngle % 180) === 90) {
            [width, height] = [height, width];
        }

        const scaleX = this.canvas.width / Math.abs(width);
        const scaleY = this.canvas.height / Math.abs(height);
        const newScale = Math.min(scaleX, scaleY) / this.image.getScaleValue();
        this.scale(newScale);

        const screenRectCenterPointAfter = AnnTool.imageToScreen(imageCenterPoint, this.getImageLayer().transform());
        const deltaX = this.canvas.width / 2 - screenRectCenterPointAfter.x;
        const deltaY = this.canvas.height / 2 - screenRectCenterPointAfter.y;
        this.imgLayer.translate(deltaX, deltaY);

        this.updateZoomRatioTextOverlay(this.getScale());
        this.refreshUi();
    }

    private doRoiWl(imagePointList: Point[]) {

        const imageRect = new Rectangle(0, 0, this.image.width(), this.image.height());
        for (let i = 0; i < 4; i++) {
            if (!AnnTool.pointInRect(imagePointList[i], imageRect)) {
                return;
            }
            imagePointList[i].x = Math.round(imagePointList[i].x);
            imagePointList[i].y = Math.round(imagePointList[i].y);
        }
        const wlData = this.dicomImageService.getRoiWlValue(this.image, imagePointList);
        this.doWlByValue(wlData.windowCenter, wlData.windowWidth);
    }

    private onImageInteraction(imageInteractionData: ImageInteractionData) {
        if (!imageInteractionData.sameShellData(this.imageData.groupData.viewerShellData)) {
            return;
        }

        switch (imageInteractionData.getType()) {
            case ImageInteractionEnum.SelectThumbnailInNavigator:
            case ImageInteractionEnum.SelectImageInGroup:
                this.doSelectImage(imageInteractionData.getPssiImage());
                break;

        }
    }

    private doToggleLayerDisplay(layer: any) {
        if (layer) {
            const visible = !layer._visible;
            layer.visible(visible);
        } else {
            // This is graphic overlay

            
        }
        
    }

    private doToggleKeyImage() {
        if (this.image.keyImage === 'Y') {
            this.image.keyImage = 'N';
            this.setKeyImage(false);
        } else {
            this.image.keyImage = 'Y';
            this.setKeyImage(true);
        }
    }

    private doSelectFirstImageInFirstGroup() {
        const id = this.getId();
        const index = id.substr(id.length - 4, 4);
        if (index === "0000") {
            this.onSelected();
        }
    }
}
