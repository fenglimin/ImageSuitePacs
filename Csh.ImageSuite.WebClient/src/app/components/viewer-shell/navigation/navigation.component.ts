import { Component, OnInit, Input } from '@angular/core';
import { ViewerShellData } from '../../../models/viewer-shell-data';
import { Patient, Study, Series, Image, Pssi } from '../../../models/pssi';
@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  @Input() viewerShellData: ViewerShellData;

  ngOnInit() {
  }

  onClickPssi(pssi: Pssi) {
    const hide = !pssi.hide;
    pssi.setHide(hide);
  }

  getPssiVisibility(pssi: Pssi) {
    return pssi.hide ? 'hidden' : 'visible';
  }

  getPssiHeight(pssi: Pssi) {
    return pssi.hide ? '0px' : '100%';
  }

}

