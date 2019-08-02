import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from "rxjs";

import { ViewerShellData } from "../../../models/viewer-shell-data";
import { ViewerImageData } from "../../../models/viewer-image-data";
import { ImageOperationData, ImageOperationEnum, ImageContextData, ImageContextEnum } from "../../../models/image-operation";
import { ImageOperationService } from "../../../services/image-operation.service";

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})
export class VideoPlayerComponent implements OnInit {
    @Input()
    viewerShellData: ViewerShellData;

    disablePrev = true;
    disablePlay = false;
    disablePause = true;
    disableStop = true;
    disableNext = false;

    visible = false;
    playing = false;

    private subscriptionImageOperation: Subscription;
    private viewerImageData: ViewerImageData;

    index = 0;
    count = 1;

    constructor(private imageOperationService: ImageOperationService) {
        this.subscriptionImageOperation = imageOperationService.imageOperation$.subscribe(
            imageOperationData => {
                this.onImageOperation(imageOperationData);
            });
    }

    ngOnInit() {
    }

    onNavigateImage(up: boolean) {
        if (this.visible) {
            
            this.viewerImageData.image.series.modality === "US"
                ? this.imageOperationService.onNavigateFramesInClickedImage(this.viewerImageData, up)
                : this.imageOperationService.onNavigateImageInGroup(this.viewerImageData, up);
        }
    }

    onPlay() {
        this.playing = true;
        this.playVideo();
    }

    onPause() {
        this.playing = false;
        this.setButtonStatus();
    }

    onStop() {
        this.playing = false;
        this.onDisplayImage(0);
    }

    getPlayStatus(): string {
        return `${this.index + 1}/${this.count}`; 
    }

    sliderChanged(value: any) {
        const index = Number(value.currentTarget.value) - 1;
        this.onDisplayImage(index);
    }

    private onImageOperation(imageOperationData: ImageOperationData) {
        if (!imageOperationData.needResponse(this.viewerShellData.getId(), true))
            return;

        switch (imageOperationData.operationType) {
            case ImageOperationEnum.ClickImageInViewer:
                this.onClickImageInViewer(imageOperationData.operationPara);
                break;

            case ImageOperationEnum.DisplayImageInGroup:
            case ImageOperationEnum.DisplayFramesInClickedImage:
                this.index = imageOperationData.operationPara.index;
                this.setButtonStatus();
                break;
        }
    }

    private onClickImageInViewer(viewerImageData: ViewerImageData) {
        this.viewerImageData = viewerImageData;

        const modality = viewerImageData.image.series.modality;
        if ( modality === "US") {
            this.visible = true;
            this.index = this.viewerImageData.image.frameIndex;
            this.count = this.viewerImageData.image.frameCount;
        } else if (modality === "CT") {
            const matrix = viewerImageData.groupData.imageMatrix;
            this.visible = matrix.rowCount === 1 && matrix.colCount === 1 && viewerImageData.groupData.imageCount > 1;
            if (this.visible) {
                this.index = this.viewerImageData.groupData.pageIndex;
                this.count = this.viewerImageData.groupData.pageCount;
            }
        } else {
            this.visible = false;
        }
    }

    private playVideo() {
        if (this.playing && this.index < this.count - 1) {
            this.onNavigateImage(false);
            setTimeout(() => { this.playVideo(); }, 100);
        }
    }

    private onDisplayImage(index: number) {
        if (this.visible) {
            this.viewerImageData.image.series.modality === "US"
                ? this.imageOperationService.onDisplayFramesInClickedImage(this.viewerImageData, index)
                : this.imageOperationService.onDisplayImageInGroup(this.viewerImageData, index);
        }
    }

    private setButtonStatus() {
        this.disablePrev = this.index === 0;
        this.disableNext = this.index === this.count - 1;
        this.disablePlay = this.playing;
        this.disableStop = !this.playing;
        this.disablePause = !this.playing;
    }
}
