import { Point, PositionInRectangle, MouseEventType } from '../../models/annotation';
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnText } from "./ann-text";
import { AnnArrow } from "./ann-arrow";


export class AnnTextIndicator extends AnnExtendObject {

    private annArrow: AnnArrow;
    private annText: AnnText;

    constructor(parentObj: AnnExtendObject, imageViewer: IImageViewer) {
        super(parentObj, imageViewer);
    }     


    // The point is the coordinate of image layer, for text, need to convert to text layer coordinate
    onCreate(targetPoint: Point, text: string) {
        this.onDeleteChildren();

        const delta = 30 / this.image.getScaleValue();
        const arrowStartPoint = { x: targetPoint.x + delta, y: targetPoint.y - delta };

        this.annArrow = new AnnArrow(this, this.imageViewer);
        this.annArrow.onCreate(arrowStartPoint, targetPoint);
        this.annArrow.onLevelDown("bottom");
        this.annArrow.setMouseResponsible(false);

        this.annText = new AnnText(this, this.imageViewer);
        this.annText.onCreate(arrowStartPoint, text);

        this.focusedObj = this.annText;
        if (!this.parentObj) {
            this.onDrawEnded();
        }
    }

    onDrag(deltaX: number, deltaY: number) {
        this.annText.onDrag(deltaX, deltaY);
        this.redrawArrow();
    }

    onTranslate(deltaX: number, deltaY: number) {
        this.annArrow.onTranslate(deltaX, deltaY);
        this.redrawText();
    }

    onFlip(vertical: boolean) {
        this.annArrow.onFlip(vertical);
        this.redrawText();
    }

    onRotate(angle: number) {
       this.redrawText();
    }

    onSwitchFocus() {
        this.focusedObj = this.annText;
        this.onChildSelected(this.annText);
    }

    redrawArrow() {
        // Draw the arrow, keep text position unchanged.
        const parentPosList = this.parentObj.getSurroundPointList();
        if (parentPosList.length === 0) {
            alert(this.parentObj.constructor.name +
                " did NOT implement function getSurroundPointList. For annotations contain text indicator, must implement it.");
            return;
        }
        const posList = this.getShortestDistancePoint(parentPosList, this.getTextPointList());

        this.annArrow.onMoveStartPoint(posList[1]);
        this.annArrow.onMoveEndPoint(posList[0]);
    }

    redrawText() {
        // Draw the text, keep the arrow position unchanged

        const arrowStartPoint = this.annArrow.getStartPosition();

        //const parentPosList = this.parentObj.getSurroundPointList();
        //const textRect = this.annText.getRect();
        //const posList = [PositionInRectangle.TopLeft, PositionInRectangle.TopRight, PositionInRectangle.BottomRight, PositionInRectangle.BottomLeft];

        //let i = 0;
        //for (; i < 4; i ++) {
        //    const textPointList = AnnTool.pointListFrom(arrowStartPoint, posList[i], textRect.width, textRect.height);
        //    const arrowPointList = this.getShortestDistancePoint(parentPosList, textPointList);
        //    if (AnnTool.equalPoint(arrowStartPoint, arrowPointList[1])) {
        //        break;
        //    }
        //}

        //if (i === 4) {
        //    alert("error!");
        //    return;
        //}

        //const textStartPoint = arrowStartPoint;
        //if (posList[i] === PositionInRectangle.TopLeft) {
        //    textStartPoint.y += textRect.height;
        //} else if (posList[i] === PositionInRectangle.TopRight) {
        //    textStartPoint.x -= textRect.width;
        //    textStartPoint.y += textRect.height;
        //} else if (posList[i] === PositionInRectangle.BottomRight) {
        //    textStartPoint.x -= textRect.width;
        //}

        this.annText.onMove(arrowStartPoint);
    }

    setText(text: string) {
        this.annText.setText(text);
        this.redrawArrow();
    }

    private getShortestDistancePoint(destPointList: Point[], textPointList: Point[]): Point[] {

        const lenDest = destPointList.length;
        const lenText = textPointList.length;

        const retPointList = [];
        retPointList.push(destPointList[0]);
        retPointList.push(textPointList[0]);
        let minLen = Number.MAX_VALUE;

        for (let i = 0; i < lenDest; i++) {
            for (let j = 0; j < lenText; j++) {
                const distance = AnnTool.countDistance(destPointList[i], textPointList[j]);
                if (distance < minLen) {
                    minLen = distance;
                    retPointList[0] = destPointList[i];
                    retPointList[1] = textPointList[j];
                }
            }
        }

        return retPointList;
    }

    private getTextPointList(): Point[] {
        return this.annText.getSurroundPointList();
    }
} 