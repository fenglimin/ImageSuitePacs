export class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class Size {
    cx: number;
    cy: number;

    constructor(cx: number, cy: number) {
        this.cx = cx;
        this.cy = cy;
    }
}

export class Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

export class AnnGuideStepData {
    //imageSrc: string;
    imageName: string;
    tipTextCreating: string;
    tipTextCreated: string;

    constructor(imageName: string, tipTextCreating: string, tipTextCreated: string = undefined) {
        this.imageName = imageName;
        //this.imageSrc = baseUrl + "assets/img/TutorImage/" + imageName;
        this.tipTextCreating = tipTextCreating;
        this.tipTextCreated = tipTextCreated ? tipTextCreated : tipTextCreating;
    }
}

export class AnnGuideData {
    annName: string;
    cursor: string;

    guideStepList: Array<AnnGuideStepData> = [];

    constructor(annName: string, cursor: string) {
        this.annName = annName;
        this.cursor = cursor;
    }

    addStepData(annGuideStepData: AnnGuideStepData) {
        this.guideStepList.push(annGuideStepData);
    }
}

export class AnnGuideStepButton {
    annGuideStepData: AnnGuideStepData
    imageSrc: string;
    imageData = new Image();
    jcBackground: any;
    jcBackgroundBorder: any;
    jcText: any;
    stepIndex: number;

    constructor(stepIndex: number, baseUrl: string, annGuideStepData: AnnGuideStepData) {
        this.annGuideStepData = annGuideStepData;
        this.stepIndex = stepIndex;
        this.imageSrc = baseUrl + "assets/img/TutorImage/" + annGuideStepData.imageName;
    }

    loadImage() {
        this.imageData.src = this.imageSrc;
    }

    getTipText(annCreated: boolean): string {
        return annCreated ? this.annGuideStepData.tipTextCreated : this.annGuideStepData.tipTextCreating;
    }

    del() {
        if (this.jcBackground) this.jcBackground.del();
        if (this.jcBackgroundBorder) this.jcBackgroundBorder.del();
        if (this.jcText) this.jcText.del();
    }
}

export class AnnGuideActionButton {
    disabled = false;
    imageSrcList = [];
    imageDataList = [];
    jcImage: any;
    onButtonClick: any;

    imageTypeList = ["disabled", "hover", "select", "up"];

    constructor(baseUrl: string, buttonName: string) {
        baseUrl += "assets/img/TutorImage/";

        this.imageTypeList.forEach(type => {
            this.imageSrcList.push(baseUrl + buttonName + "_" + type + ".png");
            this.imageDataList.push(new Image());
        });
    }

    loadImage() {
        for (let i = 0; i < this.imageDataList.length; i ++) {
            this.imageDataList[i].src = this.imageSrcList[i];
        }
    }

    del() {
        if (this.jcImage) this.jcImage.del();
    }

    visible(visible: boolean) {
        if (this.jcImage) {
            this.jcImage.visible(visible);
        }
    }

    onDisabled() {
        this.jcImage._img = this.imageDataList[0];
        this.disabled = true;
    }

    onHover() {
        this.jcImage._img = this.imageDataList[1];
        this.disabled = false;
    }

    onSelect() {
        this.jcImage._img = this.imageDataList[2];
        this.disabled = false;
    }

    onUp() {
        this.jcImage._img = this.imageDataList[3];
        this.disabled = false;
    }

    getUpImage(): any {
        return this.imageDataList[3];
    }

    getDisabledImage(): any {
        return this.imageDataList[0];
    }

    isDisabled(): boolean {
        return this.disabled;
    }
}

export enum PositionInRectangle {
    Top,
    TopLeft,
    TopRight,
    Left,
    Right,
    Bottom,
    BottomLeft,
    BottomRight
}

export enum AnnType {
    Line = 1,
    Circle = 2,
    Rectangle = 3
}