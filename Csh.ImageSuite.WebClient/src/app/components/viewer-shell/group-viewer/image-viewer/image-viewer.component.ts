import { Component, OnInit, Input, AfterContentInit } from '@angular/core';
import { ImageSelectorService } from '../../../../services/image-selector.service';
import { DicomImageService } from '../../../../services/dicom-image.service';
import { Subscription }   from 'rxjs';
import { Study, Image } from '../../../../models/pssi';
import { ViewerImageData } from '../../../../models/viewer-image-data';
@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.css']
})
export class ImageViewerComponent implements OnInit, AfterContentInit {
  @Input() imageData: ViewerImageData;

  subscriptionImageSelection: Subscription;
  subscriptionImageLayoutChange: Subscription;
  isImageLoading:boolean;
  imageToShow: any;

  constructor(private imageSelectorService: ImageSelectorService, private dicomImageService: DicomImageService) {
    this.subscriptionImageSelection = imageSelectorService.imageSelected$.subscribe(
      imageViewerId => {
        this.doSelectByImageViewerId(imageViewerId);
      });
  }

  ngOnInit() {
    if (this.imageData.image !== null) {
      this.getImageFromService(this.imageData.image);  
    }
  }

  ngAfterContentInit() {    
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

  getImageFromService(image: Image) {

    if (image === null) {
      return;
    }

    this.isImageLoading = true;


    this.dicomImageService.getImage(image).subscribe(data => {
      this.createImageFromBlob(data);
      this.isImageLoading = false;
    }, error => {
      this.isImageLoading = false;
      console.log(error);
    });
  }

  onSelected() {
    this.imageSelectorService.selectImage(this.imageData.getId());
  }

  doSelectById(id: string, selected: boolean): void {
    const o = document.getElementById(id);
    if (o !== undefined && o !== null) {
      o.style.border = selected ? '1px solid green' : '1px solid #555555';
    }
  }

  doSelectByImageViewerId(imageViewerId: string): void {
    var selectedDivId = "DivImageViewer" + imageViewerId;
    var divId = 'DivImageViewer' + this.imageData.getId();

    this.doSelectById(divId, selectedDivId === divId);
  }
}
