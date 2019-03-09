import { Component, OnInit, Input } from '@angular/core';
import { SelectedButtonData, ButtonStyleToken } from '../../../models/dropdown-button-menu-data';
import { OperationEnum, ViewContextEnum, OperationData, ViewContextService } from '../../../services/view-context.service';

@Component({
  selector: 'app-dropdown-button-menu',
  templateUrl: './dropdown-button-menu.component.html',
  styleUrls: ['./dropdown-button-menu.component.css']
})
export class DropdownButtonMenuComponent implements OnInit {
  selectedButton: SelectedButtonData;
  @Input() menuButtonList: SelectedButtonData[];

  constructor(private viewContext: ViewContextService) {
  }

  ngOnInit() {
    this.selectedButton = this.menuButtonList[0];
  }

  onSelectChanged(menuButton: SelectedButtonData) {
    this.selectedButton = menuButton;
  }
}
