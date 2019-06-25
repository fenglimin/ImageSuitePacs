import { Injectable } from '@angular/core';

import { AnnotationDefinitionData, AnnType } from "../models/annotation";
import { AnnLine } from "../annotation/extend-object/ann-line";
import { AnnEllipse } from "../annotation/extend-object/ann-ellipse";
import { AnnRectangle } from "../annotation/extend-object/ann-rectangle";
import { AnnArrow } from "../annotation/extend-object/ann-arrow";
import { AnnRuler } from "../annotation/extend-object/ann-ruler";
import { AnnCardiothoracicRatio } from "../annotation/extend-object/ann-cardiothoracic-ratio";
import { AnnVerticalAxis } from "../annotation/extend-object/ann-vertical-axis";
import { AnnMarkSpot } from "../annotation/extend-object/ann-mark-spot";
import { AnnImage } from "../annotation/extend-object/ann-image";
import { AnnPolygon } from "../annotation/extend-object/ann-polygon";
import { AnnAngle } from "../annotation/extend-object/ann-angle";
import { AnnCervicalCurve } from "../annotation/extend-object/ann-cervical-curve";
import { AnnLumbarCurve } from "../annotation/extend-object/ann-lumbar-curve";
import { AnnFreeArea } from "../annotation/extend-object/ann-free-area";
import { AnnPoint } from "../annotation/extend-object/ann-point";
import { AnnText } from "../annotation/extend-object/ann-text";
import { AnnTextIndicator } from "../annotation/extend-object/ann-text-indicator";

@Injectable({
    providedIn: 'root'
})
export class AnnotationService {

    private annDefinitionList: AnnotationDefinitionData[] = [];

    constructor() {
        this.annDefinitionList.push(new AnnotationDefinitionData(AnnLine, "ann_line", false, "CGXAnnLineEx", AnnType.LineExt));
        this.annDefinitionList.push(new AnnotationDefinitionData(AnnEllipse, "ellipse", false, "CGXAnnEllipse", AnnType.Ellipse));
        this.annDefinitionList.push(new AnnotationDefinitionData(AnnRectangle, "rect", false, "CGXAnnSquare", AnnType.Rect));
        this.annDefinitionList.push(new AnnotationDefinitionData(AnnArrow, "ann_line", false, "CGXAnnArrowMark", AnnType.Arrow));
        this.annDefinitionList.push(new AnnotationDefinitionData(AnnRuler, "ann_line", false, "CGXAnnRuler", AnnType.Ruler));
        this.annDefinitionList.push(new AnnotationDefinitionData(AnnVerticalAxis, "ann_cervicalcurve", false, "CGXAnnVAxis", AnnType.Vaxis));
        this.annDefinitionList.push(new AnnotationDefinitionData(AnnImage, "ann_stamp", false, "CGXAnnStamp", AnnType.Stamp));
        this.annDefinitionList.push(new AnnotationDefinitionData(AnnPolygon, "polygon", false, "CGXAnnPolygon", AnnType.Polygon));
        this.annDefinitionList.push(new AnnotationDefinitionData(AnnAngle, "ann_angle", false, "CGXAnnProtractor", AnnType.Protractor));
        this.annDefinitionList.push(new AnnotationDefinitionData(AnnFreeArea, "ann_freearea", false, "CGXAnnFreeArea", AnnType.FreeArea));
        this.annDefinitionList.push(new AnnotationDefinitionData(AnnText, "ann_text", false, "CGXAnnTextMark", AnnType.Text));

        this.annDefinitionList.push(new AnnotationDefinitionData(AnnCardiothoracicRatio, "ann_cervicalcurve", true, "CGXAnnHCRatio", AnnType.HeartChestRatio));
        this.annDefinitionList.push(new AnnotationDefinitionData(AnnMarkSpot, "ann_line", true, "CGXAnnMarkSpot", AnnType.MarkSpot));
        this.annDefinitionList.push(new AnnotationDefinitionData(AnnCervicalCurve, "ann_cervicalcurve", true, "CGXAnnCervicalCurve", AnnType.CervicalCurve));
        this.annDefinitionList.push(new AnnotationDefinitionData(AnnLumbarCurve, "ann_cervicalcurve", true, "CGXAnnLumbarCurve", AnnType.LumbarCurve));

        this.annDefinitionList.push(new AnnotationDefinitionData(AnnPoint, "none", false, "", AnnType.None));
        this.annDefinitionList.push(new AnnotationDefinitionData(AnnTextIndicator, "none", false, "", AnnType.None));
    }

    getAnnDefDataByType(annType: AnnType): AnnotationDefinitionData {
        const result = this.annDefinitionList.filter(annData => annData.imageSuiteAnnType === annType);
        return this.getSafeResult("getAnnDefDataByType", annType, result);
    }

    getAnnDefDataByIsName(annIsName: string): AnnotationDefinitionData {
        const result = this.annDefinitionList.filter(annData => annData.imageSuiteAnnName === annIsName);
        return this.getSafeResult("getAnnDefDataByIsName", annIsName, result);
    }

    getAnnDefDataByClassName(annClassName: string): AnnotationDefinitionData {
        const result = this.annDefinitionList.filter(annData => annData.className === annClassName);
        return this.getSafeResult("getAnnDefDataByClassName", annClassName, result);
    }

    getCursorNameByType(annType: AnnType): string {
        const annDefData = this.getAnnDefDataByType(annType);
        return annDefData ? annDefData.cursorName : "default";
    }

    private getSafeResult(funName: string, getBy: any, result: AnnotationDefinitionData[]): AnnotationDefinitionData {
        if (result.length === 0) {
            alert(`AnnotationService.${funName}() - Can not find Annotation data for annotation ${getBy} in the list`);
            return undefined;
        }

        if (result.length > 1) {
            alert(`AnnotationService.${funName}() - There are more than one Annotation data for annotation ${getBy} in the list`);
        }

        return result[0];
    }
}
