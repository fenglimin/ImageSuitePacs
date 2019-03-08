import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

import { ImageSelectorService } from '../../../services/image-selector.service';
import { OperationEnum, ViewContextEnum, OperationData, ViewContextService } from '../../../services/view-context.service';
import { Subscription }   from 'rxjs';
import { GroupHangingProtocal } from '../../../models/hanging-protocal';
import { AnnObject } from '../../../annotation/ann-object';
import { AnnRuler } from '../../../annotation/ann-ruler';
import { SelectedButtonData, ButtonStyleToken } from '../../../models/dropdown-button-menu-data';

@Component({
    selector: 'app-viewer-toolbar',
    templateUrl: './viewer-toolbar.component.html',
    styleUrls: ['./viewer-toolbar.component.css']
})
export class ViewerToolbarComponent implements OnInit {
  @Output() layout = new EventEmitter<number>();

  selectPanButtonMenuList: SelectedButtonData[] = [
    { name: "selection", tip: "Select", operationData: { type: OperationEnum.Save, data: 1 } },
    { name: "Pan", tip: "Pan", operationData: { type: OperationEnum.Save, data: 1 }}
  ];

  rotateFlipButtonMenuList: SelectedButtonData[] = [
    { name: "FlipH", tip: "Flip Horizontal", operationData: { type: OperationEnum.Flip, data: false } },
    { name: "FlipV", tip: "Flip Vertical", operationData: { type: OperationEnum.Flip, data: true } },
    { name: "Rotatecw", tip: "Rotate CW", operationData: { type: OperationEnum.Rotate, data: { angle: 90 } } },
    { name: "Rotateccw", tip: "Rotate CCW", operationData: { type: OperationEnum.Rotate, data: { angle: -90 } } }
  ];

  zoomButtonMenuList: SelectedButtonData[] = [
    { name: "Zoom", tip: "Zoom", operationData: { type: OperationEnum.Save, data: 1 } },
    { name: "magnify2", tip: "Magnify X 2", operationData: { type: OperationEnum.Save, data: 1 } },
    { name: "magnify4", tip: "Magnify X 4", operationData: { type: OperationEnum.Save, data: 1 } },
    { name: "rectzoom", tip: "ROI Zoom", operationData: { type: OperationEnum.Save, data: 1 } }
  ];

  fitButtonMenuList: SelectedButtonData[] = [
      { name: "fitheight", tip: "Fit Height", operationData: { type: OperationEnum.Save, data: 1 } },
      { name: "magnify2", tip: "Magnify X 2", operationData: { type: OperationEnum.Save, data: 1 } },
      { name: "magnify4", tip: "Magnify X 4", operationData: { type: OperationEnum.Save, data: 1 } },
      { name: "rectzoom", tip: "ROI Zoom", operationData: { type: OperationEnum.Save, data: 1 } }
  ];

  private baseUrl: string;


    constructor(private imageSelectorService: ImageSelectorService, private viewContext: ViewContextService,
        private locationStrategy: LocationStrategy) {

    }

    ngOnInit() {
        this.baseUrl = window.location.origin + this.locationStrategy.getBaseHref();
    }

    onRotate(angle: number) {
        let data: OperationData = new OperationData(OperationEnum.Rotate, { angle: angle });
        this.viewContext.onOperation(data);
    }

    onAddRuler() {
        this.viewContext.setContext(ViewContextEnum.Create, { type: AnnRuler });
    }

    onMouseOver(event, triggerClick: boolean) {
      event.target.style.backgroundImage = event.target.style.backgroundImage.replace('/normal/', '/focus/');
        if (triggerClick) {
            //event.target.click();
        }
    }

    onMouseOut(event) {
      const imageUrl = event.target.style.backgroundImage.replace('/focus/', '/normal/');
        if (imageUrl === event.target.style.backgroundImage) {
          event.target.style.backgroundImage = event.target.style.backgroundImage.replace('/down/', '/normal/');
        } else {
            event.target.style.backgroundImage = imageUrl;
        }
    }

    onMouseDown(event) {
      event.target.style.backgroundImage = event.target.style.backgroundImage.replace('/focus/', '/down/');
    }

    onMouseUp(event) {
      event.target.style.backgroundImage = event.target.style.backgroundImage.replace('/down/', '/normal/');
    }

    getMenuBackground(name:string) {
      const background = `url(${this.baseUrl}assets/img/Toolbar/${name}/normal/bitmap.gif)`;
        return background;
    }

    getMenuTip() {

    }
}

