import { IAnnotationObject } from "./annotation-object-interface";
import { Image } from "../models/pssi";
import { ViewContext } from "../services/view-context.service"

export interface IImageViewer {

    getAnnotationLayerId(): string;
    getAnnLabelLayerId(): string;
    getImageLayer(): any;
    getAnnLabelLayer(): any;
    getImage(): Image;
    getCanvas(): any;
    getContext(): ViewContext;

    selectAnnotation(annObj: IAnnotationObject): void;
    onAnnotationCreated(annObj: IAnnotationObject): void;
    isCtrlKeyPressed(): boolean;
}