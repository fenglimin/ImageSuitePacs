import { Component, OnInit, EventEmitter, Output, Input } from "@angular/core";
import { ViewerShellData } from "../../../models/viewer-shell-data";
import { OperationEnum, ViewContextEnum, ViewContext, ViewContextService } from "../../../services/view-context.service";
import { SelectedButtonData, ToolbarButtonTypeEnum, ToolbarButtonData } from "../../../models/dropdown-button-menu-data";
import { ConfigurationService } from "../../../services/configuration.service";
import { AnnType } from "../../../models/annotation";
import { ImageOperationData, ImageOperationEnum, ImageContextEnum } from "../../../models/image-operation";

@Component({
    selector: "app-viewer-toolbar",
    templateUrl: "./viewer-toolbar.component.html",
    styleUrls: ["./viewer-toolbar.component.css"]
})
export class ViewerToolbarComponent implements OnInit {
    private buttonDivideSrc: string;
    private baseUrl: string;
    private shellId: string;

    toolbarButtonList = [];

    @Input()
    viewerShellData: ViewerShellData;

    constructor(private viewContext: ViewContextService,
        private configurationService: ConfigurationService) {
        this.buttonDivideSrc = this.configurationService.getBaseUrl() + "assets/img/DicomViewer/fenge2.png";
    }

