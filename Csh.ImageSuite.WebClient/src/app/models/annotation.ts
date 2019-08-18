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


// Annotation type, copied from ImageSuite Acq.
// The annotation type in Web and Acq is different. Not sure why.
export enum AnnType {
    None = 0,
    Select,
    Rect,
    RectEx,
    Ellipse,
    Pointer,
    FreeArea,
    Text,
    Ruler,
    Protractor,
    Arrow,
    Stamp,
    Multiline,
    HeartChestRatio,
    CobbAngle,
    LipmanCobbAngle,
    Coxometry,
    Goniometry,
    Gd,
    Vd,
    Vhs,
    Tta,
    Tplo,
    Laminitis,
    Polygon,
    Blade,
    Chiro,
    Gonstead,
    Vaxis,
    VlineDistance,
    LineExt,
    CervicalCurve,
    LumbarCurve,
    GeorgeLine,
    LineEx1,
    OffsetCobbAngle,
    ExtendedCobbAngle,
    MarkSpot,
    LineRatio,
    VerticalDeflection,
    HorizontalDeflection,
    GeorgesLineNew,
    Ara,
    VertebralCompression,
    Cmap,
    LoganBasicMarking
}

export enum MouseEventType {
    Click = 1,
    MouseDown = 2,
    MouseMove = 3,
    MouseUp = 4,
    MouseOver = 5,
    MouseOut = 6,
    RightClick = 7,
    DblClick = 8,
    MouseWheel = 9
}

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

export class AnnotationDefinitionData {
    classType: any;
    cursorName: string;
    needGuide: boolean;
    imageSuiteAnnName: string;
    imageSuiteAnnType: AnnType;

    className: string;

    constructor(classType: any, cursorName: string, needGuide: boolean, imageSuiteAnnName: string, imageSuiteAnnType: AnnType) {
        this.classType = classType;
        this.cursorName = cursorName;
        this.needGuide = needGuide;
        this.imageSuiteAnnName = imageSuiteAnnName;
        this.imageSuiteAnnType = imageSuiteAnnType;

        this.className = classType.name;
    }
}

// The configuration data for each step of the annotation
export class AnnGuideStepConfig {
    // The name of the guide picture
    imageName: string;

    // The tip text for creating annotation
    tipTextCreating: string;

    // The tip text for viewing annotation
    tipTextCreated: string;

    constructor(imageName: string, tipTextCreating: string, tipTextCreated: string = undefined) {
        this.imageName = imageName;
        this.tipTextCreating = tipTextCreating;
        this.tipTextCreated = tipTextCreated ? tipTextCreated : tipTextCreating;
    }
}

// The running data for each step
export class AnnGuideStepData {
    // The config data
    annGuideStepConfig: AnnGuideStepConfig

    // The image source string of the tutor image
    imageSrc: string;

    // The image data of the tutor image
    imageData = new Image();

    // The jc object for the step button background 
    jcBackground: any;

    // The jc object for the step button background border
    jcBackgroundBorder: any;

    // The jc object for the tip text
    jcText: any;

    // The index for the step
    stepIndex: number;

    constructor(stepIndex: number, baseUrl: string, annGuideStepConfig: AnnGuideStepConfig) {
        this.annGuideStepConfig = annGuideStepConfig;
        this.stepIndex = stepIndex;
        this.imageSrc = baseUrl + "assets/img/TutorImage/" + annGuideStepConfig.imageName;
    }

    loadImage() {
        this.imageData.src = this.imageSrc;
    }

    getTipText(annCreated: boolean): string {
        return annCreated ? this.annGuideStepConfig.tipTextCreated : this.annGuideStepConfig.tipTextCreating;
    }

    del() {
        if (this.jcBackground) this.jcBackground.del();
        if (this.jcBackgroundBorder) this.jcBackgroundBorder.del();
        if (this.jcText) this.jcText.del();
    }
}

// The action button of the guide
export class AnnGuideActionButton {
    // If the button is disabled
    disabled = false;

    // There are four states for a button
    imageTypeList = ["disabled", "hover", "select", "up"];

    // The image source string for the four states
    imageSrcList = [];

    // The image data for the four states
    imageDataList = [];

    // The jc object for the image
    jcImage: any;

    // Callback for button click
    onButtonClick: any;

    constructor(baseUrl: string, buttonName: string, onButtonClick: any) {
        baseUrl += "assets/img/TutorImage/";
        this.onButtonClick = onButtonClick;

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


export class AnnGuideData {
    annName: string;

    guideStepConfigList: Array<AnnGuideStepConfig> = [];
    guideStepImageList = [];

    constructor(annName: string) {
        this.annName = annName;
    }

    addStepConfig(annGuideStepConfig: AnnGuideStepConfig) {
        this.guideStepConfigList.push(annGuideStepConfig);
    }

    addStepImage(stepImage: any) {
        this.guideStepImageList.push(stepImage);
    }
}

export class Vector2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    length(): number{
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    normalize(): Vector2{
        const inv = 1 / this.length();
        return new Vector2(this.x * inv, this.y * inv);
    }

    add(v: Vector2): Vector2 {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    multiply(f: number): Vector2{
        return new Vector2(this.x * f, this.y * f);
    }
    
    dot(v: Vector2): number {
        return this.x * v.x + this.y * v.y;
    }

    angle(v: Vector2): number{
        return Math.acos(this.dot(v) / (this.length() * v.length())) * 180 / Math.PI;
    }
}
