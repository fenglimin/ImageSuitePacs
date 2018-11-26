import { Component, OnInit } from '@angular/core';
import { WorklistService } from '../../../services/worklist.service';

@Component({
  selector: 'app-operate-toolbar',
  templateUrl: './operate-toolbar.component.html',
  styleUrls: ['./operate-toolbar.component.css']
})
export class OperateToolbarComponent implements OnInit {

  disableLoadImageButton:boolean;

  constructor(private worklistService: WorklistService) {
    this.disableLoadImageButton = false;
  }

  ngOnInit() {
  }

  onLoadImage() {
    this.worklistService.onShowAllCheckedStudy();
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
