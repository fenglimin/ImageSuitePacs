import { Component, OnInit, Input, AfterContentInit, ViewChild, ElementRef, NgZone } from "@angular/core";
import { Location, LocationStrategy, PathLocationStrategy } from "@angular/common";
import { ImageSelectorService } from "../../../../services/image-selector.service";
import { DicomImageService } from "../../../../services/dicom-image.service";
import { ViewContextEnum, ViewContext, OperationEnum, OperationData, ViewContextService } from
    "../../../../services/view-context.service"
import { Subscription } from "rxjs";
import { Image } from "../../../../models/pssi";
import { ViewerImageData } from "../../../../models/viewer-image-data";
import { AnnObject, EventType } from "../../../../annotation/ann-object";
import { WorklistService } from "../../../../services/worklist.service";
import { ConfigurationService } from "../../../../services/configuration.service";
import { DialogService } from "../../../../services/dialog.service";
import { LogService } from "../../../../services/log.service";
import { WindowLevelData } from "../../../../models/dailog-data/image-process";
import { ManualWlDialogComponent } from "../../../../components/dialog/manual-wl-dialog/manual-wl-dialog.component";

@Component({
    selector: "app-image-viewer",
    templateUrl: "./image-viewer.component.html",
    styleUrls: ["./image-viewer.component.css"],
    providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }]
})
export class ImageViewerComponent implements OnInit, AfterContentInit {
    private _imageData: ViewerImageData;
    private image: Image;
    private ctImage: any; //cornerstone image
    private isImageLoaded: boolean;
    private needResize: boolean;
    selected = false;

    private baseUrl: string;
    private isViewInited: boolean;

    private subscriptionThumbnailSelection: Subscription;
    private subscriptionImageSelection: Subscription;
    private subscriptionImageLayoutChange: Subscription;
    private subscriptionViewContextChange: Subscription;
    private subscriptionOperation: Subscription;

    @ViewChild("viewerCanvas")
    private canvasRef: ElementRef;
    private canvas;

    @ViewChild("helpElement")
    private helpElementRef: ElementRef;
    private helpElement;
    private hasInitedHelpElement: boolean;

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
    private rulerLayer: any;
    private rulerLayerId: string;
    private tooltipLayer: any;
    private tooltipLayerId: string;

    private jcImage: any;
    private jcanvas: any;

    private annotationList: Array<any> = [];
    private curSelectObj: any;
    private mouseEventHelper: any = {};
    private eventHandlers: any = {};

    private originalWindowWidth: number;
    private originalWindowCenter: number;

    private waitingText: any;
    private label: any;
    private logPrefix: string;

    @Input()
    set imageData(imageData: ViewerImageData) {
        this.logPrefix = "Image" + imageData.getId() + ": ";
        const log = this.logPrefix + "set imageData, image " + (imageData.image === null ? 'is null' : 'id is ' + imageData.image.id);
        this.logService.debug(log);

        if (this._imageData !== imageData) {
            this._imageData = imageData;
            this.image = this._imageData.image;

            this.checkLoadImage();
        }
    }

    get imageData() {
        return this._imageData;
    }

    constructor(private imageSelectorService: ImageSelectorService,
        private dicomImageService: DicomImageService,
        private configurationService: ConfigurationService,
        private viewContext: ViewContextService,
        public worklistService: WorklistService,
        private dialogService: DialogService,
        private logService: LogService,
        private ngZone: NgZone) {

        this.subscriptionImageSelection = imageSelectorService.imageSelected$.subscribe(
            viewerImageData => {
                this.doSelectImage(viewerImageData);
            });

        this.subscriptionThumbnailSelection = imageSelectorService.thumbnailSelected$.subscribe(
            image => {
                this.doSelectImageByThumbnail(image);
            });

        this.subscriptionViewContextChange = viewContext.viewContextChanged$.subscribe(
            context => {
                this.setContext(context);
            });

        this.subscriptionOperation = viewContext.onOperation$.subscribe(
            operation => {
                this.onOperation(operation);
            });

        this.logService.debug("Image: a new ImageViewerComponent is created!");
    }

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

        const canvasId = this.getCanvasId();
        jCanvaScript.start(canvasId, true);
        this.jcanvas = jCanvaScript.canvas(canvasId);

        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;

        this.jcanvas.width(this.canvas.width);
        this.jcanvas.height(this.canvas.height);

