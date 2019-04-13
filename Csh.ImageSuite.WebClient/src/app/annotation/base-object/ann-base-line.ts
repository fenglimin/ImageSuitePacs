import { Point } from '../../models/annotation';
import { MouseEventType, AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";

export class AnnBaseLine extends AnnObject {

    jcLine: any;

    constructor(parentObj: AnnObject, posStart: Point, posEnd: Point, imageViewer: IImageViewer) {

        super(parentObj, imageViewer);

        this.jcLine = jCanvaScript.line([[posStart.x, posStart.y], [posEnd.x, posEnd.y]], this.selectedColor).layer(this.layerId);
        this.jcLine._lineWidth = this.lineWidth;
        this.jcLine.mouseStyle = "move";
        this.jcLine.parentObj = this;
    }

    onChildDragged(draggedObj: any, deltaX: number, deltaY: number) {

        if (draggedObj === this) {

        }
        this.focusedObj = draggedObj;

        if (this.parentObj) {
            // If have parent, let parent manage the drag status
            this.parentObj.onChildDragged(this, deltaX, deltaY);
        } else {
            this.onDrag(deltaX, deltaY);
        }
    }

    onDrag(deltaX: number, deltaY: number) {
       this.onTranslate(deltaX, deltaY);
    }

    onChildSelected(selectedObj: AnnObject) {

        if (selectedObj === this) {

        }

        this.focusedObj = selectedObj;

        if (this.parentObj) {
            // If have parent, let parent manage the select status
            this.parentObj.onChildSelected(this);
        } else {
            this.onSelect(true, true);
        }
    }

    onSelect(selected: boolean, focused: boolean) {

        console.log("onSelect Line " + selected + " " + focused);

        this.selected = selected;
        const color = selected ? this.selectedColor : this.defaultColor;

        if (focused && !this.focusedObj) {
            this.focusedObj = this.jcLine;
        }

        this.jcLine.color(color);
    }


    onDrawEnded() {
        this.setChildDraggable(this, this.jcLine, true);
        this.setChildMouseEvent(this, this.jcLine);
    }

    onMouseEvent(mouseEventType: MouseEventType, point: Point, mouseObj: any) {
        if (mouseEventType === MouseEventType.MouseDown) {
            console.log("onMouseEvent Line");
            this.onChildSelected(mouseObj);
        }
    }

    onScale() {
        this.jcLine._lineWidth = this.parentObj.getLineWidth();
    }

    onFlip(vertical: boolean) {

        if (vertical) {
            this.jcLine._y0 = this.image.height() - this.jcLine._y0;
            this.jcLine._y1 = this.image.height() - this.jcLine._y1;
        } else {
            this.jcLine._x0 = this.image.width() - this.jcLine._x0;
            this.jcLine._x1 = this.image.width() - this.jcLine._x1;
        }

    }

    onTranslate(deltaX: number, deltaY: number) {
        this.jcLine._x0 += deltaX;
        this.jcLine._y0 += deltaY;

        this.jcLine._x1 += deltaX;
        this.jcLine._y1 += deltaY;
    }

    //setRadius(radius: number) {
    //}

    moveStartTo(point: Point) {
        this.jcLine._x0 = point.x;
        this.jcLine._y0 = point.y;
    }


    moveEndTo(point: Point) {
        this.jcLine._x1 = point.x;
        this.jcLine._y1 = point.y;
    }

    getPosition(): Point {
        return { x: this.jcLine._x0, y: this.jcLine._y0 }
    }
}
