import { Point, MouseEventType, Rectangle } from '../../models/annotation';
import { AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnSerialize } from "../ann-serialize";

export abstract class AnnExtendObject extends AnnObject {

    protected annObjList: Array<AnnObject> = [];
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

    setGuideNeeded(guideNeeded: boolean) {
        this.guideNeeded = guideNeeded;
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

    onDeleteChild(annChildObj: AnnObject) {
        annChildObj.onDeleteChildren();

        const index = this.annObjList.findIndex(annObj => annObj === annChildObj);
        if (index !== -1) {
            this.annObjList.splice(index, 1);
        } else {
            alert("Internal error!  AnnExtendObject.onDeleteChild() - Can NOT find child to be delete");
        }
    }

    onChildCreated(annChildObj: AnnObject) {
        // A child annotation is created, add it to the children list
        this.addChildObj(annChildObj);
    }

    onDrawEnded() {

        if (this.mouseResponsible) {
            this.annObjList.forEach(annObj => annObj.onDrawEnded());
        } 

        this.created = true;

        if (!this.parentObj) {
            // Parent not set, this mean it is not a child of a parentObj annotation. 
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
        alert("Internal error : AnnExtendObject.getSurroundPointList() should never be called.");
        return [];
    }

    getRect(): Rectangle {
        alert("Internal error : AnnExtendObject.getRect() should never be called.");
        return undefined;
    }

    setStepIndex(stepIndex: number) {
        super.setStepIndex(stepIndex);
        this.annObjList.forEach(annObj => annObj.setStepIndex(stepIndex));
    }

    setVisible(visible: boolean) {
        this.annObjList.forEach(annObj => annObj.setVisible(visible));
    }

    onLoad(annSerialize: AnnSerialize): any {
        alert("Internal error : AnnExtendObject.onLoad() should never be called.");
        return undefined;
    }

    onSave(annSerialize: AnnSerialize) {
        alert("Internal error : AnnExtendObject.onSave() should never be called.");
    }

    private addChildObj(annObj: AnnObject) {
        this.annObjList.push(annObj);
    }

}