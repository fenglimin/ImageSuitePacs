import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-operate-toolbar',
  templateUrl: './operate-toolbar.component.html',
  styleUrls: ['./operate-toolbar.component.css']
})
export class OperateToolbarComponent implements OnInit {

  disableLoadImageButton:boolean;

  constructor() {
    this.disableLoadImageButton = false;
  }

  ngOnInit() {
  }

  onLoadImage() {

  }

  onLoadKeyImage() {

  }

  onSetRead() {

  }

  onSetUnread() {

  }

  onChangeImageSeriesOrder() {

  }

  onReassign() {

  }

  onTransfer() {

  }

  onTagEdit() {

  }

  onDeletePrevent() {

  }

  onDeleteAllow() {

  }

  onDelete() {

  }

  onImport() {
    
  }
}
