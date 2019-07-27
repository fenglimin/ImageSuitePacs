import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { Subscription } from "rxjs";

import { SelectedButtonData, ButtonStyleToken } from "../../../models/dropdown-button-menu-data";
import { ConfigurationService } from "../../../services/configuration.service";
import { ImageOperationData, ImageOperationEnum, ImageContextEnum } from "../../../models/image-operation";
import { ImageOperationService } from "../../../services/image-operation.service";

@Component({
    selector: "app-dropdown-button-menu-button",
    templateUrl: "./dropdown-button-menu-button.component.html",
    styleUrls: ["./dropdown-button-menu-button.component.css"]
})
export class DropdownButtonMenuButtonComponent implements OnInit {
    buttonStyleToken: ButtonStyleToken;
    baseUrl: string;

    backgroundUrl: string;
    isCheckStyle: boolean;
    defaultStyle: string;


    private subscriptionImageOperation: Subscription;

    @Output()
    selected = new EventEmitter<SelectedButtonData>();
    @Input()
    isTopButton: boolean;
    @Input()
    showArrow: boolean;

    private _buttonData: SelectedButtonData;

    @Input()
    set buttonData(value: SelectedButtonData) {
        this._buttonData = value;
        if (this.isTopButton && this.isCheckStyle) {
            if (this._buttonData.operationData.operationType === ImageOperationEnum.SetContext) {
                this.defaultStyle = this.buttonStyleToken.down;
            } else {
                this.defaultStyle = this.buttonStyleToken.normal;
            }
        }
        this.backgroundUrl = this.createBackgroundUrl(this.defaultStyle);
    }

    get buttonData() {
        return this._buttonData;
    }

    private _isChecked: boolean;

    @Input()
    set isChecked(value: boolean) {
        this._isChecked = value;
        if (this.isCheckStyle) {
            this.defaultStyle = this.getDefaultStyle();
            this.backgroundUrl = this.createBackgroundUrl(this.defaultStyle);
        }
    }

    get isChecked() {
        return this._isChecked;
    }

    constructor(private imageOperationService: ImageOperationService,
        private configurationService: ConfigurationService) {

        this.buttonStyleToken = { normal: "normal", over: "focus", down: "down", disable: "disable" };
        this.baseUrl = this.configurationService.getBaseUrl();

        this.subscriptionImageOperation = imageOperationService.imageOperation$.subscribe(
            imageOperationData => {
                this.onImageOperation(imageOperationData);
            });

        this.defaultStyle = this.buttonStyleToken.normal;
    }

    ngOnInit() {
        this.isCheckStyle = this.imageOperationService.isImageToolBarButtonCheckStyle(this.buttonData.operationData.operationType);
        this.isChecked = this.imageOperationService.isImageToolBarButtonInitChecked(this.buttonData.operationData.operationType);
    }

    getDefaultStyle(): string {
        return this.isChecked ? this.buttonStyleToken.down : this.buttonStyleToken.normal;
    }

    getDefaultMarginTop() {
        return this.isTopButton ? "-20px" : "0";
    }

    createBackgroundUrl(styleToken: string): string {
        const arrowToken = this.showArrow ? "_h" : "";
        const backgroundUrl =
            `url(${this.baseUrl}assets/img/Toolbar/${this.buttonData.name}/${styleToken}/bitmap${arrowToken}.gif)`;
        return backgroundUrl;
    }

    onMouseOver(event) {
        this.setBackgroundImage(this.buttonStyleToken.over);
    }

    onMouseOut(event) {
        this.setBackgroundImage(this.defaultStyle);
    }

    onMouseDown(event) {
        if (this.isCheckStyle && this.isChecked) {
            this.setBackgroundImage(this.buttonStyleToken.normal);
        } else {
            this.setBackgroundImage(this.buttonStyleToken.down);
        }
    }

    onMouseUp(event) {
        this.setBackgroundImage(this.defaultStyle);
    }

    setBackgroundImage(style) {
        this.backgroundUrl = this.createBackgroundUrl(style);
    }

    onClick() {
        if (!this.isTopButton) {
            this.selected.emit(this.buttonData);
        }

        this.imageOperationService.doImageInteraction(this.buttonData.operationData);

        if (this.buttonData.operationData.operationType !== ImageOperationEnum.SetContext) {
            if (this.isCheckStyle && this.isTopButton && !this.showArrow) {
                this.isChecked = !this.isChecked;
            }
        }
        
        //if (this.buttonData.operationData.type === OperationEnum.SetContext) {
            
        //    if (this.buttonData.operationData.data instanceof ViewContext) {
        //        const viewContext = this.buttonData.operationData.data as ViewContext;
        //        this.viewContext.setContext(viewContext.action, viewContext.data);
        //    } else {
        //        this.viewContext.setContext(this.buttonData.operationData.data, null);
        //    }
            
        //} else {
        //    this.viewContext.onOperation(this.buttonData.operationData);
        //    if (this.isCheckStyle && this.isTopButton && !this.showArrow) {
        //        this.isChecked = !this.isChecked;
        //    }
        //}
    }

    //setContext(viewContext) {
        //if (this.buttonData.operationData.type === OperationEnum.SetContext) {
            
        //    if (this.buttonData.operationData.data instanceof ViewContext) {
        //        const myViewContext = this.buttonData.operationData.data as ViewContext;
        //        this.isChecked = (viewContext.action === myViewContext.action && viewContext.data === myViewContext.data);
        //    } else {
        //        this.isChecked = (viewContext.action === this.buttonData.operationData.data);
        //    }
            
        //}
    //}

    onImageOperation(imageOperationData: ImageOperationData) {
        // Only handle the image operations of same shell
        if (!imageOperationData.needResponse(this.buttonData.operationData.shellId)) return;

        if (imageOperationData.operationType === ImageOperationEnum.SetContext) {
            // Current operation is set context, do nothing if it is NOT a context button
            if (this.buttonData.operationData.operationType !== ImageOperationEnum.SetContext) return;

            this.isChecked = this.buttonData.operationData.contextType === imageOperationData.contextType &&
                this.buttonData.operationData.contextPara === imageOperationData.contextPara;
        }
    }
}
