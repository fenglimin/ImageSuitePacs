import { IAnnotationObject } from "./annotation-object-interface";
import { Image } from "../models/pssi";
import { ViewContext } from "../services/view-context.service"
import { AnnExtendObject } from "../annotation/extend-object/ann-extend-object";

export interface IImageViewer {

    getAnnotationLayerId(): string;
    getAnnLabelLayerId(): string;
    getImageLayer(): any;
    getAnnLabelLayer(): any;
    getImage(): Image;
    getCanvas(): any;
    getContext(): ViewContext;

    selectAnnotation(annObj: AnnExtendObject): void;
    onAnnotationCreated(annObj: AnnExtendObject): void;
    isCtrlKeyPressed(): boolean;
}