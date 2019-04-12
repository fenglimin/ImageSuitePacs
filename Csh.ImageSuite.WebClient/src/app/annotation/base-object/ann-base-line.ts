import { Point } from '../../models/annotation';
import { MouseEventType, AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";

export class AnnBaseLine extends AnnObject {

    jcLine: any;

    constructor(parent: AnnObject, posStart: Point, posEnd: Point, imageViewer: IImageViewer) {

        super(imageViewer);
        this.parent = parent;


        this.jcLine = jCanvaScript.line([[posStart.x, posStart.y], [posEnd.x, posEnd.y]], this.selectedColor).layer(this.layerId);
        this.jcLine._lineWidth = this.lineWidth;
        this.jcLine.mouseStyle = "move";
    }

    onDrag(draggedObj: any, deltaX: number, deltaY: number) {
        if (this.onDragParent) {
            this.onDragParent.call(this.parent, this, deltaX, deltaY);
        }
    }

    onDrawEnded(onDragParent: (draggedObj, deltaX, deltaY) => void, onSelectParent: (selectedObj) => void) {
        this.onDragParent = onDragParent;
        this.onSelectParent = onSelectParent;

        this.setChildDraggable(this, this.jcLine, true, this.onDrag);
        this.setChildMouseEvent(this, this.jcLine);
    }

    onSelect(selected: boolean, focused: boolean) {
        console.log("onSelect Line" + selected + focused);
        const color = selected ? this.selectedColor : this.defaultColor;
        this.jcLine.color(color);
    }

    onMouseEvent(mouseEventType: MouseEventType, point: Point) {
        if (mouseEventType === MouseEventType.MouseDown) {
            console.log("onMouseEvent Line");
            if (this.onSelectParent) {
                this.onSelectParent.call(this.parent, this);
            }
        }
    }

    onScale() {
        this.jcLine._lineWidth = this.parent.getLineWidth();
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
