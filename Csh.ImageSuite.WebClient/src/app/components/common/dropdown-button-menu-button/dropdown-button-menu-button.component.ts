import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { Subscription } from "rxjs";

import { SelectedButtonData, ButtonStyleToken } from "../../../models/dropdown-button-menu-data";
import { OperationEnum, ViewContext, ViewContextService } from "../../../services/view-context.service";
import { ConfigurationService } from "../../../services/configuration.service";

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


    private subscriptionViewContextChange: Subscription;

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
            if (this._buttonData.operationData.type === OperationEnum.SetContext) {
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

    constructor(private viewContext: ViewContextService, private configurationService: ConfigurationService) {
        this.buttonStyleToken = { normal: "normal", over: "focus", down: "down", disable: "disable" };
        this.baseUrl = this.configurationService.getBaseUrl();

        this.subscriptionViewContextChange = viewContext.viewContextChanged$.subscribe(
            context => {
                this.setContext(context);
            });

        this.defaultStyle = this.buttonStyleToken.normal;
    }

    ngOnInit() {
        this.isCheckStyle = this.viewContext.isImageToolBarButtonCheckStyle(this.buttonData);
        this.isChecked = this.viewContext.isImageToolBarButtonChecked(this.buttonData);
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

        if (this.buttonData.operationData.type === OperationEnum.SetContext) {
            
            if (this.buttonData.operationData.data instanceof ViewContext) {
                const viewContext = this.buttonData.operationData.data as ViewContext;
                this.viewContext.setContext(viewContext.action, viewContext.data);
            } else {
                this.viewContext.setContext(this.buttonData.operationData.data, null);
            }
            
        } else {
            this.viewContext.onOperation(this.buttonData.operationData);
            if (this.isCheckStyle && this.isTopButton && !this.showArrow) {
                this.isChecked = !this.isChecked;
            }
        }
    }

    setContext(viewContext) {
        if (this.buttonData.operationData.type === OperationEnum.SetContext) {
            
            if (this.buttonData.operationData.data instanceof ViewContext) {
                const myViewContext = this.buttonData.operationData.data as ViewContext;
                this.isChecked = (viewContext.action === myViewContext.action && viewContext.data === myViewContext.data);
            } else {
                this.isChecked = (viewContext.action === this.buttonData.operationData.data);
            }
            
        }
    }
}
