import { Injectable } from '@angular/core';
import { Subject }  from 'rxjs';

export enum ViewContextEnum {
    Select = 1,
    Pan = 2,
    WL = 3,
    Zoom = 4,
    Magnifier = 5,
    ROIZoom = 6,
    Create = 7,
    ROIWL = 8,
    MagnifyX2,
    MagnifyX4,
    MagnifyX8
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
    ToggleKeyImage
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
    private _action: ViewContextEnum = ViewContextEnum.Pan;
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
    providedIn: 'root'
})
export class ViewContextService {

    private _curContext: ViewContext;
    private _previousContext: ViewContext;

    private _showAnnotation: boolean = true;
    private _showOverlay: boolean = true;
    private _showRuler: boolean = true;

    private viewContextChangedSource = new Subject<ViewContext>();
    viewContextChanged$ = this.viewContextChangedSource.asObservable();

    private operationSource = new Subject<OperationData>();
    onOperation$ = this.operationSource.asObservable();

    constructor() {
        this._curContext = new ViewContext(ViewContextEnum.Pan);
    }

    get curContext(): ViewContext {
        return this._curContext;
    }

    get previousContext(): ViewContext {
        return this._previousContext;
    }

    set showAnnotation(bShow: boolean) {
        this._showAnnotation = bShow;
        let data: OperationData = new OperationData(OperationEnum.ShowAnnotation, { show: bShow });

        this.operationSource.next(data);
    }

    get showAnnotation(): boolean {
        return this._showAnnotation;
    }

    set showOverlay(bShow: boolean) {
        this._showOverlay = bShow;
        let data: OperationData = new OperationData(OperationEnum.ShowOverlay, { show: bShow });

        this.operationSource.next(data);
    }

    get showOverlay(): boolean {
        return this._showOverlay;
    }

    set showRuler(bShow: boolean) {
        this._showRuler = bShow;
        let data: OperationData = new OperationData(OperationEnum.ShowRuler, { show: bShow });

        this.operationSource.next(data);
    }

    get showRuler(): boolean {
        return this._showRuler;
    }

    onOperation(data: OperationData) {
        this.operationSource.next(data);
    }

    setContext(context: ViewContextEnum, data: any = undefined) {
        let curContext = new ViewContext(context, data);
        this._previousContext = this._curContext;
        this._curContext = curContext;

        if (this._curContext.action != this._previousContext.action) {
            this.viewContextChangedSource.next(this._curContext);
        } else if (this._curContext.action == ViewContextEnum.Create) {
            //if want to create the same object even if current object is not finished yet, we still change context to delete it. 
            this.viewContextChangedSource.next(this._curContext);
        }
    }
}
