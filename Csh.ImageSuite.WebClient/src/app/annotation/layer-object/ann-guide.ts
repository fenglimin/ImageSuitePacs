import { Point, AnnGuideStep, AnnGuideActionButton as AnnGuideButton } from '../../models/annotation';
import { MouseEventType, AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnExtendObject } from "../extend-object/ann-extend-object";
import { FontData } from '../../models/misc-data';

export class AnnGuide {

    private layerId: string;
    private baseUrl: string;

    private backgroundColor = "rgba(96,96,96,0.6)";
    private borderColor = "#888";

    private defaultWidth = 685;
    private defaultHeight = 160;

    private textAreaWidth = 500;
    private imageWidth = 125;
    private imageHeight = 150;
    private interval = 5;
    private textBoxWidth = 25;
    private textBoxHeight = 20;
    private buttonImageHeight = 40;

    private startX: number;
    private annStepList = [];
    private annGuideCloseButton: AnnGuideButton;
    private annGuideResetButton: AnnGuideButton;
    private annGuideHideButton: AnnGuideButton;
    private annGuideShowButton: AnnGuideButton;

    private stepIndex = 0;
    private font: FontData;
    private oldCursor: any;

    private jcBackground: any;
    private jcBackgroundBorder: any;
    private jcTextAreaBackground: any;
    private jcTutorImage: any;
    private jcCurrentStep: any;
    private jcAnnotationName: any;
    private jcStepText: any;

    private showStepList = true;

    private annGuideTarget: AnnExtendObject;
    private targetAnnName: string;

    constructor(private imageViewer: IImageViewer) {
        this.layerId = imageViewer.getAnnGuideLayerId();
        this.baseUrl = this.imageViewer.getBaseUrl();
        this.font = this.imageViewer.getTextFont();

        this.annGuideCloseButton = new AnnGuideButton(this.baseUrl, "close");
        this.annGuideCloseButton.onButtonClick = this.onClose;
        this.annGuideResetButton = new AnnGuideButton(this.baseUrl, "reset");
        this.annGuideResetButton.onButtonClick = this.onReset;
        this.annGuideHideButton = new AnnGuideButton(this.baseUrl, "hide");
        this.annGuideHideButton.onButtonClick = this.onHide;
        this.annGuideShowButton = new AnnGuideButton(this.baseUrl, "show");
        this.annGuideShowButton.onButtonClick = this.onShow;

        const guideLayer = this.imageViewer.getAnnGuideLayer();
        guideLayer.click(arg => false);
        guideLayer.dblclick(arg => false);
        guideLayer.mousedown(arg => false);
        guideLayer.mouseup(arg => false);
        guideLayer.mousemove(arg => false);

        guideLayer.mouseover((arg) => {
            if (!this.isHidden()) {
                this.imageViewer.getCanvas().style.cursor = "default";
            }
            
            return false;
        });

        guideLayer.mouseout((arg) => {
            if (!this.isHidden()) {
                this.imageViewer.getCanvas().style.cursor = this.oldCursor;
            }
            
            return false;
        });
    }

    show(targetAnnName: string, stepIndex: number = 0) {
        this.oldCursor = this.imageViewer.getCanvas().style.cursor;
        this.imageViewer.getAnnGuideLayer().visible(true);
        

        if (this.targetAnnName !== targetAnnName) {
            this.targetAnnName = targetAnnName;
            this.stepIndex = stepIndex;

            this.delJcObj();
            this.annStepList.length = 0;

            this.annStepList.push(new AnnGuideStep(this.annStepList.length, this.baseUrl, "CGXAnnCervicalCurve_01.png", "Step 1. Click to place a point on the center of the anterior tubercle of the anterior arch"));
            this.annStepList.push(new AnnGuideStep(this.annStepList.length, this.baseUrl, "CGXAnnCervicalCurve_02.png", "Step 2. Click to place a point on the top center of the first thoracic vertebrae"));
            this.annStepList.push(new AnnGuideStep(this.annStepList.length, this.baseUrl, "CGXAnnCervicalCurve_03.png", "Step 3. Click on either side of the line to flip the curve. Move center point to change radius of curve"));

            let promiseList = [];
            for (let i = 0; i < this.annStepList.length; i++) {
                promiseList.push(this.createPromiseForStepButton(i));
            }

            promiseList = promiseList.concat(this.createPromiseListForActionButton(this.annGuideCloseButton));
            promiseList = promiseList.concat(this.createPromiseListForActionButton(this.annGuideResetButton));
            promiseList = promiseList.concat(this.createPromiseListForActionButton(this.annGuideHideButton));
            promiseList = promiseList.concat(this.createPromiseListForActionButton(this.annGuideShowButton));

            Promise.all(promiseList).then(arg => {

                this.draw();
            }).catch(arg => {
                console.error(arg);
            });
        } else {
            this.stepTo(stepIndex);
            this.setGuideTargetObj(undefined);
        }
    }

