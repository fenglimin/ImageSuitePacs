import { Component, OnInit, Input } from '@angular/core';
import { ViewerShellData } from '../../../models/viewer-shell-data';
import { Patient, Study, Series, Image, Pssi } from '../../../models/pssi';
@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  Arr = Array; //Array type captured in a variable
  @Input() viewerShellData: ViewerShellData;

  ngOnInit() {
  }

  onClickPssi(pssi: Pssi) {
    const hide = !pssi.hide;
    pssi.setHide(hide);
  }

  getPssiVisibility(pssi: Pssi) {
    return (pssi.hide || this.viewerShellData.hide)? 'hidden' : 'visible';
  }

  getPssiHeight(pssi: Pssi) {
    return (pssi.hide || this.viewerShellData.hide)? '0px' : '100%';
  }

  getThumbnailListRowCount(series: Series): number {
    const count = Math.trunc((series.imageList.length+1)/2);
    return count;
  }
}

