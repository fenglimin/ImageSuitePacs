import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SelectedButtonData, ButtonStyleToken } from '../../../models/dropdown-button-menu-data';
import { OperationEnum, ViewContextEnum, OperationData, ViewContextService } from '../../../services/view-context.service';
import { ConfigurationService } from '../../../services/configuration.service';

@Component({
  selector: 'app-dropdown-button-menu-button',
  templateUrl: './dropdown-button-menu-button.component.html',
  styleUrls: ['./dropdown-button-menu-button.component.css']
})
export class DropdownButtonMenuButtonComponent implements OnInit {
  buttonStyleToken: ButtonStyleToken;
  baseUrl: string;
  isCheckStyle: boolean;
  defaultStyle: string;
  private _isChecked: boolean;

  @Output() selected = new EventEmitter<SelectedButtonData>();

  @Input() buttonData: SelectedButtonData;
  @Input() isTopButton: boolean;
  @Input() showArrow: boolean;
  @Input()
  set isChecked(value: boolean) {
    this._isChecked = value;
    if (this.isCheckStyle) {
      this.defaultStyle = this.getDefaultStyle();
    }
  }
  get isChecked() {
    return this._isChecked;
  }

  constructor(private viewContext: ViewContextService, private configurationService: ConfigurationService) {
    this.buttonStyleToken = { normal: "normal", over: "focus", down: "down", disable: "disable" };
    this.baseUrl = this.configurationService.getBaseUrl();
  }

  ngOnInit() {
    const op = this.buttonData.operationData.type;
    this.isCheckStyle = (op == OperationEnum.ToggleKeyImage || op == OperationEnum.ShowAnnotation || op == OperationEnum.ShowGraphicOverlay ||
      op == OperationEnum.ShowOverlay || op == OperationEnum.ShowRuler) || !this.isTopButton;
    this.isChecked = (op == OperationEnum.ShowAnnotation || op == OperationEnum.ShowOverlay || op == OperationEnum.ShowRuler);;
    this.defaultStyle = this.getDefaultStyle();
  }

  getDefaultStyle():string {
    return this.isChecked ? this.buttonStyleToken.down : this.buttonStyleToken.normal;
  }

  getDefaultBackgroundUrl(): string {
    return this.createBackgroundUrl(this.defaultStyle);
  }

  getDefaultMarginTop() {
    return this.isTopButton ? '-20px' : '0';
  }

  createBackgroundUrl(styleToken: string): string {
    const arrowToken = this.showArrow ? "_h" : "";
      const backgroundUrl = `url(${this.baseUrl}assets/img/Toolbar/${this.buttonData.name}/${styleToken}/bitmap${arrowToken}.gif)`;
      return backgroundUrl;
  }

  onMouseOver(event) {
    this.setBackgroundImage(event, this.buttonStyleToken.over);
  }

  onMouseOut(event) {
    this.setBackgroundImage(event, this.defaultStyle);
  }

  onMouseDown(event) {
    if (this.isCheckStyle && this.isChecked) {
      this.setBackgroundImage(event, this.buttonStyleToken.normal);
    } else {
      this.setBackgroundImage(event, this.buttonStyleToken.down);
    }
  }

  onMouseUp(event) {
    this.setBackgroundImage(event, this.defaultStyle);
  }

  setBackgroundImage(event, style) {
    event.target.style.backgroundImage = this.createBackgroundUrl(style);
  }

  onClick() {
    this.selected.emit(this.buttonData);
    if (this.buttonData.operationData.type === OperationEnum.SetContext) {
      this.viewContext.setContext(this.buttonData.operationData.data);
    } else {
      this.viewContext.onOperation(this.buttonData.operationData);
    }
    

    if (this.isCheckStyle && this.isTopButton) {
      this.isChecked = !this.isChecked;
     // this.defaultStyle = this.getDefaultStyle();
    }
  }
}
