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

  @Output() selected = new EventEmitter<SelectedButtonData>();

    @Input() buttonData: SelectedButtonData;
    @Input() isTopButton: boolean;
    @Input() showArrow: boolean;

    constructor(private viewContext: ViewContextService, private configurationService: ConfigurationService) {
      this.buttonStyleToken = { normal: "normal", over: "focus", down: "down", disable: "disable" };
      this.baseUrl = this.configurationService.getBaseUrl();
    }

  ngOnInit() {
  }

  getDefaultBackgroundUrl(): string {
      return this.createBackgroundUrl(this.buttonStyleToken.normal);
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
      event.target.style.backgroundImage = this.createBackgroundUrl(this.buttonStyleToken.over);
  }

  onMouseOut(event) {
      event.target.style.backgroundImage = this.createBackgroundUrl(this.buttonStyleToken.normal);
  }

  onMouseDown(event) {
      event.target.style.backgroundImage = this.createBackgroundUrl(this.buttonStyleToken.down);
  }

  onMouseUp(event) {
    event.target.style.backgroundImage = this.createBackgroundUrl(this.buttonStyleToken.normal);
  }

  onClick() {
      this.selected.emit(this.buttonData);
    this.viewContext.onOperation(this.buttonData.operationData);
  }

}