    ngOnInit() {
        this.shellId = this.viewerShellData.getId();

        const selectPanButtonMenuList: SelectedButtonData[] = [
            { name: "selection", tip: "Select", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.Select) },
            { name: "Pan", tip: "Pan", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.Pan) }
        ];

        const rotateFlipButtonMenuList: SelectedButtonData[] = [
            { name: "FlipH", tip: "Flip Horizontal", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.FlipHorizontalSelectedImage) },
            { name: "FlipV", tip: "Flip Vertical", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.FlipVerticalSelectedImage) },
            { name: "Rotatecw", tip: "Rotate CW", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.RotateCwSelectedImage) },
            { name: "Rotateccw", tip: "Rotate CCW", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.RotateCcwSelectedImage) }
        ];

        const zoomButtonMenuList: SelectedButtonData[] = [
            { name: "Zoom", tip: "Zoom", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.Zoom ) },
            { name: "rectzoom", tip: "ROI Zoom", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.RoiZoom ) }
        ];

        const magnifyButtonMenuList: SelectedButtonData[] = [
            { name: "magnify2", tip: "Magnify X 2", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.Magnify, 2) },
            { name: "magnify4", tip: "Magnify X 4", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.Magnify, 4) },
            { name: "magnify8", tip: "Magnify X 8", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.Magnify, 8) }
        ];

        const fitButtonMenuList: SelectedButtonData[] = [
            { name: "fitheight", tip: "Fit Height", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.FitHeightSelectedImage) },
            { name: "fitoriginal", tip: "Fit Original", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.FitOriginalSelectedImage) },
            { name: "fitwidth", tip: "Fit Width", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.FitWidthSelectedImage) },
            { name: "fitwindow", tip: "Scale to Fit", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.FitWindowSelectedImage) }
        ];

        const wlButtonMenuList: SelectedButtonData[] = [
            { name: "WL", tip: "W/L", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.Wl) },
            { name: "ROI", tip: "ROI W/L", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.RoiWl) },
            { name: "ManualWL", tip: "Manual W/L", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.ManualWl) },
            { name: "Invert", tip: "Invert", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.InvertSelectedImage) }
        ];

        const keyImageButtonMenu: SelectedButtonData = {
            name: "SetKeyImage", tip: "Key Image", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.ToggleKeyImage)
        };

        const resetButtonMenu: SelectedButtonData = {
            name: "Reset", tip: "Reset", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.Reset)
        };

        const showAnnotationButtonMenu: SelectedButtonData = {
            name: "showannotation", tip: "Show Annotation", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.ShowAnnotation)
        };

        const showOverlayButtonMenu: SelectedButtonData = {
            name: "showoverlay", tip: "Show Overlay", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.ShowOverlay)
        };

        const showRulerButtonMenu: SelectedButtonData = {
            name: "showruler", tip: "Show Ruler", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.ShowRuler)
        };

        const showGraphicOverlayButtonMenu: SelectedButtonData = {
            name: "showgraphicoverlay", tip: "Show Graphic Overlay", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.ShowGraphicOverlay)
        };

        const selectAnnotationButtonMenu: SelectedButtonData = {
            name: "ann_selection", tip: "Select Annotation", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.SelectAnn)
        };

        const simpleAnnotation1ButtonMenu: SelectedButtonData[] = [
            { name: "ann_line", tip: "Line", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.CreateAnn, AnnType.LineExt) },
            { name: "ann_angle", tip: "Angle", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.CreateAnn, AnnType.Protractor) },
            { name: "ann_arrow", tip: "Arrow", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.CreateAnn, AnnType.Arrow) },
            { name: "ann_vaxis", tip: "Vertical Axis", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.CreateAnn, AnnType.Vaxis) },
            { name: "ann_humanmarkspot", tip: "Mark Spot", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.CreateAnn, AnnType.MarkSpot) },
            { name: "ann_freearea", tip: "Free Area", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.CreateAnn, AnnType.FreeArea) },
            { name: "ann_text", tip: "Text", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.CreateAnn, AnnType.Text) }
        ];

        const simpleAnnotation2ButtonMenu: SelectedButtonData[] = [
            { name: "ann_ellipse", tip: "Eclipse", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.CreateAnn, AnnType.Ellipse) },
            { name: "ann_polygon", tip: "Polygon", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.CreateAnn, AnnType.Polygon) },
            { name: "ann_rectangle", tip: "Rectangle", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.CreateAnn, AnnType.Rect) },
            { name: "ann_ruler", tip: "Ruler", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.CreateAnn, AnnType.Ruler) }
        ];

        const extendAnnotation1ButtonMenu: SelectedButtonData[] = [
            { name: "ann_cervicalcurve", tip: "Cervical Curve", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.CreateAnn, AnnType.CervicalCurve) },
            { name: "ann_lumbarcurve", tip: "Lumbar Curve", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.CreateAnn, AnnType.LumbarCurve) }
        ];

        const extendAnnotation2ButtonMenu: SelectedButtonData[] = [
            { name: "ann_heartchestratio", tip: "Cardiothoracic Ratio", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.CreateAnn, AnnType.HeartChestRatio) }
        ];

        const markerButtonMenu: SelectedButtonData = {
            name: "ann_stamp", tip: "Markers", operationData: new ImageOperationData(this.shellId, ImageOperationEnum.SetContext, ImageContextEnum.CreateAnn, AnnType.Stamp)
        };

        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.ListButton, selectPanButtonMenuList));
        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.ListButton, zoomButtonMenuList));
        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.ListButton, magnifyButtonMenuList));
        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.ListButton, wlButtonMenuList));
        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.SingleButton, selectAnnotationButtonMenu));

        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.Divider, undefined));

        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.ListButton, fitButtonMenuList));
        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.ListButton, rotateFlipButtonMenuList));

        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.Divider, undefined));

        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.SingleButton, resetButtonMenu));
        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.SingleButton, keyImageButtonMenu));

        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.Divider, undefined));

        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.SingleButton, markerButtonMenu));
        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.ListButton, simpleAnnotation1ButtonMenu));
        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.ListButton, simpleAnnotation2ButtonMenu));
        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.ListButton, extendAnnotation1ButtonMenu));
        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.ListButton, extendAnnotation2ButtonMenu));

        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.Divider, undefined));

        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.SingleButton, showAnnotationButtonMenu));
        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.SingleButton, showOverlayButtonMenu));
        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.SingleButton, showRulerButtonMenu));
        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.SingleButton, showGraphicOverlayButtonMenu));

        this.toolbarButtonList.push(new ToolbarButtonData(ToolbarButtonTypeEnum.Divider, undefined));
    }

    getButtonDivideSrc(): string {
        return this.buttonDivideSrc;
    }

    getShellId(): string {
        return this.shellId;
    }
}