    hide() {
        this.imageViewer.getAnnGuideLayer().visible(false);
        this.annGuideTarget = undefined;
    }

    isHidden(): boolean {
        return !(this.imageViewer.getAnnGuideLayer()._visible);
    }

    setGuideTargetObj(guideTarget: AnnExtendObject) {
        this.annGuideTarget = guideTarget;
        if (this.annGuideTarget && this.annGuideTarget.isCreated()) {
            this.annGuideCloseButton.onDisabled();
            this.annGuideResetButton.onDisabled();
        } else {
            this.annGuideCloseButton.onUp();
            this.annGuideResetButton.onUp();
        }
    }

    step() {
        if (this.stepIndex < this.annStepList.length - 1) {
            this.stepTo(this.stepIndex + 1);
        } else { 
            this.imageViewer.getAnnGuideLayer().visible(false);
        }
        
    }

    getStepIndex(): number {
        return this.stepIndex;
    }

    hitTest(point: Point): boolean {
        return this.imageViewer.getAnnGuideLayer()._visible && this.jcBackground && AnnObject.pointInRect(point, this.jcBackground.getRect());
    }

    stepTo(step: number) {

        if (step < 0 || step > this.annStepList.length) {
            alert(`Invalid step number ${step}`);
            return;
        }

        if (step === this.annStepList.length) {
            this.onClose();
            return;
        }

        this.annStepList[this.stepIndex].jcBackgroundBorder.color("#FFF");
        this.annStepList[this.stepIndex].jcText.color("#FFF");

        this.stepIndex = step;

        this.annStepList[this.stepIndex].jcBackgroundBorder.color("#F90");
        this.annStepList[this.stepIndex].jcText.color("#F90");

        this.jcStepText.string(this.annStepList[this.stepIndex].tipText);
        this.jcTutorImage._img = this.annStepList[this.stepIndex].imageData;

        this.jcCurrentStep.string((this.stepIndex + 1).toString());
    }

    private draw() {

        const width = this.showStepList ? this.defaultWidth : this.defaultWidth - this.textAreaWidth - this.interval;
        this.startX = (this.imageViewer.getCanvas().width - width) / 2;
        if (this.startX < 0)
            this.startX = 0;

        this.drawBackground();
        this.drawTutorImage();
        if (this.showStepList) {
            this.drawStepList();
        }
        
        this.drawActionButton();
    }

    private createPromiseForStepButton(index: number): any {

        const promise = new Promise((resolve, reject) => {
            this.annStepList[index].imageData.onload = ev => {
                resolve();
            };

            this.annStepList[index].imageData.onerror = ev => {
                reject(ev);
            };

            this.annStepList[index].loadImage();
        });

        return promise;
    }

    private createPromiseListForActionButton(annGuideButton: AnnGuideButton): any {

        const promiseList = [];
        annGuideButton.imageDataList.forEach(imageData => {
            const promise = new Promise((resolve, reject) => {
                imageData.onload = ev => {
                    resolve();
                };

                imageData.onerror = ev => {
                    reject(ev);
                };

                annGuideButton.loadImage();
            });

            promiseList.push(promise);

        });

        return promiseList;
    }