        this.createLayers(canvasId);
        this.registerCanvasEvents();
        this.registerImgLayerEvents();

        if (this.image) {
            this.showWaitingText();
        }
        
      
        this.isViewInited = true;
    }

    ngAfterViewChecked() {
        if (this.needResize && this.isImageLoaded) {
            const parent = this.canvas.parentElement;
            const curWidth = parent.clientWidth;
            const curHeight = parent.clientHeight;

            this.canvas.width = curWidth;
            this.canvas.height = curHeight;
            this.jcanvas.width(this.canvas.width);
            this.jcanvas.height(this.canvas.height);
            this.jcanvas.restart();

            this.logService.debug(this.logPrefix + 'ngAfterViewChecked() - canvas width: ' + this.canvas.width + ', canvas height: ' + this.canvas.height);
            if (this.image) {
                this.fitWindow();
            } else {
                this.jcanvas.clear();
            }
            

            this.needResize = false;
        }
    }

    ngOnDestroy() {
        if (this.jcanvas) {
            this.jcanvas.del();
        }

        if (this.helpElement) {
            cornerstone.disable(this.helpElement);
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


    private checkLoadImage() {
        if (!this.isViewInited || (this.image && this.image.cornerStoneImage === undefined)) {
            this.logService.debug(this.logPrefix + 'view not inited or image not loaded, wait...');
            setTimeout(() => {
                this.checkLoadImage();
            }, 100);
        } else {

            if (!this.image) {
                if (this.jcanvas) {
                    this.jcanvas.clear();
                }
                
                this.logService.debug(this.logPrefix + 'image is null, clear the canvas.');
            } else {
                this.initHelpElement();
                this.ctImage = this.image.cornerStoneImage;
                if (this.ctImage) {
                    this.canvas = this.canvasRef.nativeElement;
                    

                    const canvasId = this.getCanvasId();
                    jCanvaScript.start(canvasId, true);
                    this.jcanvas = jCanvaScript.canvas(canvasId);

                    const parent = this.canvas.parentElement;
                    this.canvas.width = parent.clientWidth;
                    this.canvas.height = parent.clientHeight;

                    this.jcanvas.width(this.canvas.width);
                    this.jcanvas.height(this.canvas.height);

                    this.logService.debug(this.logPrefix + 'checkLoadImage() - canvas width: ' + this.canvas.width + ', canvas height: ' + this.canvas.height);
                     
                    this.createLayers(canvasId);
                    this.registerCanvasEvents();
                    this.registerImgLayerEvents();

                    this.isImageLoaded = false;
                    cornerstone.displayImage(this.helpElement, this.ctImage);
                    this.logService.debug(this.logPrefix + 'image is loaded, displaying it...');
                }else {
                    this.logService.debug(this.logPrefix + 'local test data, no image to show.');
                }
            }
        }
    }

    private initHelpElement() {
        this.ngZone.runOutsideAngular(() => {
            if (!this.hasInitedHelpElement) {
                this.helpElement = this.helpElementRef.nativeElement;
                //TODO: the init canvas's height and width may too big, should scale to a smaller when first load
                $(this.helpElement).width(this.image.imageColumns).height(this.image.imageRows);
                cornerstone.enable(this.helpElement);

                var comp = this;
                $(this.helpElement).on("cornerstoneimagerendered",
                    function (e, data) {
                        if (comp.isImageLoaded) { //rendering, or invert
                            comp.onImageRendered(e, data);
                        } else { //first load
                            comp.isImageLoaded = true;
                            comp.onImageLoaded(e, data); //this will set w/l, which will call Rendered again
                        }
                    });

                this.hasInitedHelpElement = true;
            }
        });
    }

    private onImageRendered(e, data) {
      this.logService.debug(this.logPrefix + 'onImageRendered() - canvas width: ' + this.canvas.width + ', canvas height: ' + this.canvas.height);
    }

    private onImageLoaded(e, data) {

      this.logService.debug(this.logPrefix + 'onImageLoaded() - canvas width: ' + this.canvas.width + ', canvas height: ' + this.canvas.height);

        const ctCanvas = cornerstone.getEnabledElement(this.helpElement).canvas;
        this.jcImage = jCanvaScript.image(ctCanvas).layer(this.imgLayerId);

        this.setContext(this.viewContext.curContext);
        //fit window
        this.fitWindow();

        // Save the original window center/width for later reset.
        this.originalWindowCenter = this.ctImage.windowCenter;
        this.originalWindowWidth = this.ctImage.windowWidth;

        this.hideWaitingText();
        this.showTextOverlay();
    }

    private showWaitingText() {
        this.olLayer.visible(true);

        const font = this.configurationService.getOverlayFont();
        this.waitingText = jCanvaScript.text("Loading.....", this.canvas.width / 2, this.canvas.height / 2).layer(this.olLayerId)
            .color(font.color).font(font.getCanvasFontString()).align('center');
    }

    private hideWaitingText() {
        if (this.waitingText) {
          this.waitingText.del();
          this.waitingText = null;
        }
    }


    private showTextOverlay() {

        this.olLayer.visible(true);

        const idLbl = this.getId() + "_ol";

        const overlaySetting = {
            color: "#ffffff",
            font: "Times New Roman",
            fontSize: 15
        };

        const font = "{0}px {1}".format(overlaySetting.fontSize, overlaySetting.font);

        const overlayList = this.dicomImageService.getOverlayDisplayList(this.image, this.canvas.width, this.canvas.height);
        overlayList.forEach(overlay => {
            jCanvaScript.text(overlay.text, overlay.posX, overlay.posY).id(idLbl).layer(this.olLayerId).color("#ffffff")
                .font(font).align(overlay.align);
        });

        //this.configurationService.overlayList.forEach(overlay => {
        //    var overlayValue = this.dicomImageService.getTextOverlayValue(this.image, overlay);
        //    var displayText = overlay.prefix + overlayValue + overlay.suffix;
        //    jCanvaScript.text(displayText, 5, 15+line*20).id(idLbl).layer(this.olLayerId).color("#ffffff").font(font).align("left");
        //    line++;
        //});


        //jCanvaScript.text("Test", 5, 15).id(idLbl).layer(this.olLayerId).color("#ffffff").font(font).align("left");

        this.label = jCanvaScript(`#${idLbl}`);


        //this.label._x = 5;
        //this.label._y = 34;

        //this.label.align('left');
        //this.label.string('aaaaa');
    }

    private createLayers(canvasId) {
        //create layers
        const self = this;
        this.imgLayerId = canvasId + "_imgLayer";
        this.imgLayer = jCanvaScript.layer(this.imgLayerId).level(0); //layer to hold the image

        self.annLayerId = canvasId + "_annLayer";
        self.annLayer = jc.layer(self.annLayerId).level(1); //layer to draw annotations
        self.annLayer.onBeforeDraw = function() { self.onBeforeDrawAnnLayer.call(self); };

        self.annLabelLayerId = canvasId + "_annLabelLayer";
        self.annLabelLayer = jc.layer(self.annLabelLayerId).level(2); //layer to draw annotations label.

        self.mgLayerId = canvasId + "_mgLayer";
        self.mgLayer = jc.layer(self.mgLayerId).level(4); //layer to show magnified image
        self.mgLayer.visible(false);

        self.olLayerId = canvasId + "_overlayLayer";
        self.olLayer = jCanvaScript.layer(self.olLayerId).level(10); //layer to show overlay

        self.rulerLayerId = canvasId + "_rulerLayer"; // layer to show ruler
        self.rulerLayer = jc.layer(self.rulerLayerId).level(9);

        self.tooltipLayerId = canvasId + "_tooltipLayer"; // layer to show tooltip dialog
        self.tooltipLayer = jc.layer(self.tooltipLayerId).draggable(true).level(3);
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
    }

    onSelected() {
        this.imageSelectorService.selectImage(this.imageData);
    }

    getBorderStyle(): string {
        return this.selected ? "1px solid #F90" : "1px solid #555555";
    }

    doSelectImage(viewerImageData: ViewerImageData) {
        this.selected = (this._imageData === viewerImageData);
    }

    doSelectImageByThumbnail(image: Image) {
        this.selected = (this.image === image);
    }

    //private doSelectById(id: string, selected: boolean): void {
    //    const o = document.getElementById(id);
    //    if (o !== undefined && o !== null) {
    //        o.style.border = selected ? '1px solid green' : '1px solid #555555';
    //    }
    //}

    //private doSelectByImageViewerId(imageViewerId: string): void {
    //    var selectedDivId = "DivImageViewer" + imageViewerId;
    //    var divId = 'DivImageViewer' + this.imageData.getId();
    //    this.selected = selectedDivId === divId;
    //    this.doSelectById(divId, this.selected);
    //}

    private setContext(context: ViewContext) {
        const draggable = (context.action == ViewContextEnum.Pan) ||
            (context.action == ViewContextEnum.Select && this.curSelectObj == undefined);
        this.draggable(draggable);

        //each time context changed, we should unselect cur selected object
        this.selectObject(undefined);

        //if (previousCtx == contextEnum.create && ctx != contextEnum.create && this.tooltips) {
        //    //hide all tooltips
        //    var theObj = this.tooltips;
        //    var propertys = Object.getOwnPropertyNames(theObj);
        //    propertys.forEach(function (prop) {
        //        var obj = theObj[prop];
        //        if (obj instanceof annTooltip) {
        //            log('hide tooltip');
        //            obj.show(false);
        //        }
        //    });
        //}

        this.setCursor();
    }

    private onOperation(operation: OperationData) {
        if (!this.isImageLoaded)
            return;

        if (!this.selected)
            return;

        switch (operation.type) {
        case OperationEnum.Rotate:
        {
            this.rotate(operation.data.angle);
            break;
        }
        case OperationEnum.Flip:
        {
            this.flip(operation.data);
            break;
        }
        case OperationEnum.Invert:
        {

            break;
        }
        case OperationEnum.FitWidth:
        case OperationEnum.FitHeight:
        case OperationEnum.FitOriginal:
        case OperationEnum.FitWindow:
        {
            this.doFit(operation.type);
            break;
        }
        case OperationEnum.Reset:
        {
            this.doReset();
            break;
        }
        case OperationEnum.ShowOverlay:
        {
            this.olLayer.visible(operation.data.show);
            break;
        }
        case OperationEnum.ManualWL:
        {
            this.doManualWl();
            break;
        }

        }
    }

    private setCursor() {
        const canvas = this.canvas;
        const curContext = this.viewContext.curContext;
        const cursorUrl = this.baseUrl + "/assets/img/cursor";

        if (curContext.action == ViewContextEnum.WL) {
            var u = cursorUrl + "/adjustwl.cur";
            canvas.style.cursor = "url('{0}'),move".format(u);
        } else if (curContext.action == ViewContextEnum.Pan) {
            var u = cursorUrl + "/hand.cur";
            canvas.style.cursor = "url('{0}'),move".format(u);
        } else if (curContext.action == ViewContextEnum.Select) {
            canvas.style.cursor = "default";
        } else if (curContext.action == ViewContextEnum.Zoom) {
            var u = cursorUrl + "/zoom.cur";
            canvas.style.cursor = "url('{0}'),move".format(u);
        } else if (curContext.action == ViewContextEnum.Magnifier) {
            var u = cursorUrl + "/zoom.cur"; //TODO: get a manifier icon
            canvas.style.cursor = "url('{0}'),move".format(u);
        } else if (curContext.action == ViewContextEnum.ROIZoom) {
            var u = cursorUrl + "/rectzoom.cur";
            canvas.style.cursor = "url('{0}'),move".format(u);
        } else if (curContext.action == ViewContextEnum.SelectAnn) {
            var u = cursorUrl + "/select.cur";
            canvas.style.cursor = "url('{0}'),move".format(u);
        } else if (curContext.action == ViewContextEnum.Create) {
            canvas.style.cursor = "default";
            const parm = curContext.data;
            if (parm && parm.type) {
                //if (parm.type.prototype.type == annType.stamp) {
                //    var u = this.cursorUrl + '/ann_stamp.cur';
                //    canvas.style.cursor = "url('{0}'),move".format(u);
                //} else {
                //    canvas.style.cursor = "crosshair";
                //}
            }
        }
    }

    rotate(angle) {
        if (angle == 0) //rotate 0 will cause the transform messed
            return;

        this.imgLayer.rotate(angle, "center");
        this.updateImageTransform();

        //var totalAngle = this.getRotate();
        //this.annotationList.forEach(function (obj) {
        //    if (obj.onRotate) {
        //        obj.onRotate(angle, totalAngle);
        //    }
        //}); 
    }

    flip(flipVertical: boolean) {

        const viewPort = cornerstone.getViewport(this.helpElement);

        if (flipVertical) {
            viewPort.vflip = !viewPort.vflip;
        } else {
            viewPort.hflip = !viewPort.hflip;
        }

        cornerstone.setViewport(this.helpElement, viewPort);
    }

    scale(value) {
        if (value > 0) {
            this.imgLayer.scale(value);
            this.updateImageTransform();

            //var totalScale = this.getScale();
            ////adjust objects' size
            //this.annotationList.forEach(function (obj) {
            //    if (obj.onScale) {
            //        obj.onScale(totalScale);
            //    }
            //});

            //this.updateTag(dicomTag.customScale, totalScale.toPrecision(2));

            //if (value !== 1) {
            //    this.refreshRuler();
            //}
        }
    }

    translate(x, y) {
        this.imgLayer.translate(x, y);
        this.updateImageTransform();

        //this.annotationList.forEach(function (obj) {
        //    if (obj.onTranslate) {
        //        obj.onTranslate();
        //    }
        //});
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

        this.rotate(curRotate);
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
        this.ctImage.windowWidth = this.originalWindowWidth;
        this.ctImage.windowCenter = this.originalWindowCenter;

        const viewPort = cornerstone.getViewport(this.helpElement);
        viewPort.voi.windowCenter = this.originalWindowCenter;
        viewPort.voi.windowWidth = this.originalWindowWidth;

        // Reset Flip status
        viewPort.vflip = false;
        viewPort.hflip = false;

        cornerstone.setViewport(this.helpElement, viewPort);
    }

    doFit(fitType: OperationEnum) {

        if (!this.isImageLoaded)
            return;

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
        if (curRotate / 180 !== 0) {
            widthScale = canvasWidth / height;
            heightScale = canvasHeight / width;
        }


        this.imgLayer.transform(1, 0, 0, 1, 0, 0, true);


        if (fitType === OperationEnum.FitWindow) {
            if (widthScale < heightScale) {
                this.scale(widthScale);
                this.translate((canvasWidth - width * widthScale) / 2, (canvasHeight - height * widthScale) / 2);
            } else {
                this.scale(heightScale);
                this.translate((canvasWidth - width * heightScale) / 2, (canvasHeight - height * heightScale) / 2);
            }
        } else if (fitType === OperationEnum.FitHeight) {
            this.scale(heightScale);
            this.translate((canvasWidth - width * heightScale) / 2, (canvasHeight - height * heightScale) / 2);
        } else if (fitType === OperationEnum.FitWidth) {
            this.scale(widthScale);
            this.translate((canvasWidth - width * widthScale) / 2, (canvasHeight - height * widthScale) / 2);
        } else if (fitType === OperationEnum.FitOriginal) {
            this.translate((canvasWidth - width) / 2, (canvasHeight - height) / 2);
        }


        this.rotate(curRotate);
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
        this.rulerLayer.visible(visible);
    }

    draggable(draggable: Boolean) {
        var self = this;
        if (!self.isImageLoaded) {
            return;
        }

        var canvas = this.canvas;
        var curContext = this.viewContext.curContext;

        this.imgLayer.draggable({
            disabled: !draggable,
            start: function(arg) {
                if (curContext.action == ViewContextEnum.Select || curContext.action == ViewContextEnum.Create) {
                    canvas.style.cursor = "move";
                }
            },
            stop: function(arg) {
                if (curContext.action == ViewContextEnum.Select || curContext.action == ViewContextEnum.Create) {
                    canvas.style.cursor = "auto";
                }
            },
            drag: function(arg) {
                self.annotationList.forEach(function(obj) {
                    if (obj.onTranslate) {
                        obj.onTranslate.call(obj);
                    }
                });
            }
        });
    }

    private doWL(deltaX, deltaY) {
        if (!this.isImageLoaded)
            return;

        const self = this;
        const dcmImg = self.ctImage;

        if (deltaX != 0 || deltaY != 0) {
            const maxVOI = dcmImg.maxPixelValue * dcmImg.slope + dcmImg.intercept;
            const minVOI = dcmImg.minPixelValue * dcmImg.slope + dcmImg.intercept;
            const imageDynamicRange = maxVOI - minVOI;
            const multiplier = imageDynamicRange / 1024;

            const width = dcmImg.windowWidth + Math.round(deltaX * multiplier);
            const center = dcmImg.windowCenter + Math.round(deltaY * multiplier);

            this.doWlByValue(center, width);

            //dcmImg.render(width, center, function () {
            //    //update window level values
            //    self.updateTag(dicomTag.windowWidth, dcmImg.windowWidth);
            //    self.updateTag(dicomTag.windowCenter, dcmImg.windowCenter);
            //});
        }
    }

    private doZoom(delta) {
        if (!this.isImageLoaded)
            return;

        let scaleValue = 1;
        if (delta > 0) {
            scaleValue = 1.05;
        } else {
            scaleValue = 0.95;
        }

        const preWidth = this.imgLayer.getRect().width;
        this.scale(scaleValue);
        const afterWidth = this.imgLayer.getRect().width;

        delta = (afterWidth - preWidth) / 2;
        this.translate(-delta, -delta);
    }

    private registerImgLayerEvents() {
        var self = this;

        //register imglayer events, note the arg.x/y is screen (canvas) coordinates
        self.imgLayer.mousedown(function(arg) {
            self.onMouseDown(arg);
        });
        self.imgLayer.mousemove(function(arg) {
            self.onMouseMove(arg);
        });
        self.imgLayer.mouseup(function(arg) {
            self.onMouseUp(arg);
        });
        self.imgLayer.mouseout(function(arg) {
            self.onMouseOut(arg);
        });
        self.imgLayer.click(function(arg) {
            //self.onClick(arg);
        });
        self.imgLayer.dblclick(function(arg) { //the event happend after div's dblclick and canva's dblclick, so no use.
            //log('imglayer dblclick ' + self.canvas.id);
        });
    }

    private onMouseDown(evt) {
        const self = this;
        if (!self.isImageLoaded) {
            return;
        }

        const viewContext = self.viewContext;
        //log('viwer mouse down: ' + this.canvasId);

        //if in select context, and not click any object, will unselect all objects.
        if (viewContext.curContext.action == ViewContextEnum.Select) {
            if (!evt.event.cancelBubble) {
                if (self.curSelectObj && self.curSelectObj.select) {
                    self.curSelectObj.select(false);
                    self.curSelectObj = undefined;
                }
                self.draggable(true);
            } else { //an annobject has been selected
                self.draggable(false);
            }
        } else if (viewContext.curContext.action == ViewContextEnum.Create) {
            const parm = viewContext.curContext.data;
            if (parm && parm.type && !parm.objCreated) {
                const newObj: AnnObject = new parm.type();
                self.createAnnObject(newObj, parm);

                parm.objCreated = true; //stop create the annObject again
            }
        }

        self.emitEvent(evt, EventType.MouseDown, "onMouseDown");
    }

    private onMouseMove(evt) {
        this.emitEvent(evt, EventType.MouseMove, "onMouseMove");
    }

    private onMouseOut(evt) {
        //log('viwer mouse out: ' + this.canvasId);
        this.emitEvent(evt, EventType.MouseOut, "onMouseOut");
    }

    private onMouseUp(evt) {
        //log('viwer mouse up: ' +this.canvasId);
        this.emitEvent(evt, EventType.MouseUp, "onMouseUp");
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
            arg = AnnObject.screenToImage(arg, this.imgLayer.transform());
        }

        handlers.forEach(function(obj) {
            if (obj[handler]) {
                obj[handler](arg);
            }
        });
    }

    private registerCanvasEvents() {
        var self = this;

        self.canvas.addEventListener("contextmenu",
            function(evt) {
                self.onCanvasContextMenu(evt);
            });

        //$(self.canvas).on("DOMMouseScroll mousewheel", function (evt) {
        //    self.onCanvasMouseWheel(evt);
        //});

        $(self.canvas).on("dblclick",
            function(evt) {
                self.onCanvasDblClick(evt);
            });

        //TODO: keyup not work any more
        const parent = self.canvas.parentElement;
        $(parent).on("keyup",
            function(key) {
                self.onCanvasKeyUp(key);
            });

        $(self.canvas).on("mousemove",
            function(evt) {
                self.onCanvasMouseMove(evt);
            });

        $(self.canvas).on("mousedown",
            function(evt) {
                self.onCanvasMouseDown(evt);
            });

        $(self.canvas).on("mouseup",
            function(evt) {
                self.onCanvasMouseUp(evt);
            });

        $(self.canvas).on("mouseover",
            function(evt) {
                self.onCanvasMouseOver(evt);
            });

        $(self.canvas).on("mouseout",
            function(evt) {
                self.onCanvasMouseOut(evt);
            });
    }

    private onCanvasKeyUp(key) {
        if (!this.isImageLoaded) {
            return;
        }

        //console.log(key.keyCode);
        //if (key.keyCode == 46) {//user press Delete
        //    this.deleteCurObject();
        //    if (viewContext.curContext == contextEnum.create) {//delete under creating object
        //        viewContext.setContext(contextEnum.select);
        //    }
        //} else if (key.keyCode == 82) { //r
        //    this.rotate(30);
        //} else if (key.keyCode == 90) {//z
        //    this.scale(1.1);
        //}
    }

    private onCanvasDblClick(evt) {
        //the imagelayer's double click events fires mousedown=>mouseup=>mousedown, which missed the last mosueup event, so we manually fire the mouseup here
        if (!this.isViewInited)
            return;

        this.canvas.onmouseup(evt); //cause jc to trigger mouseup event, which will stop the drag (imglayer)
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

    private onCanvasMouseDown(evt) {
        if (!this.isImageLoaded) {
            return;
        }

        this.mouseEventHelper._mouseWhich = evt.which; //_mouseWhich has value means current is mouse down
        this.mouseEventHelper._mouseDownPosCvs = { x: evt.offsetX, y: evt.offsetY };

        if (this.mouseEventHelper._mouseWhich == 3) { //right mouse
            this.mouseEventHelper._lastContext = this.viewContext.curContext;
            this.viewContext.setContext(ViewContextEnum.WL);
        } else if (this.mouseEventHelper._mouseWhich == 1) {
            if (this.viewContext.curContext.action == ViewContextEnum.Magnifier) {
                //this._startMagnifier(evt);
            }
        }
    }

    private onCanvasMouseMove(evt) {
        const self = this;
        if (!this.isImageLoaded) {
            return;
        }

        const curContext = this.viewContext.curContext;

        if (!self.mouseEventHelper._lastPosCvs) {
            self.mouseEventHelper._lastPosCvs = { x: evt.offsetX, y: evt.offsetY };
        }
        const deltaX = evt.offsetX - self.mouseEventHelper._lastPosCvs.x;
        const deltaY = evt.offsetY - self.mouseEventHelper._lastPosCvs.y;

        if (self.mouseEventHelper._mouseWhich == 3) {

            if (curContext.action == ViewContextEnum.WL) {
                self.doWL(deltaX, deltaY);
            }
        } else if (self.mouseEventHelper._mouseWhich == 1) {

            if (curContext.action == ViewContextEnum.Magnifier) {
                //if (self._magnifying) {
                //    self._loadMagnifierData(evt);
                //}
            } else if (curContext.action == ViewContextEnum.WL) {
                self.doWL(deltaX, deltaY);
            } else if (curContext.action == ViewContextEnum.Zoom) {
                const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
                if (Math.abs(delta) > 0) {
                    self.doZoom(delta);
                }

            } else if (curContext.action == ViewContextEnum.ROIZoom) {
                const curPosCvs = {
                    x: evt.offsetX,
                    y: evt.offsetY
                };

                //self.drawROIZoom(self.mouseEventHelper._mouseDownPosCvs, curPosCvs);
            }

        }

        self.mouseEventHelper._lastPosCvs = { x: evt.offsetX, y: evt.offsetY };
    }

    private onCanvasMouseUp(evt) {
        const self = this;
        if (!self.isImageLoaded) {
            return;
        }

        const curContext = this.viewContext.curContext;

        if (self.mouseEventHelper._mouseWhich == 3) {

            if (curContext.action == ViewContextEnum.WL) {
                if (self.mouseEventHelper._lastContext.action == ViewContextEnum.Create) { //cancel create
                    this.viewContext.setContext(ViewContextEnum.Select);
                } else {
                    this.viewContext.setContext(self.mouseEventHelper._lastContext.action,
                        self.mouseEventHelper._lastContext.data);
                }
            }
        } else if (self.mouseEventHelper._mouseWhich == 1) {

            //if (curContext.action == contextEnum.magnifier && self._magnifying) {
            //    self._endMagnifier();
            //} else if (curContext.action == contextEnum.roizoom) {
            //    var endPosCvs = {
            //        x: evt.offsetX,
            //        y: evt.offsetY
            //    }
            //    self._applyROIZoom(self._mouseDownPosCvs, endPosCvs);
            //}
        }

        self.mouseEventHelper._mouseWhich = 0;
    }

    private onCanvasMouseOut(evt) {
        const self = this;
        if (!self.isImageLoaded) {
            return;
        }

        self.canvas.onmouseup(evt); //cause jc to trigger mouseup event, which will stop the drag (imglayer)
        if (self.mouseEventHelper._mouseWhich != 0) {
            self.onCanvasMouseUp(evt); //call mouseup to end the action
        }

        ////log('mouse out ' + self.id);

        //if (viewContext.curContext == contextEnum.create) {
        //    var parm = viewContext.curContextParam;
        //    if (parm && parm.type && parm.tooltip && !parm.objCreated) {
        //        var tooltip = self.getTooltip(parm.type);
        //        tooltip.show(false);
        //    }
        //}
    }

    private onCanvasMouseOver(evt) {
        const self = this;
        if (!self.isImageLoaded) {
            return;
        }

        //log('mouse over ' + self.id + ', contex:' + viewContext.curContext);
        //if (viewContext.curContext == contextEnum.create) {
        //    var parm = viewContext.curContextParam;
        //    if (parm && parm.type && !parm.objCreated && parm.tooltip) {//show tooltip before the object is created
        //        log('mouse over: show tooltip');
        //        var tooltip = self.getTooltip(parm.type);
        //        tooltip.setParentCreated(false);
        //        tooltip.setStep(stepEnum.step1);
        //        tooltip.show(true);
        //    }
        //}
    }

    private selectObject(obj) {
        if (obj && obj instanceof AnnObject) {
            if (this.curSelectObj !== obj) {
                if (this.curSelectObj) {
                    this.curSelectObj.select(false);
                }
                this.curSelectObj = obj;
                this.curSelectObj.select(true);
            }
        } else { //call selectObject(undefined) to unselect all, e.g. user clicked the canvas
            if (this.curSelectObj) {
                if (this.curSelectObj.isCreated) {
                    this.curSelectObj.select(false);
                } else {
                    this.deleteCurObject();
                }
            }

            this.curSelectObj = undefined;
        }
    }

    private createAnnObject(annObj: AnnObject, param: any) {
        if (!this.isImageLoaded)
            return;

        var self = this;
        if (annObj.hasToolTip()) {
            //show tooltip
        }

        self.showAnnotation(true); //in case user closed the annotation

        if (self.curSelectObj) {
            self.selectObject(undefined);
        }

        self.curSelectObj = annObj;
        annObj.startCreate(self,
            function() {
                const newObj = this;
                if (newObj && newObj.isCreated) {
                    //finish create
                    if (self.annotationList.indexOf(newObj) < 0) {
                        self.annotationList.push(newObj);
                    }

                    self.viewContext.setContext(ViewContextEnum.Select);
                    self.selectObject(newObj);
                }
            },
            param);

        return annObj;
    }

    private deleteCurObject() {
        const curObj = this.curSelectObj;
        if (curObj) {
            this.deleteObject(curObj);
            this.curSelectObj = undefined;
        }
    }

    private deleteObject(obj) {
        if (obj && obj instanceof AnnObject) {
            obj.del();

            let i = 0;
            let found = false;
            const len = this.annotationList.length;
            for (i = 0; i < len; i++) {
                if (this.annotationList[i] === obj) {
                    found = true;
                    break;
                }
            }

            if (found) {
                this.annotationList.splice(i, 1);
                if (this.curSelectObj === obj) {
                    this.curSelectObj = undefined;
                }
            }
        }
    }

    private doManualWl() {
        const windowLevelData = new WindowLevelData();
        windowLevelData.windowCenter = this.ctImage.windowCenter;
        windowLevelData.windowWidth = this.ctImage.windowWidth;
        this.dialogService.showDialog(ManualWlDialogComponent, windowLevelData).subscribe(
            val => {
                this.doWlByValue(val.windowCenter, val.windowWidth);
            }
        );

    }

    private doWlByValue(center: number, width: number) {
        const viewPort = cornerstone.getViewport(this.helpElement);
        viewPort.voi.windowCenter = center;
        viewPort.voi.windowWidth = width;
        cornerstone.setViewport(this.helpElement, viewPort);

        this.ctImage.windowWidth = width;
        this.ctImage.windowCenter = center;
    }
}
