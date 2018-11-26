import { Component, OnInit, Input } from '@angular/core';
import { ImageSelectorService } from '../../../../services/image-selector.service';
import { DicomImageService } from '../../../../services/dicom-image.service';
import { Subscription }   from 'rxjs';
import { Image } from '../../../../models/pssi';

@Component({
  selector: 'app-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.css']
})
export class ThumbnailComponent implements OnInit {

  thumbnailToShow: any;
  isImageLoading:boolean;

    subscription: Subscription;

  _image: Image;
  @Input()
  set image(Image: Image) {
    if (this._image !== Image) {
      this._image = Image;
      this.refreshImage();
    }
  }
  get image() {
    return this._image;
  }

    constructor(private imageSelectorService: ImageSelectorService, private dicomImageService: DicomImageService) {
        this.subscription = imageSelectorService.imageSelected$.subscribe(
            imageSopSelected => {
                //this.setSelectState(this.imageSop === imageSopSelected);
            });
    }


  ngOnInit() {
  }

  /*
  setSelectState(selected: boolean): void {
      var o = document.getElementById("thumbnail" + this.imageSop);
      if (o !== null) {
          o.style.color = selected ? 'red' : 'white';
      }
  }

  onClick() {
      this.setSelectState(true);
      this.imageSelectorService.selectImage(this.imageSop);
  }
  */

  refreshImage() {
    if (this._image !== null) {
      this.getImageFromService(this._image);  
    }  
  }

  createImageFromBlob(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
      this.thumbnailToShow = reader.result;
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


    this.dicomImageService.getThumbnailFile(image).subscribe(data => {
      this.createImageFromBlob(data);
      this.isImageLoading = false;
    }, error => {
      this.isImageLoading = false;
      console.log(error);
    });
  }

}