    private drawBackground() {

        if (this.showStepList) {
            this.jcBackgroundBorder = jCanvaScript.rect(this.startX, this.interval, this.defaultWidth, this.defaultHeight, this.borderColor).layer(this.layerId);
            this.jcTextAreaBackground = jCanvaScript.rect(this.startX + this.imageWidth + this.interval * 2, this.interval * 2, this.textAreaWidth, this.defaultHeight - this.interval * 2, "#FFF").layer(this.layerId);
            this.jcBackground = jCanvaScript.rect(this.startX, this.interval, this.defaultWidth, this.defaultHeight, this.backgroundColor, true).layer(this.layerId);
        } else {
            this.jcBackgroundBorder = jCanvaScript.rect(this.startX, this.interval, this.defaultWidth - this.textAreaWidth - this.interval, this.defaultHeight, this.borderColor).layer(this.layerId);
            this.jcBackground = jCanvaScript.rect(this.startX, this.interval, this.defaultWidth - this.textAreaWidth - this.interval, this.defaultHeight, this.backgroundColor, true).layer(this.layerId);
        }
    }

    private drawTutorImage() {

        // The size of the pictures are same : 125*150
        this.jcTutorImage = jCanvaScript.image(this.annStepList[this.stepIndex].imageData, this.startX + this.interval, this.interval * 2).layer(this.layerId);
    }

    private drawStepList() {
        const count = this.annStepList.length;
        const defaultWidth = this.textBoxWidth * count + this.interval * (count - 1);
        const center = this.startX + this.imageWidth + this.interval * 2 + this.textAreaWidth / 2;
        const start = center - defaultWidth / 2;

        
        for (let i = 0; i < count; i++) {
            this.annStepList[i].jcBackground = jCanvaScript.rect(start + i * (this.textBoxWidth + this.interval), this.interval * 4, this.textBoxWidth, this.textBoxHeight, "#111", true).layer(this.layerId);
            this.annStepList[i].jcText = jCanvaScript.text((i + 1).toString(), start + this.textBoxWidth / 2 + i * (this.textBoxWidth + this.interval), this.interval * 7)
                .color(this.font.color).font(this.font.getCanvasFontString()).align("center").layer(this.layerId);
            this.annStepList[i].jcBackgroundBorder = jCanvaScript.rect(start + i * (this.textBoxWidth + this.interval), this.interval * 4, this.textBoxWidth, this.textBoxHeight, "#FFF").layer(this.layerId);

            this.setStepButtonEvent(this.annStepList[i]);
        }

        this.jcAnnotationName = jCanvaScript.text(this.targetAnnName, center, this.interval * 12).color("#F90").font(this.font.getCanvasFontString()).align("center").layer(this.layerId);
        this.jcStepText = jCanvaScript.text(this.annStepList[this.stepIndex].tipText, this.startX + this.imageWidth + this.interval * 4, this.interval * 15, this.textAreaWidth - this.interval * 2)
            .color(this.font.color).font(this.font.getCanvasFontString()).align("left").layer(this.layerId);

        this.annStepList[this.stepIndex].jcBackgroundBorder.color("#F90");
        this.annStepList[this.stepIndex].jcText.color("#F90");
    }

    private drawActionButton() {

        const startX = this.startX + this.imageWidth + this.interval * 3 + (this.showStepList ? this.textAreaWidth : -this.interval);
        const startY = this.interval * 2;

        this.annGuideCloseButton.jcImage = jCanvaScript.image(this.annGuideCloseButton.getUpImage(), startX, startY).layer(this.layerId);
        this.annGuideResetButton.jcImage = jCanvaScript.image(this.annGuideResetButton.getUpImage(), startX, startY + this.buttonImageHeight + this.interval).layer(this.layerId);
        this.setActionButtonEvent(this.annGuideCloseButton);
        this.setActionButtonEvent(this.annGuideResetButton);


        if (this.showStepList) {
            this.annGuideHideButton.jcImage = jCanvaScript.image(this.annGuideHideButton.getUpImage(), startX, startY + (this.buttonImageHeight + this.interval) * 2).layer(this.layerId);
            this.setActionButtonEvent(this.annGuideHideButton);
        } else {
            this.annGuideShowButton.jcImage = jCanvaScript.image(this.annGuideShowButton.getUpImage(), startX, startY + (this.buttonImageHeight + this.interval) * 2).layer(this.layerId);
            this.setActionButtonEvent(this.annGuideShowButton);
        }
        
        this.jcCurrentStep = jCanvaScript.text((this.stepIndex + 1).toString(), startX + this.buttonImageHeight / 2, this.defaultHeight - this.interval)
            .color(this.font.color).font(this.font.getCanvasFontString()).align("center").layer(this.layerId);
    }

