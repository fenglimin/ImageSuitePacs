import { Point, PositionInRectangle } from '../../models/annotation';
import { MouseEventType, AnnObject } from '../ann-object';
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
    onCreate(arrowStartPoint: Point, arrowEndPoint: Point, text: string) {
        this.onDeleteChildren();

        this.annArrow = new AnnArrow(this, this.imageViewer);
        this.annArrow.onCreate(arrowStartPoint, arrowEndPoint);
        this.annArrow.onLevelDown();
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
        //    const textPointList = AnnObject.pointListFrom(arrowStartPoint, posList[i], textRect.width, textRect.height);
        //    const arrowPointList = this.getShortestDistancePoint(parentPosList, textPointList);
        //    if (AnnObject.equalPoint(arrowStartPoint, arrowPointList[1])) {
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
                const distance = AnnObject.countDistance(destPointList[i], textPointList[j]);
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