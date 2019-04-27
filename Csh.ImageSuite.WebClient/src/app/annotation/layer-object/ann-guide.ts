﻿import { Point, AnnGuideStepButton, AnnGuideActionButton, AnnGuideData, AnnGuideStepData } from '../../models/annotation';
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
    private stepButtonWidth = 25;
    private stepButtonHeight = 20;
    private actionButtonHeight = 40;

    private startX: number;
    private annStepButtonList: Array<AnnGuideStepButton> = [];
    private annGuideCloseButton: AnnGuideActionButton;
    private annGuideResetButton: AnnGuideActionButton;
    private annGuideHideButton: AnnGuideActionButton;
    private annGuideShowButton: AnnGuideActionButton;

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

    static annGuideDataList: Array<AnnGuideData> = [];

    constructor(private imageViewer: IImageViewer) {
        this.layerId = imageViewer.getAnnGuideLayerId();
        this.baseUrl = this.imageViewer.getBaseUrl();
        this.font = this.imageViewer.getTextFont();

        this.annGuideCloseButton = new AnnGuideActionButton(this.baseUrl, "close");
        this.annGuideCloseButton.onButtonClick = this.onClose;
        this.annGuideResetButton = new AnnGuideActionButton(this.baseUrl, "reset");
        this.annGuideResetButton.onButtonClick = this.onReset;
        this.annGuideHideButton = new AnnGuideActionButton(this.baseUrl, "hide");
        this.annGuideHideButton.onButtonClick = this.onHide;
        this.annGuideShowButton = new AnnGuideActionButton(this.baseUrl, "show");
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

    static createAnnGuideDataList() {
        const annGuideCervicalCurve = new AnnGuideData("Cervical Curve", "ann_cervicalcurve");
        annGuideCervicalCurve.addStepData(new AnnGuideStepData("CGXAnnCervicalCurve_01.png", "Step 1. Click to place a point on the center of the anterior tubercle of the anterior arch"));
        annGuideCervicalCurve.addStepData(new AnnGuideStepData("CGXAnnCervicalCurve_02.png", "Step 2. Click to place a point on the top center of the first thoracic vertebrae"));
        annGuideCervicalCurve.addStepData(new AnnGuideStepData("CGXAnnCervicalCurve_03.png", "Step 3. Click on either side of the line to flip the curve. Move center point to change radius of curve",
            "Step 3. Move center point to change radius of curve"));

        this.annGuideDataList.push(annGuideCervicalCurve);
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions

    // Show the guide
    show(targetAnnName: string, stepIndex: number = 0) {
        // Save the old cursor
        this.oldCursor = this.imageViewer.getCanvas().style.cursor;

        // show the guide layer
        this.imageViewer.getAnnGuideLayer().visible(true);
        
        // 
        if (this.targetAnnName !== targetAnnName) {
            this.targetAnnName = targetAnnName;
            this.stepIndex = stepIndex;

            this.delJcObj();

            this.createStepButtonList(targetAnnName);
           
            let promiseList = [];
            for (let i = 0; i < this.annStepButtonList.length; i++) {
                promiseList.push(this.createPromiseForStepButton(i));
            }

            promiseList = promiseList.concat(this.createPromiseListForActionButton(this.annGuideCloseButton));
            promiseList = promiseList.concat(this.createPromiseListForActionButton(this.annGuideResetButton));
            promiseList = promiseList.concat(this.createPromiseListForActionButton(this.annGuideHideButton));
            promiseList = promiseList.concat(this.createPromiseListForActionButton(this.annGuideShowButton));

            // Draw the guide UI when all necessary data are loaded from server
            Promise.all(promiseList).then(arg => {
                this.draw();
            }).catch(arg => {
                console.error(arg);
            });
        } else {
            // Same annotation
            this.stepTo(stepIndex);
            this.setGuideTargetObj(undefined);
        }
    }

    // Hide the guide layer.
    hide() {
        this.imageViewer.getAnnGuideLayer().visible(false);
        // Set the target annotation object to undefined
        this.annGuideTarget = undefined;
    }

    // Check if the guide layer is hidden
    isHidden(): boolean {
        return !(this.imageViewer.getAnnGuideLayer()._visible);
    }

    // Set the tareget annoation object
    setGuideTargetObj(guideTarget: AnnExtendObject) {
        this.annGuideTarget = guideTarget;
        if (this.annGuideTarget && this.annGuideTarget.isCreated()) {
            // If the annotation is created, need to disable the Close and Reset button
            this.annGuideCloseButton.onDisabled();
            this.annGuideResetButton.onDisabled();
        } else {
            // No target annotation or the target annotation is creating, need to enable the 
            // Close and Reset bubton in case they were disabled before.
            this.annGuideCloseButton.onUp();
            this.annGuideResetButton.onUp();
        }
    }

    // Step the guide
    step() {
        if (this.stepIndex < this.annStepButtonList.length - 1) {
            this.stepTo(this.stepIndex + 1);
        } else { 
            // If ended, hide the guide
            this.imageViewer.getAnnGuideLayer().visible(false);
        }
        
    }

    // Get current step index
    getStepIndex(): number {
        return this.stepIndex;
    }

    // Check if the mouse is clicked in the guide area
    hitTest(point: Point): boolean {
        return this.imageViewer.getAnnGuideLayer()._visible && this.jcBackground && AnnObject.pointInRect(point, this.jcBackground.getRect());
    }

    // Step to the given step index
    stepTo(step: number) {
        if (step < 0 || step > this.annStepButtonList.length) {
            alert(`Invalid step number ${step}`);
            return;
        }

        // Step to end, close the guide
        if (step === this.annStepButtonList.length) {
            this.onClose();
            return;
        }

        // De-highlight the step list that previous highlighted
        this.annStepButtonList[this.stepIndex].jcBackgroundBorder.color("#FFF");
        this.annStepButtonList[this.stepIndex].jcText.color("#FFF");


        this.stepIndex = step;

        // Highlight the step
        this.annStepButtonList[this.stepIndex].jcBackgroundBorder.color("#F90");
        this.annStepButtonList[this.stepIndex].jcText.color("#F90");

        // Update the text and image
        this.jcStepText.string(this.getTipText(this.annStepButtonList[this.stepIndex]));
        this.jcTutorImage._img = this.annStepButtonList[this.stepIndex].imageData;
        this.jcCurrentStep.string((this.stepIndex + 1).toString());
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions

    // Draw the guide
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

    // Create promise for loading the image of step button
    private createPromiseForStepButton(index: number): any {
        const promise = new Promise((resolve, reject) => {
            this.annStepButtonList[index].imageData.onload = ev => {
                resolve();
            };

            this.annStepButtonList[index].imageData.onerror = ev => {
                reject(ev);
            };

            this.annStepButtonList[index].loadImage();
        });

        return promise;
    }

    // Create promise list for loading the image of action button
    private createPromiseListForActionButton(annGuideButton: AnnGuideActionButton): any {
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

    // Draw the background of guide
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

    // Draw tutor image
    private drawTutorImage() {
        // The size of the pictures is always same : 125*150
        this.jcTutorImage = jCanvaScript.image(this.annStepButtonList[this.stepIndex].imageData, this.startX + this.interval, this.interval * 2).layer(this.layerId);
    }

    // Step the step button list
    private drawStepList() {
        const count = this.annStepButtonList.length;
        const defaultWidth = this.stepButtonWidth * count + this.interval * (count - 1);
        const center = this.startX + this.imageWidth + this.interval * 2 + this.textAreaWidth / 2;
        const start = center - defaultWidth / 2;

        for (let i = 0; i < count; i++) {
            this.annStepButtonList[i].jcBackground = jCanvaScript.rect(start + i * (this.stepButtonWidth + this.interval), this.interval * 4, this.stepButtonWidth, this.stepButtonHeight, "#111", true).layer(this.layerId);
            this.annStepButtonList[i].jcText = jCanvaScript.text((i + 1).toString(), start + this.stepButtonWidth / 2 + i * (this.stepButtonWidth + this.interval), this.interval * 7)
                .color(this.font.color).font(this.font.getCanvasFontString()).align("center").layer(this.layerId);
            this.annStepButtonList[i].jcBackgroundBorder = jCanvaScript.rect(start + i * (this.stepButtonWidth + this.interval), this.interval * 4, this.stepButtonWidth, this.stepButtonHeight, "#FFF").layer(this.layerId);

            this.setStepButtonEvent(this.annStepButtonList[i]);
        }

        this.jcAnnotationName = jCanvaScript.text(this.targetAnnName, center, this.interval * 12).color("#F90").font(this.font.getCanvasFontString()).align("center").layer(this.layerId);
        this.jcStepText = jCanvaScript.text(this.getTipText(this.annStepButtonList[this.stepIndex]), this.startX + this.imageWidth + this.interval * 4, this.interval * 15, this.textAreaWidth - this.interval * 2)
            .color(this.font.color).font(this.font.getCanvasFontString()).align("left").layer(this.layerId);

        this.annStepButtonList[this.stepIndex].jcBackgroundBorder.color("#F90");
        this.annStepButtonList[this.stepIndex].jcText.color("#F90");
    }

    // Draw the action button
    private drawActionButton() {
        const startX = this.startX + this.imageWidth + this.interval * 3 + (this.showStepList ? this.textAreaWidth : -this.interval);
        const startY = this.interval * 2;

        this.annGuideCloseButton.jcImage = jCanvaScript.image(this.getActionButtonImage(this.annGuideCloseButton),
            startX, startY).layer(this.layerId);
        this.annGuideResetButton.jcImage = jCanvaScript.image(this.getActionButtonImage(this.annGuideResetButton),
            startX, startY + this.actionButtonHeight + this.interval).layer(this.layerId);
        this.setActionButtonEvent(this.annGuideCloseButton);
        this.setActionButtonEvent(this.annGuideResetButton);

        if (this.showStepList) {
            this.annGuideHideButton.jcImage = jCanvaScript.image(this.annGuideHideButton.getUpImage(),
                startX, startY + (this.actionButtonHeight + this.interval) * 2).layer(this.layerId);
            this.setActionButtonEvent(this.annGuideHideButton);
        } else {
            this.annGuideShowButton.jcImage = jCanvaScript.image(this.annGuideShowButton.getUpImage(),
                startX, startY + (this.actionButtonHeight + this.interval) * 2).layer(this.layerId);
            this.setActionButtonEvent(this.annGuideShowButton);
        }
        
        this.jcCurrentStep = jCanvaScript.text((this.stepIndex + 1).toString(), startX + this.actionButtonHeight / 2, this.defaultHeight - this.interval)
            .color(this.font.color).font(this.font.getCanvasFontString()).align("center").layer(this.layerId);
    }

    // Set step button mouse event
    private setStepButtonEvent(annGuideStepButton: AnnGuideStepButton) {
        annGuideStepButton.jcBackgroundBorder._onmouseover = arg => {
            annGuideStepButton.jcBackgroundBorder.color("#F90");
            this.imageViewer.getCanvas().style.cursor = "pointer";

            this.jcStepText.string(this.getTipText(annGuideStepButton));
            this.jcTutorImage._img = annGuideStepButton.imageData;

            if (this.annGuideTarget.isCreated()) {
                this.imageViewer.selectChildByStepIndex(annGuideStepButton.stepIndex);
            }
        };

        annGuideStepButton.jcBackgroundBorder._onmouseout = arg => {
            if (annGuideStepButton !== this.annStepButtonList[this.stepIndex]) {
                annGuideStepButton.jcBackgroundBorder.color("#FFF");
            }

            this.imageViewer.getCanvas().style.cursor = "default";
            this.jcStepText.string(this.getTipText(this.annStepButtonList[this.stepIndex]));
            this.jcTutorImage._img = this.annStepButtonList[this.stepIndex].imageData;
        };
    }

    // Set action button mouse event
    private setActionButtonEvent(annGuideButton: AnnGuideActionButton) {
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

    // Check if need to ignore the mouse event
    private ignoreMouseEvent(annGuideButton: AnnGuideActionButton): boolean {
        return this.isHidden() || annGuideButton.isDisabled();
    }

    // Delete all jc object
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

        this.annStepButtonList.forEach(stepObj => stepObj.del());
    }

    // Close the guide
    private onClose() {
        this.imageViewer.getAnnGuideLayer().visible(false);
        this.imageViewer.cancelCreate(false);
    }

    // Reset the guide
    private onReset() {
        this.stepTo(0);
        this.imageViewer.cancelCreate(true);
    }

    // Hide the step list
    private onHide() {
        this.delJcObj();
        this.showStepList = false;
        this.draw();
        this.imageViewer.getCanvas().style.cursor = this.oldCursor;
    }

    // Show the step list
    private onShow() {
        this.delJcObj();
        this.showStepList = true;
        this.draw();
        this.imageViewer.getCanvas().style.cursor = "default";
    }

    private createStepButtonList(annName: string) {
        const result = AnnGuide.annGuideDataList.filter(guideData => guideData.annName === annName);
        if (result.length === 0) {
            alert("Can't find annotation " + annName + " in the list");
            return;
        }

        this.annStepButtonList.length = 0;
        const stepList = result[0].guideStepList;
        for (let i = 0; i < stepList.length; i ++) {
            this.annStepButtonList.push(new AnnGuideStepButton(i, this.baseUrl, stepList[i]));
        }
    }

    private isTargetAnnCreated(): boolean {
        return this.annGuideTarget ? this.annGuideTarget.isCreated() : false;
    }

    private getTipText(annGuideStepButton: AnnGuideStepButton): string {
        const annCreated = this.isTargetAnnCreated();
        return annGuideStepButton.getTipText(annCreated);
    }

    private getActionButtonImage(annGuideActionButton: AnnGuideActionButton): any {
        const annCreated = this.isTargetAnnCreated();
        return annCreated ? annGuideActionButton.getDisabledImage() : annGuideActionButton.getUpImage();
    }
}