    private setStepButtonEvent(annGuideStep: AnnGuideStep) {
        annGuideStep.jcBackgroundBorder._onmouseover = arg => {
            annGuideStep.jcBackgroundBorder.color("#F90");
            this.imageViewer.getCanvas().style.cursor = "pointer";

            this.jcStepText.string(annGuideStep.tipText);
            this.jcTutorImage._img = annGuideStep.imageData;

            this.imageViewer.selectChildByStepIndex(annGuideStep.stepIndex);
        };

        annGuideStep.jcBackgroundBorder._onmouseout = arg => {

            if (annGuideStep !== this.annStepList[this.stepIndex]) {
                annGuideStep.jcBackgroundBorder.color("#FFF");
            }

            this.imageViewer.getCanvas().style.cursor = "default";
            this.jcStepText.string(this.annStepList[this.stepIndex].tipText);
            this.jcTutorImage._img = this.annStepList[this.stepIndex].imageData;
        };
    }

    private setActionButtonEvent(annGuideButton: AnnGuideButton) {
        annGuideButton.jcImage._onmouseover = arg => {
            if (this.ignoreMouseEvent(annGuideButton)) return;
            
            annGuideButton.onHover();
            this.imageViewer.getCanvas().style.cursor = 'pointer';
        };

        annGuideButton.jcImage._onmouseout = arg => {
            if (this.ignoreMouseEvent(annGuideButton)) return;

            annGuideButton.onUp();
            this.imageViewer.getCanvas().style.cursor = "default";
        };

        annGuideButton.jcImage._onmousedown = arg => {
            if (this.ignoreMouseEvent(annGuideButton)) return;

            annGuideButton.onSelect();
            return false;
        };

        annGuideButton.jcImage._onmouseup = arg => {
            if (this.ignoreMouseEvent(annGuideButton)) return;

            annGuideButton.onUp();
            if (annGuideButton.onButtonClick) {
                annGuideButton.onButtonClick.call(this);
            }
            return false;
        };
    }

    private ignoreMouseEvent(annGuideButton: AnnGuideButton): boolean {
        return this.isHidden() || annGuideButton.isDisabled();
    }

    private delJcObj() {

        if (this.jcBackground) this.jcBackground.del();
        if (this.jcBackgroundBorder) this.jcBackgroundBorder.del();
        if (this.jcTextAreaBackground) this.jcTextAreaBackground.del();
        if (this.jcTutorImage) this.jcTutorImage.del();
        if (this.jcCurrentStep) this.jcCurrentStep.del();
        if (this.jcAnnotationName) this.jcAnnotationName.del();
        if (this.jcStepText) this.jcStepText.del();

        this.annGuideCloseButton.del();
        this.annGuideResetButton.del();
        this.annGuideHideButton.del();
        this.annGuideShowButton.del();

        this.annStepList.forEach(stepObj => stepObj.del());
    }

    private onClose() {
        this.imageViewer.getAnnGuideLayer().visible(false);
        this.imageViewer.cancelCreate(false);
    }

    private onReset() {
        this.stepTo(0);
    }

    private onHide() {
        this.delJcObj();
        this.showStepList = false;
        this.draw();
        this.imageViewer.getCanvas().style.cursor = this.oldCursor;
    }

    private onShow() {
        this.delJcObj();
        this.showStepList = true;
        this.draw();
        this.imageViewer.getCanvas().style.cursor = "default";
    }
}
