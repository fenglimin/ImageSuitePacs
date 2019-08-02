import { Image } from "../models/pssi";
import { ImageContextData } from "../models/image-operation";
import { AnnotationService } from "../services/annotation.service"
import { AnnExtendObject } from "../annotation/extend-object/ann-extend-object";
import { FontData } from "../models/misc-data";

export interface IImageViewer {

    getImageLayerId(): string;
    getAnnotationLayerId(): string;
    getAnnLabelLayerId(): string;
    getAnnGuideLayerId(): string;
    getAnnImageRulerLayerId(): string;
    getTextOverlayLayerId(): string;

    getImageLayer(): any;
    getMgLayer(): any;
    getAnnLabelLayer(): any;
    getAnnGuideLayer(): any;
    getImage(): Image;
    getCanvas(): any;
    getCtCanvas(): any;
    getContext(): ImageContextData;
    getAnnotationService(): AnnotationService;
    getBaseUrl(): string;
    getTextFont(): FontData;

    selectAnnotation(annObj: AnnExtendObject): void;
    onAnnotationCreated(annObj: AnnExtendObject): void;
    isCtrlKeyPressed(): boolean;

    selectChildByStepIndex(stepIndex: number):void;
    stepGuide(): void;
    getCurrentStepIndex() : number;
    cancelCreate(needRecreate: boolean): void;

    getCursor(): any;
    setCursor(cursor: any): void;

    isDragging(): boolean;
    refresh(): void;
}