import { Component, OnInit, Input, AfterContentInit } from '@angular/core';
import { Layout, ImageLayout, LayoutPosition, LayoutMatrix } from '../../models/layout';
import { ImageSelectorService } from '../../services/image-selector.service';
import { DicomImageService } from '../../services/dicom-image.service';
import { Subscription }   from 'rxjs';
import { Study, Image } from '../../models/pssi';
import { OpenedViewerShell } from '../../models/opened-viewer-shell';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.css']
})
export class ImageViewerComponent implements OnInit, AfterContentInit {
  @Input() imageLayout: ImageLayout;
  @Input() openedViewerShell: OpenedViewerShell;
  id: string = "";
  subscriptionImageSelection: Subscription;
  subscriptionSubLayoutChange: Subscription;
  isImageLoading:boolean;
  imageToShow: any;

  constructor(private imageSelectorService: ImageSelectorService, private dicomImageService: DicomImageService) {
    this.subscriptionImageSelection = imageSelectorService.imageSelected$.subscribe(
      imageViewerId => {
        this.doSelectByImageViewerId(imageViewerId);
      });
  }

  ngOnInit() {
    this.getImageFromService();
  }

  ngAfterContentInit() {
    this.id = this.generateId();
    
  }

  createImageFromBlob(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
      this.imageToShow = reader.result;
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  getImageFromService() {
    this.isImageLoading = true;
    let image = new Image();
    image.id = 1;

    this.dicomImageService.getImage(image).subscribe(data => {
      this.createImageFromBlob(data);
      this.isImageLoading = false;
    }, error => {
      this.isImageLoading = false;
      console.log(error);
    });
  }

  onSelected() {
    this.imageSelectorService.selectImage(this.id);
  }

  doSelectById(id: string, selected: boolean): void {
    const o = document.getElementById(id);
    if (o !== undefined && o !== null) {
      o.style.border = selected ? '1px solid green' : '1px solid #555555';
    }
  }

  doSelectByImageViewerId(imageViewerId: string): void {
    var selectedDivId = "DivImageViewer" + imageViewerId;
    var divId = 'DivImageViewer' + this.id;

    this.doSelectById(divId, selectedDivId === divId);
  }

  generateId(): string {
    return '_' + this.openedViewerShell.getId() + '_' + this.imageLayout.getId();
  }
}
