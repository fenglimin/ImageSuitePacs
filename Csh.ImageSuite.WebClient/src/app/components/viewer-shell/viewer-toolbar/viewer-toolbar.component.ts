import { Component, OnInit, EventEmitter, Output } from "@angular/core";

import { ImageSelectorService } from "../../../services/image-selector.service";
import { OperationEnum, ViewContextEnum, ViewContext, ViewContextService } from "../../../services/view-context.service";
import { SelectedButtonData } from "../../../models/dropdown-button-menu-data";
import { ConfigurationService } from "../../../services/configuration.service";

import { AnnLine } from "../../../annotation/extend-object/ann-line";
import { AnnEllipse } from "../../../annotation/extend-object/ann-ellipse";
//import { AnnRectangle } from "../../../annotation/ann-rectangle";
//import { AnnArrow } from "../../../annotation/ann-arrow";

@Component({
    selector: "app-viewer-toolbar",
    templateUrl: "./viewer-toolbar.component.html",
    styleUrls: ["./viewer-toolbar.component.css"]
})
export class ViewerToolbarComponent implements OnInit {
    @Output()
    layout = new EventEmitter<number>();
    buttonDivideSrc: string;

    selectPanButtonMenuList: SelectedButtonData[] = [
        {
            name: "selection",
            tip: "Select",
            operationData: { type: OperationEnum.SetContext, data: ViewContextEnum.Select }
        },
        { name: "Pan", tip: "Pan", operationData: { type: OperationEnum.SetContext, data: ViewContextEnum.Pan } }
    ];

    rotateFlipButtonMenuList: SelectedButtonData[] = [
        { name: "FlipH", tip: "Flip Horizontal", operationData: { type: OperationEnum.Flip, data: false } },
        { name: "FlipV", tip: "Flip Vertical", operationData: { type: OperationEnum.Flip, data: true } },
        { name: "Rotatecw", tip: "Rotate CW", operationData: { type: OperationEnum.Rotate, data: { angle: 90 } } },
        { name: "Rotateccw", tip: "Rotate CCW", operationData: { type: OperationEnum.Rotate, data: { angle: -90 } } }
    ];

    zoomButtonMenuList: SelectedButtonData[] = [
        { name: "Zoom", tip: "Zoom", operationData: { type: OperationEnum.SetContext, data: ViewContextEnum.Zoom } },
        {
            name: "rectzoom",
            tip: "ROI Zoom",
            operationData: { type: OperationEnum.SetContext, data: ViewContextEnum.ROIZoom }
        }
    ];

    magnifyButtonMenuList: SelectedButtonData[] = [
        {
            name: "magnify2",
            tip: "Magnify X 2",
            operationData: { type: OperationEnum.SetContext, data: ViewContextEnum.MagnifyX2 }
        },
        {
            name: "magnify4",
            tip: "Magnify X 4",
            operationData: { type: OperationEnum.SetContext, data: ViewContextEnum.MagnifyX4 }
        },
        {
            name: "magnify8",
            tip: "Magnify X 8",
            operationData: { type: OperationEnum.SetContext, data: ViewContextEnum.MagnifyX8 }
        },
    ];

    fitButtonMenuList: SelectedButtonData[] = [
        { name: "fitheight", tip: "Fit Height", operationData: { type: OperationEnum.FitHeight, data: null } },
        { name: "fitoriginal", tip: "Fit Original", operationData: { type: OperationEnum.FitOriginal, data: null } },
        { name: "fitwidth", tip: "Fit Width", operationData: { type: OperationEnum.FitWidth, data: null } },
        { name: "fitwindow", tip: "Scale to Fit", operationData: { type: OperationEnum.FitWindow, data: null } }
    ];

    wlButtonMenuList: SelectedButtonData[] = [
        { name: "WL", tip: "W/L", operationData: { type: OperationEnum.SetContext, data: ViewContextEnum.WL } },
        { name: "ROI", tip: "ROI W/L", operationData: { type: OperationEnum.SetContext, data: ViewContextEnum.ROIWL } },
        { name: "ManualWL", tip: "Manual W/L", operationData: { type: OperationEnum.ManualWL, data: null } },
        { name: "Invert", tip: "Invert", operationData: { type: OperationEnum.Invert, data: null } }
    ];

    keyImageButtonMenu: SelectedButtonData = {
        name: "SetKeyImage",
        tip: "Key Image",
        operationData: { type: OperationEnum.ToggleKeyImage, data: null }
    };
    resetButtonMenu: SelectedButtonData =
        { name: "Reset", tip: "Reset", operationData: { type: OperationEnum.Reset, data: null } };
    showAnnotationButtonMenu: SelectedButtonData = {
        name: "showannotation",
        tip: "Show Annotation",
        operationData: { type: OperationEnum.ShowAnnotation, data: null }
    };
    showOverlayButtonMenu: SelectedButtonData = {
        name: "showoverlay",
        tip: "Show Overlay",
        operationData: { type: OperationEnum.ShowOverlay, data: null }
    };
    showRulerButtonMenu: SelectedButtonData = {
        name: "showruler",
        tip: "Show Ruler",
        operationData: { type: OperationEnum.ShowRuler, data: null }
    };
    showGraphicOverlayButtonMenu: SelectedButtonData = {
        name: "showgraphicoverlay",
        tip: "Show Graphic Overlay",
        operationData: { type: OperationEnum.ShowGraphicOverlay, data: null }
    };
    selectAnnotationButtonMenu: SelectedButtonData = {
        name: "ann_selection",
        tip: "Select Annotation",
        operationData: { type: OperationEnum.SetContext, data: ViewContextEnum.SelectAnn }
    };
    simpleAnnotation1ButtonMenu: SelectedButtonData[] = [
        { name: "ann_line", tip: "Line", operationData: { type: OperationEnum.SetContext, data: new ViewContext(ViewContextEnum.CreateAnn, AnnLine) } },
        { name: "ann_ellipse", tip: "Eclipse", operationData: { type: OperationEnum.SetContext, data: new ViewContext(ViewContextEnum.CreateAnn, AnnEllipse) } }
  //      { name: "ann_rectangle", tip: "Rectangle", operationData: { type: OperationEnum.SetContext, data: new ViewContext(ViewContextEnum.CreateAnn, AnnRectangle) } },
    //    { name: "ann_arrow", tip: "Arrow", operationData: { type: OperationEnum.SetContext, data: new ViewContext(ViewContextEnum.CreateAnn, AnnArrow) } }
    ];

    private baseUrl: string;


    constructor(private imageSelectorService: ImageSelectorService,
        private viewContext: ViewContextService,
        private configurationService: ConfigurationService) {
        this.buttonDivideSrc = this.configurationService.getBaseUrl() + "assets/img/DicomViewer/fenge2.png";
    }

    ngOnInit() {
    }

    getButtonDivideSrc(): string {
        return this.buttonDivideSrc;
    }
}
