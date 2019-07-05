import { Point, MouseEventType, Rectangle, AnnotationDefinitionData } from '../../models/annotation';
import { AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnSerialize } from "../ann-serialize";

export abstract class AnnExtendObject extends AnnObject {

    protected annObjList: Array<AnnObject> = [];
    protected loadedFromTag = false;   // The annotation is created when loading image
    protected annDefData: AnnotationDefinitionData;

    constructor(parentObj: AnnExtendObject, imageViewer: IImageViewer) {
        super(parentObj, imageViewer);
        this.annDefData = imageViewer.getAnnotationService().getAnnDefDataByClassName(this.constructor.name);
        if (parentObj) {
            parentObj.onChildCreated(this);
        }
    }

    getTypeName() {
        return this.annDefData.className;
    }

    isGuideNeeded(): boolean {
        return this.annDefData.needGuide;
    }

    isLoadedFromTag(): boolean {
        return this.loadedFromTag;
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
        alert("Error in AnnExtendObject.onMouseEvent, this function must be overrode.");
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
            if (annObj.constructor.name === "AnnTextIndicator" || annObj.constructor.name === "AnnText") {
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

    onLoad(annSerialize: AnnSerialize) {
        this.loadedFromTag = true;
        const config = this.onLoadConfig(annSerialize);
        this.onCreateFromConfig(config);
        this.onSelect(config.selected, config.selected);
        if (!this.parentObj) {
            this.onDrawEnded();
        }
    }

    onSave(annSerialize: AnnSerialize) {
        alert("Internal error : AnnExtendObject.onSave() should never be called.");
    }

    onCreateFromConfig(config: any) {
        alert("Internal error : AnnExtendObject.onCreateFromConfig() should never be called.");
        return undefined;
    }

    onLoadConfig(annSerialize: AnnSerialize) {
        alert("Internal error : AnnExtendObject.onLoadConfig() should never be called.");
        return undefined;
    }

    private addChildObj(annObj: AnnObject) {
        this.annObjList.push(annObj);
    }

    protected saveBasicInfo(annSerialize: AnnSerialize, saveMoving: boolean = false) {
        annSerialize.writeString(this.annDefData.imageSuiteAnnName);
        annSerialize.writeInteger(this.annDefData.imageSuiteAnnType, 4);     // AnnType
        annSerialize.writeInteger(1, 4);     // created
        if (saveMoving) {
            annSerialize.writeInteger(0, 4);     // moving
        }
        annSerialize.writeInteger(this.selected ? 1 : 0, 1);     // selected
    }
}