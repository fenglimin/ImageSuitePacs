import { Component, OnInit, Input } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { SelectedButtonData, ButtonStyleToken } from '../../../models/dropdown-button-menu-data';
import { OperationEnum, ViewContextEnum, OperationData, ViewContextService } from '../../../services/view-context.service';

@Component({
  selector: 'app-dropdown-button-menu',
  templateUrl: './dropdown-button-menu.component.html',
  styleUrls: ['./dropdown-button-menu.component.css']
})
export class DropdownButtonMenuComponent implements OnInit {
  selectedButton: SelectedButtonData;
  buttonStyleToken: ButtonStyleToken;
  @Input() menuButtonList: SelectedButtonData[];

  private baseUrl: string;

  constructor(private locationStrategy: LocationStrategy, private viewContext: ViewContextService) {
    this.buttonStyleToken = { normal: "normal", over: "focus", down: "down", disable: "disable" };
  }

  ngOnInit() {
    this.baseUrl = window.location.origin + this.locationStrategy.getBaseHref();
    this.selectedButton = this.menuButtonList[0];
  }

  getButtonBackground(name: string) {
      const background = `url(${this.baseUrl}assets/img/Toolbar/${name}/normal/bitmap.gif)`;
      return background;
  }

  onMouseOver(event, triggerClick: boolean) {
      event.target.style.backgroundImage = event.target.style.backgroundImage.replace(this.buttonStyleToken.normal, this.buttonStyleToken.over);
      if (triggerClick) {
          //event.target.click();
      }
  }

  onMouseOut(event) {
      const imageUrl = event.target.style.backgroundImage.replace(this.buttonStyleToken.over, this.buttonStyleToken.normal);
      if (imageUrl === event.target.style.backgroundImage) {
          event.target.style.backgroundImage = event.target.style.backgroundImage.replace(this.buttonStyleToken.down, this.buttonStyleToken.normal);
      } else {
          event.target.style.backgroundImage = imageUrl;
      }
  }

  onMouseDown(event) {
      event.target.style.backgroundImage = event.target.style.backgroundImage.replace(this.buttonStyleToken.over, this.buttonStyleToken.down);
  }

  onMouseUp(event) {
      event.target.style.backgroundImage = event.target.style.backgroundImage.replace(this.buttonStyleToken.down, this.buttonStyleToken.normal);
  }

  onButtonSelected(menuButton: SelectedButtonData) {
    this.selectedButton = menuButton;
    this.viewContext.onOperation(this.selectedButton.operationData);
  }
}
