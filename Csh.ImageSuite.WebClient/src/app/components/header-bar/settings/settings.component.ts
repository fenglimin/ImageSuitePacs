import { Component, OnInit } from '@angular/core';
import { DialogService } from "../../../services/dialog.service";
import { DeliveryStatusComponent } from "./delivery-status/delivery-status.component";
import {MatMenuModule} from '@angular/material/menu';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less']
})
export class SettingsComponent implements OnInit {

    constructor(public dialogService: DialogService) { }

  ngOnInit() {
  }

  onDeliveryStatusClicked() {
      this.dialogService.showDialog(DeliveryStatusComponent, "").subscribe(
          val => {
              //this.getStudyDate(val);
          }
      );

  }



}
