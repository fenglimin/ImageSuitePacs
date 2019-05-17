import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { SelectedButtonData } from "../models/dropdown-button-menu-data";

export enum ViewContextEnum {
    Select = 1,
    Pan = 2,
    WL = 3,
    Zoom = 4,
    Magnifier = 5,
    ROIZoom = 6,
    CreateAnn = 7,
    ROIWL = 8,
    MagnifyX2,
    MagnifyX4,
    MagnifyX8,
    SelectAnn
}

export enum OperationEnum {
    Rotate = 1,
    Flip = 2,
    Invert = 3,
    ShowAnnotation = 4,
    ShowOverlay = 5,
    ShowRuler = 6,
    DeleteAnnotation = 7,
    Save = 8,
    SetContext = 9,
    ManualWL = 10,
    FitHeight,
    FitWidth,
    FitWindow,
    FitOriginal,
    Reset,
    ShowGraphicOverlay,
    ToggleKeyImage,
    Marker
}

export class OperationData {
    type: OperationEnum;
    data: any;

    constructor(type: OperationEnum, data: any) {
        this.type = type;
        this.data = data;
    }
}

export class ViewContext {
    private _action = ViewContextEnum.Pan;
    private _data: any;

    constructor(action: ViewContextEnum, data: any = undefined) {
        this._action = action;
        this._data = data;
    }

    get action(): ViewContextEnum {
        return this._action;
    }

    get data(): any {
        return this._data;
    }
}

@Injectable({
    providedIn: "root"
})
export class ViewContextService {

    private _curContext: ViewContext;
    private _previousContext: ViewContext;

    private _showAnnotation = true;
    private _showOverlay = true;
    private _showRuler = true;
    private _showGraphicOverlay = false;
    public _keyImage = false;

    private viewContextChangedSource = new Subject<ViewContext>();
    viewContextChanged$ = this.viewContextChangedSource.asObservable();

    private operationSource = new Subject<OperationData>();
    onOperation$ = this.operationSource.asObservable();

    constructor() {
        this._curContext = new ViewContext(ViewContextEnum.Select);
    }

    get curContext(): ViewContext {
        return this._curContext;
    }

    get previousContext(): ViewContext {
        return this._previousContext;
    }

    set showAnnotation(bShow: boolean) {
        this._showAnnotation = bShow;
        const data = new OperationData(OperationEnum.ShowAnnotation, { show: bShow });

        this.operationSource.next(data);
    }

    get showAnnotation(): boolean {
        return this._showAnnotation;
    }

    set showOverlay(bShow: boolean) {
        this._showOverlay = bShow;
        const data = new OperationData(OperationEnum.ShowOverlay, { show: bShow });

        this.operationSource.next(data);
    }

    get showOverlay(): boolean {
        return this._showOverlay;
    }

    set showRuler(bShow: boolean) {
        this._showRuler = bShow;
        const data = new OperationData(OperationEnum.ShowRuler, { show: bShow });

        this.operationSource.next(data);
    }

    get showRuler(): boolean {
        return this._showRuler;
    }

    set showGraphicOverlay(bShow: boolean) {
        this._showGraphicOverlay = bShow;
        const data = new OperationData(OperationEnum.ShowGraphicOverlay, { show: bShow });

        this.operationSource.next(data);
    }

    get showGraphicOverlay(): boolean {
        return this._showGraphicOverlay;
    }

    onOperation(data: OperationData) {
        switch (data.type) {
        case OperationEnum.ShowAnnotation:
        {
            this.showAnnotation = !this.showAnnotation;
            break;
        }
        case OperationEnum.ShowOverlay:
        {
            this.showOverlay = !this.showOverlay;
            break;
        }
        case OperationEnum.ShowRuler:
        {
            this.showRuler = !this.showRuler;
            break;
        }
        case OperationEnum.ShowGraphicOverlay:
        {
            this.showGraphicOverlay = !this.showGraphicOverlay;
            break;
        }

        default:
            this.operationSource.next(data);
        }

    }

    setContext(context: ViewContextEnum, data: any = undefined) {
        const curContext = new ViewContext(context, data);
        this._previousContext = this._curContext;
        this._curContext = curContext;

        if (this._curContext.action !== this._previousContext.action) {
            this.viewContextChangedSource.next(this._curContext);
        } else if (this._curContext.action == ViewContextEnum.CreateAnn) {
            //if want to create the same object even if current object is not finished yet, we still change context to delete it. 
            this.viewContextChangedSource.next(this._curContext);
        }
    }

    isImageToolBarButtonChecked(buttonData: SelectedButtonData): boolean {
        switch (buttonData.operationData.type) {
        case OperationEnum.ShowAnnotation:
            return this._showAnnotation;
        case OperationEnum.ShowOverlay:
            return this._showOverlay;
        case OperationEnum.ShowRuler:
            return this._showRuler;
        case OperationEnum.ShowGraphicOverlay:
            return this._showGraphicOverlay;
        case OperationEnum.ToggleKeyImage:
            return this._keyImage;

        default:
            return buttonData.operationData.data == this._curContext.action;
        }
    }

    isImageToolBarButtonCheckStyle(buttonData: SelectedButtonData): boolean {
        switch (buttonData.operationData.type) {
        case OperationEnum.ShowAnnotation:
        case OperationEnum.ShowOverlay:
        case OperationEnum.ShowRuler:
        case OperationEnum.ShowGraphicOverlay:
        case OperationEnum.SetContext:
        case OperationEnum.ToggleKeyImage:
            return true;
        default:
            return false;
        }
    }

}
