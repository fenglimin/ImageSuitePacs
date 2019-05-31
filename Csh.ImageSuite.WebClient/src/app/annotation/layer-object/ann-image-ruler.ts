import { Point, AnnGuideStepData, AnnGuideActionButton, AnnGuideData, AnnGuideStepConfig, MouseEventType } from '../../models/annotation';
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnExtendObject } from "../extend-object/ann-extend-object";
import { FontData } from '../../models/misc-data';

export class AnnImageRuler {
    private layerId: string;
    private baseUrl: string;
    private font: FontData;

    private textColor = "#FFF";
    private textFontSize = 17;

    private FONTOFFSET = 5;
    private LINEOFFSET = 1;
    private RULERLINEWIDTH = 2;
    private RULERCELLPERCENT = 0.33;
    private RULERCELLSPACING = 5;
    private RULERUNITLENGTH = 5;
    private TEXTRULERSPACING = 5;

    private linesVertical = [];
    private linesHorizontal = [];

    private baseLineH: any;
    private baseLineV: any;
    private lblHorizontal: any;
    private lblVertical: any;

    constructor(private imageViewer: IImageViewer) {
        
    }

    reDraw(imageViewer) {
        this.layerId = imageViewer.getAnnImageRulerLayerId();
        this.baseUrl = this.imageViewer.getBaseUrl();
        this.font = this.imageViewer.getTextFont();

        let image = imageViewer.getImage();
        let canvas = imageViewer.getCanvas();

        let fontHeight = this.textFontSize;
        let font = "{0}px {1}".format(this.textFontSize, this.font);

        let pixelSpacing = image.getPixelSpacing();

        let lineUnit = '';
        let squareUnit = '';

        let unitPerPixelX, unitPerPixelY;
        let curScale = image.getScaleValue();

        // If pixel spacing is undefined, use 'pt'.
        if (!pixelSpacing) {
            lineUnit = squareUnit = 'pt';

            unitPerPixelX = 1 / curScale;
            unitPerPixelY = 1 / curScale;
        }
        else {
            lineUnit = 'cm';
            squareUnit = 'cm2';

            unitPerPixelX = pixelSpacing.cx / curScale / 10;
            unitPerPixelY = pixelSpacing.cy / curScale / 10;
        }

        let canvasWidth = canvas.width;
        let canvasHeight = canvas.height;

        let strRulerInfo = '';

        this.reset(imageViewer);

        // horizontal ruler
        {
            let unitsToDraw = Math.round(unitPerPixelX * this.RULERCELLPERCENT * canvasWidth);

            if (unitsToDraw == 0) {
                unitsToDraw = 1;
            }

            strRulerInfo = unitsToDraw + lineUnit;

            let hRulerStartX = Math.round((canvasWidth - unitsToDraw / unitPerPixelX) / 2);

            if (!pixelSpacing) {
                let lineStart = Math.round(hRulerStartX);
                let lineStop = Math.round(hRulerStartX + unitsToDraw / unitPerPixelX);

                let line = jCanvaScript.line([
                    [lineStart + this.LINEOFFSET, canvasHeight - this.RULERCELLSPACING - this.RULERUNITLENGTH + this.LINEOFFSET],
                    [lineStart + this.LINEOFFSET, canvasHeight - this.RULERCELLSPACING + this.LINEOFFSET]
                ]).layer(this.layerId).color(this.textColor);
                this.linesHorizontal.push(line);

                let pt1 = [lineStart + this.LINEOFFSET, canvasHeight - this.RULERCELLSPACING + this.LINEOFFSET];
                let pt2 = [lineStop + this.LINEOFFSET, canvasHeight - this.RULERCELLSPACING + this.LINEOFFSET];

                if (!this.baseLineH) {
                    this.baseLineH = jCanvaScript.line([pt1, pt2]).layer(this.layerId).color(this.textColor);
                } else {
                    this.baseLineH.points([pt1, pt2]);
                }

                line = jCanvaScript.line([
                    [lineStop + this.LINEOFFSET, canvasHeight - this.RULERCELLSPACING + this.LINEOFFSET],
                    [lineStop + this.LINEOFFSET, canvasHeight - this.RULERCELLSPACING - this.RULERUNITLENGTH + this.LINEOFFSET]
                ]).layer(this.layerId).color(this.textColor);
                this.linesHorizontal.push(line);
            }
            else {
                let unitStart;

                for (let i = 0; i < unitsToDraw; i++) {
                    unitStart = Math.round(hRulerStartX + i / unitPerPixelX);

                    let line = jCanvaScript.line([
                        [unitStart + this.LINEOFFSET, canvasHeight - this.RULERCELLSPACING - this.RULERUNITLENGTH + this.LINEOFFSET],
                        [unitStart + this.LINEOFFSET, canvasHeight - this.RULERCELLSPACING + this.LINEOFFSET]
                    ]).layer(this.layerId).color(this.textColor);
                    this.linesHorizontal.push(line);

                    line = jCanvaScript.line([
                        [unitStart + this.LINEOFFSET, canvasHeight - this.RULERCELLSPACING + this.LINEOFFSET],
                        [Math.round(unitStart + this.LINEOFFSET + 1 / unitPerPixelX), canvasHeight - this.RULERCELLSPACING + this.LINEOFFSET]
                    ]).layer(this.layerId).color(this.textColor);
                    this.linesHorizontal.push(line);
                }

                let pt1 = [Math.round(unitStart + this.LINEOFFSET + 1 / unitPerPixelX), canvasHeight - this.RULERCELLSPACING + this.LINEOFFSET];
                let pt2 = [Math.round(hRulerStartX + unitsToDraw / unitPerPixelX + this.LINEOFFSET), canvasHeight - this.RULERCELLSPACING - this.RULERUNITLENGTH + this.LINEOFFSET];
                if (!this.baseLineH) {
                    this.baseLineH = jCanvaScript.line([pt1, pt2]).layer(this.layerId).color(this.textColor);
                } else {
                    this.baseLineH.points([pt1, pt2]);
                }
            }

            let ptTextX = Math.round(hRulerStartX + unitsToDraw / unitPerPixelX + this.FONTOFFSET);
            let ptTextY = canvasHeight - this.RULERCELLSPACING;

            if (!this.lblHorizontal) {
                this.lblHorizontal = jCanvaScript.text(strRulerInfo, ptTextX, ptTextY).layer(this.layerId).color(this.textColor).font(font).align('left');
            } else {
                this.lblHorizontal._x = ptTextX;
                this.lblHorizontal._y = ptTextY;
                this.lblHorizontal.string(strRulerInfo);
            }
        }

        // vertical ruler
        {
            let iUnitsToDraw = Math.round(unitPerPixelY * this.RULERCELLPERCENT * canvasHeight);
            if (iUnitsToDraw == 0) {
                iUnitsToDraw = 1;
            }

            strRulerInfo = iUnitsToDraw + lineUnit;

            let iRulerStartY = Math.round((canvasHeight - iUnitsToDraw / unitPerPixelY) / 2);
            if (!pixelSpacing) {
                let iLineStart = Math.round(iRulerStartY);
                let iLineStop = Math.round(iRulerStartY + iUnitsToDraw / unitPerPixelY);

                let line = jc.line([
                    [canvasWidth - this.TEXTRULERSPACING - this.RULERUNITLENGTH + this.LINEOFFSET, iLineStart + this.LINEOFFSET],
                    [canvasWidth - this.TEXTRULERSPACING + this.LINEOFFSET, iLineStart + this.LINEOFFSET]
                ]).layer(this.layerId).color(this.textColor);
                this.linesVertical.push(line);

                let pt1 = [canvasWidth - this.TEXTRULERSPACING + this.LINEOFFSET, iLineStart + this.LINEOFFSET];
                let pt2 = [canvasWidth - this.TEXTRULERSPACING + this.LINEOFFSET, iLineStop + this.LINEOFFSET];

                if (!this.baseLineV) {
                    this.baseLineV = jc.line([pt1, pt2]).layer(this.layerId).color(this.textColor);
                } else {
                    this.baseLineV.points([pt1, pt2]);
                }

                line = jc.line([
                    [canvasWidth - this.TEXTRULERSPACING + this.LINEOFFSET, iLineStop + this.LINEOFFSET],
                    [canvasWidth - this.TEXTRULERSPACING - this.RULERUNITLENGTH + this.LINEOFFSET, iLineStop + this.LINEOFFSET]
                ]).layer(this.layerId).color(this.textColor);
                this.linesVertical.push(line);
            }
            else {
                let iUnitStart;
                for (let i = 0; i < iUnitsToDraw; i++) {
                    iUnitStart = Math.round(iRulerStartY + i / unitPerPixelY);

                    let line = jc.line([
                        [canvasWidth - this.TEXTRULERSPACING - this.RULERUNITLENGTH + this.LINEOFFSET, iUnitStart + this.LINEOFFSET],
                        [canvasWidth - this.TEXTRULERSPACING + this.LINEOFFSET, iUnitStart + this.LINEOFFSET]
                    ]).layer(this.layerId).color(this.textColor);
                    this.linesVertical.push(line);

                    line = jc.line([
                        [canvasWidth - this.TEXTRULERSPACING + this.LINEOFFSET, iUnitStart + this.LINEOFFSET],
                        [canvasWidth - this.TEXTRULERSPACING + this.LINEOFFSET, Math.round(iUnitStart + this.LINEOFFSET + 1 / unitPerPixelY)]
                    ]).layer(this.layerId).color(this.textColor);
                    this.linesVertical.push(line);
                }

                let pt1 = [canvasWidth - this.TEXTRULERSPACING + this.LINEOFFSET, Math.round(iUnitStart + this.LINEOFFSET + 1 / unitPerPixelY)];
                let pt2 = [canvasWidth - this.TEXTRULERSPACING - this.RULERUNITLENGTH + this.LINEOFFSET, Math.round(iRulerStartY + iUnitsToDraw / unitPerPixelY + this.LINEOFFSET)];
                if (!this.baseLineV) {
                    this.baseLineV = jc.line([pt1, pt2]).layer(this.layerId).color(this.textColor);
                } else {
                    this.baseLineV.points([pt1, pt2]);
                }
            }

            let ptTextX = canvasWidth - this.RULERCELLSPACING - strRulerInfo.length * fontHeight / 2;
            let ptTextY = Math.round(iRulerStartY + iUnitsToDraw / unitPerPixelY + 2 * this.FONTOFFSET + this.TEXTRULERSPACING);

            if (!this.lblVertical) {
                this.lblVertical = jc.text(strRulerInfo, ptTextX, ptTextY).layer(this.layerId).color(this.textColor).font(font).align('left');
            } else {
                this.lblVertical._x = ptTextX;
                this.lblVertical._y = ptTextY;
                this.lblVertical.string(strRulerInfo);
            }
        }
    }

    reset(imageViewer) {
        let annImageRuler = imageViewer.annImageRuler;

        if (!annImageRuler)
            return;

        if (annImageRuler.lblHorizontal) {
            annImageRuler.lblHorizontal.del();
            annImageRuler.lblHorizontal = undefined;
        }
        if (annImageRuler.lblVertical) {
            annImageRuler.lblVertical.del();
            annImageRuler.lblVertical = undefined;
        }

        if (annImageRuler.baseLineH) {
            annImageRuler.baseLineH.del();
            annImageRuler.baseLineH = undefined;
        }
        if (annImageRuler.baseLineV) {
            annImageRuler.baseLineV.del();
            annImageRuler.baseLineV = undefined;
        }

        if (annImageRuler.linesVertical) {
            annImageRuler.linesVertical.forEach(line => line.del());
            annImageRuler.linesVertical = [];
        }

        if (annImageRuler.linesHorizontal) {
            annImageRuler.linesHorizontal.forEach(line => line.del());
            annImageRuler.linesHorizontal = [];
        }
    }
}