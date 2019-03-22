import { ViewContextEnum, ViewContextService } from "../services/view-context.service"

export enum EventType {
    Click= 1,
    MouseDown= 2,
    MouseMove= 3,
    MouseUp= 4,
    MouseOver= 5,
    MouseOut= 6,
    RightClick= 7,
    DblClick= 8,
    MouseWheel= 9
}

export enum StepEnum {
    Step1= 1,
    Step2= 2,
    Step3= 3,
    Step4= 4,
    Step5= 5
}

export class Colors {
    static white = "#ffffff";
    static red = "#ff0000";
    static yellow = "#ffff00";
    static green = "#00FF00";
    static blue = "#0000FF";
};

export abstract class AnnObject {

    protected viewer: any; //the parent compoent which hold this object
    protected isCreated: boolean;
    protected isInEdit: boolean; //is current object selected and in edit status
    protected parent: AnnObject;

    protected defaultCircleRadius = 5;
    protected minCircleRadius = 2;
    protected minLineWidth = 0.3;

    protected selectedLevel = 100;
    protected defaultLevel = 1;
    protected selectedColor = Colors.red;
    protected defaultColor = Colors.white;

    constructor(protected viewContext: ViewContextService) {
    }

    static screenToImage(point: any, transform: any) {
        const x = point.x;
        const y = point.y;
        const imgPt = [0, 0, 1];
        const scrennPt = [x, y, 1];

        const a = x;
        const b = y;
        const n1 = transform[0][0];
        const n2 = transform[0][1];
        const n3 = transform[0][2];
        const n4 = transform[1][0];
        const n5 = transform[1][1];
        const n6 = transform[1][2];

        let t = a * n4 - n3 * n4 - b * n1 + n1 * n6;
        const t2 = n2 * n4 - n1 * n5;

        imgPt[1] = t / t2;

        t = b * n2 - n2 * n6 - a * n5 + n3 * n5;
        imgPt[0] = t / t2;

        return {
            x: imgPt[0],
            y: imgPt[1]
        };
    }

    static imageToScreen(point: any, transform: any) {
        const x = point.x;
        const y = point.y;
        const imgPt = [x, y, 1];
        const screenPt = [0, 0, 1];

        screenPt[0] = transform[0][0] * imgPt[0] + transform[0][1] * imgPt[1] + transform[0][2] * imgPt[2];
        screenPt[1] = transform[1][0] * imgPt[0] + transform[1][1] * imgPt[1] + transform[1][2] * imgPt[2];

        return {
            x: screenPt[0],
            y: screenPt[1]
        };
    }

    static countDistance(point1: any, point2: any): number {
        let value = Math.pow((point1.x - point2.x), 2) + Math.pow((point1.y - point2.y), 2);
        value = Math.sqrt(value);

        return value;
    }

    static countAngle(point1: any, point2: any): number {
        const dPixSpacingX = 1.0;
        const dPixSpacingY = 1.0;

        const dx = (point2.x - point1.x) * dPixSpacingX;
        const dy = (point1.y - point2.y) * dPixSpacingY;

        return (180.0 / Math.PI) * Math.atan2(dy, dx);
    }

    abstract startCreate(viewer: any, callback: any, param: any): void;

    hasToolTip(): boolean {
        return false;
    }

    del() {
    }

    select(select: boolean) {
    }

    //set child jcObject's common mouse event hander, etc.
    protected setChildMouseEvent(jcObj) {
        var dv = this.viewer;
        var annObj = this;
        var curContext = this.viewContext.curContext;

        jcObj.mouseover(function(arg) {
            if (curContext.action == ViewContextEnum.Select) {
                if (!this.mouseStyle) {
                    this.mouseStyle = "pointer";
                }
                dv.canvas.style.cursor = this.mouseStyle;
            }
        });

        jcObj.mouseout(function() {
            if (curContext.action == ViewContextEnum.Select)
                dv.canvas.style.cursor = "auto";
        });

        jcObj.mousedown(function(arg) {
            //console.log('jcObj mousedown');
            if (curContext.action == ViewContextEnum.Select) {
                const curObj = annObj.parent || annObj;
                if (dv.curSelectObj !== curObj) {
                    dv.selectObject(curObj);
                }
                arg.event.cancelBubble = true;
            }
        });

        jcObj.mouseup(function(arg) {
            //console.log('jcObj mouseup');
        });

        jcObj.click(function(arg) {
            //console.log('jcObj onClick');
        });
    }

    protected setChildDraggable(jcObj, draggable, onDrag) {
        if (!jcObj) {
            return;
        }

        var dv = this.viewer;
        const canvas = dv.canvas;
        var annObj = this;

        jcObj.draggable({
            disabled: !draggable,
            start: function(arg) {
                this._lastPos = {};
                if (this.mouseStyle) {
                    dv.canvas.style.cursor = this.mouseStyle;
                }
            },
            stop: function(arg) {
                this._lastPos = {};
                if (this.mouseStyle) {
                    dv.canvas.style.cursor = "auto";
                }
            },
            drag: function(arg) {
                //ptImg is mouse position, not the object's start position
                //don't translate any annObject, always keep annObject's transform as clear.
                const transTmp = dv.imgLayer.transform();
                const ptImg = AnnObject.screenToImage(arg, transTmp);

                if (typeof (this._lastPos.x) != "undefined") {
                    const deltaX = ptImg.x - this._lastPos.x;
                    const deltaY = ptImg.y - this._lastPos.y;

                    this._x += deltaX;
                    this._y += deltaY;

                    if (onDrag) {
                        onDrag.call(annObj, deltaX, deltaY);
                    }
                }

                this._lastPos = {
                    x: ptImg.x,
                    y: ptImg.y
                };
                return true;
            }
        });
    }

    protected isChildJCObject(obj) {
        if (!obj) {
            return false;
        }

        if (obj.optns) {
            return true;
        }

        return false;
    }

    protected translateChild(child, deltaX, deltaY) {
        if (child) {
            child._x += deltaX;
            child._y += deltaY;
        }
    }

    protected deleteChild() {
        var thisObj = this;
        const propertys = Object.getOwnPropertyNames(this);
        propertys.forEach(function(prop) {
            const obj = thisObj[prop];
            if ((obj instanceof AnnObject && obj != thisObj.parent) || thisObj.isChildJCObject(obj)) {
                obj.del();
                thisObj[prop] = undefined;
            }
        });
    }

    protected selectChild(select: boolean) {
        var thisObj = this;
        const propertys = Object.getOwnPropertyNames(this);
        propertys.forEach(function(prop) {
            const obj = thisObj[prop];
            if (obj instanceof AnnObject && obj != thisObj.parent) {
                obj.select(select);
            } else if (thisObj.isChildJCObject(obj)) {
                obj.color(select ? thisObj.selectedColor : thisObj.defaultColor);
                obj.level(select ? thisObj.selectedLevel : thisObj.defaultLevel);
            }
        });
    }
}
