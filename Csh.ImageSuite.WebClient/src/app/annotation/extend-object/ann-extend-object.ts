import { Point, MouseEventType } from '../../models/annotation';
import { AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";


export abstract class AnnExtendObject extends AnnObject {

    private annObjList: Array<AnnObject> = [];
    protected guideNeeded = false;
    protected annTypeName: string;

    constructor(parentObj: AnnExtendObject, imageViewer: IImageViewer) {

        super(parentObj, imageViewer);
        if (parentObj) {
            parentObj.onChildCreated(this);
        }
    }

    getTypeName() {
        return this.annTypeName;
    }

    isGuideNeeded(): boolean {
        return this.guideNeeded;
    }

    selectChildByStepIndex(stepIndex: number) {
        if (!this.isGuideNeeded()) return;

        const annChildList = this.annObjList.filter(annObj => annObj.getStepIndex() === stepIndex);
        if (annChildList.length > 0) {
            this.focusedObj = annChildList[0];
            this.onSelect(true, true);
        }

    }

    onMouseEvent(mouseEventType: MouseEventType, point: Point, mouseObj: any) {
        alert("Error in AnnExtendObject.onMouseEvent, this function must be overrided.")
    }

    onSwitchFocus() {
        if (!this.focusedObj) {
            alert("No focus object set!");
            return;
        }

        const index = this.annObjList.findIndex(annObj => annObj === this.focusedObj);
        const nextIndex = index === this.annObjList.length - 1 ? 0 : index + 1;
        this.onChildSelected(this.annObjList[nextIndex]);
    }

    onChildCreated(annChildObj: AnnObject) {
        this.addChildObj(annChildObj);
    }

    onDrawEnded() {

        if (this.mouseResponsible) {
            this.annObjList.forEach(annObj => annObj.onDrawEnded());
        } 

        this.created = true;

        if (!this.parentObj) {
            // Parent not set, this mean it is not a child of a parentObj annotion. 
            this.imageViewer.onAnnotationCreated(this);
        }
    }

    onDrag(deltaX: number, deltaY: number) {
        this.onTranslate(deltaX, deltaY);
    }

    onSelect(selected: boolean, focused: boolean) {

        this.selected = selected;

        this.annObjList.forEach(annObj => annObj.onSelect(selected, focused && annObj === this.focusedObj));

        if (!this.parentObj && this.selected) {
            this.imageViewer.selectAnnotation(this);
        }
    }

    onRotate(angle: number) {
        this.annObjList.forEach(annObj => {
            // The text indicator is drawn in the separated layer, need to rotate it.
            if (annObj.constructor.name === "AnnTextIndicator") {
                annObj.onRotate(angle);
            }
        });
    }

    onScale() {
        this.annObjList.forEach(annObj => annObj.onScale());
    }

    onFlip(vertical: boolean) {
        this.annObjList.forEach(annObj => annObj.onFlip(vertical));
    }

    onTranslate(deltaX: number, deltaY: number) {
        this.annObjList.forEach(annObj => annObj.onTranslate(deltaX, deltaY));
    }

    onMove(point: Point) {
        this.annObjList.forEach(annObj => annObj.onMove(point));
    }

    onDeleteChildren() {
        this.annObjList.forEach(annObj => annObj.onDeleteChildren());
    }

    onLevelUp(level: any = 1) {
        this.annObjList.forEach(annObj => annObj.onLevelUp(level));
    }

    onLevelDown(level: any = 1) {
        this.annObjList.forEach(annObj => annObj.onLevelDown(level));
    }

    getPosition(): Point {
        return { x: 0, y: 0 }
    }

    getSurroundPointList(): Point[] {
        return [];
    }

    setStepIndex(stepIndex: number) {
        super.setStepIndex(stepIndex);
        this.annObjList.forEach(annObj => annObj.setStepIndex(stepIndex));
    }

    private addChildObj(annObj: AnnObject) {
        this.annObjList.push(annObj);
    }

}