import { IAnnotationObject } from "./annotation-object-interface";
import { Image } from "../models/pssi";
import { ViewContext } from "../services/view-context.service"
import { AnnExtendObject } from "../annotation/extend-object/ann-extend-object";
import { FontData } from '../models/misc-data';

export interface IImageViewer {

    getAnnotationLayerId(): string;
    getAnnLabelLayerId(): string;
    getAnnGuideLayerId(): string;
    getAnnImageRulerLayerId(): string;
    getImageLayer(): any;
    getAnnLabelLayer(): any;
    getAnnGuideLayer(): any;
    getImage(): Image;
    getCanvas(): any;
    getContext(): ViewContext;
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
}