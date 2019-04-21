import { Point } from '../../models/annotation';
import { MouseEventType, AnnObject } from '../ann-object';
import { IAnnotationObject } from "../../interfaces/annotation-object-interface";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseCircle } from "../base-object/ann-base-circle";
import { AnnExtendObject } from "./ann-extend-object";

export class AnnPoint extends AnnExtendObject implements IAnnotationObject{

    private annCenterCircle: AnnBaseCircle;
    private annOuterCircle: AnnBaseCircle;

    constructor(parentObj: AnnExtendObject, imageViewer: IImageViewer) {

        super(parentObj, imageViewer);
    }

    onMouseEvent(mouseEventType: MouseEventType, point: Point, mouseObj: any) {

        const imagePoint = AnnObject.screenToImage(point, this.getTransformMatrix());
        if (mouseEventType === MouseEventType.MouseDown) {

            if (this.created) {
                this.onSelect(true, false);
                return;
            }

            this.onCreate(imagePoint);
        }
    }

    onCreate(position: Point) {
        this.annCenterCircle = new AnnBaseCircle(this, position, this.pointRadius, this.imageViewer, true);
        this.annOuterCircle = new AnnBaseCircle(this, position, this.pointRadius * 2, this.imageViewer, false);
        this.annOuterCircle.setVisible(false);

        this.onChildCreated(this.annCenterCircle);
        this.onChildCreated(this.annOuterCircle);
    }

    onSwitchFocus() {

    }

    onSelect(selected: boolean, focused: boolean) {

        console.log("onSelect Point " + selected + " " + focused);

        this.selected = selected;
        const color = selected ? this.selectedColor : this.defaultColor;

        if (focused && !this.focusedObj) {
            this.focusedObj = this.annCenterCircle;
        }

        this.annCenterCircle.setVisible(selected);
        this.annCenterCircle.setColor(color);

        this.annOuterCircle.setVisible(selected && focused);
    }

    setRadius(radius: number) {
        this.annCenterCircle.setRadius(radius);
        this.annOuterCircle.setRadius(radius * 2);
    }

    getPosition(): Point {
        return this.annCenterCircle.getPosition();
    }
}