import { Point } from '../../models/annotation';
import { MouseEventType, AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";


export class AnnBasePoint extends AnnObject {

    jcCenterPoint: any;
    jcOuterCircle: any;

    constructor(parentObj: AnnObject, position: Point, imageViewer: IImageViewer) {

        super(parentObj, imageViewer);

        this.jcOuterCircle = jCanvaScript.circle(position.x, position.y, this.circleRadius * 2, this.selectedColor, false).layer(this.layerId);
        this.jcOuterCircle._lineWidth = this.lineWidth;
        this.jcOuterCircle.mouseStyle = "crosshair";
        this.jcOuterCircle.visible(false);

        this.jcCenterPoint = jCanvaScript.circle(position.x, position.y, this.circleRadius, this.selectedColor, true).layer(this.layerId);
        this.jcCenterPoint.mouseStyle = "crosshair";
    }

    onChildDragged(draggedObj: any, deltaX: number, deltaY: number) {

        this.focusedObj = draggedObj;

        if (this.parentObj) {
            // If have parent, let parent manage the drag status
            this.parentObj.onChildDragged(this, deltaX, deltaY);
        } else {
            this.onDrag(draggedObj, deltaX, deltaY);
        }
    }

    onDrag(draggedObj: any, deltaX: number, deltaY: number) {
        this.onTranslate(deltaX, deltaY);
    }

    onChildSelected(selectedObj: AnnObject) {
        
        this.focusedObj = selectedObj;

        if (this.parentObj) {
            // If have parent, let parent manage the select status
            this.parentObj.onChildSelected(this);
        } else {
            this.onSelect(true, true);
        }
    }

    onSelect(selected: boolean, focused: boolean) {

        console.log("onSelect Point " + selected + " " + focused);

        this.selected = selected;
        const color = selected ? this.selectedColor : this.defaultColor;

        this.jcCenterPoint.visible(selected);
        this.jcCenterPoint.color(color);

        this.jcOuterCircle.visible(selected && focused);
    }

    onDrawEnded() {
        this.setChildDraggable(this, this.jcCenterPoint, true);
        this.setChildMouseEvent(this, this.jcCenterPoint);
    }


    onMouseEvent(mouseEventType: MouseEventType, point: Point) {

        if (mouseEventType === MouseEventType.MouseDown) {
            console.log("onMouseEvent Point");
            this.onChildSelected(this);
        }
    }

    onScale() {
        this.setRadius(this.parentObj.getPointRadius());
        this.jcOuterCircle._lineWidth = this.parentObj.getLineWidth();

        this.up();
    }

    onFlip(vertical: boolean) {

        if (vertical) {
            this.jcCenterPoint._y = this.image.height() - this.jcCenterPoint._y;
            this.jcOuterCircle._y = this.jcCenterPoint._y;
        } else {
            this.jcCenterPoint._x = this.image.width() - this.jcCenterPoint._x;
            this.jcOuterCircle._x = this.jcCenterPoint._x;
        }

    }

    onTranslate(deltaX: number, deltaY: number) {
        this.jcCenterPoint._x += deltaX;
        this.jcCenterPoint._y += deltaY;

        this.jcOuterCircle._x += deltaX;
        this.jcOuterCircle._y += deltaY;
    }

    setRadius(radius: number) {
        this.jcCenterPoint._radius = radius;
        this.jcOuterCircle._radius = radius * 2;
    }

    moveTo(point: Point) {
        this.jcCenterPoint._x = point.x;
        this.jcCenterPoint._y = point.y;

        this.jcOuterCircle._x = point.x;
        this.jcOuterCircle._y = point.y;
    }

    getPosition(): Point {
        return { x: this.jcOuterCircle._x, y: this.jcOuterCircle._y }
    }

    up() {
        if (this.jcOuterCircle) {
            this.jcOuterCircle.up();
        }

        if (this.jcCenterPoint) {
            this.jcCenterPoint.up();
        }

    }
}