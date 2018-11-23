import { Component, OnInit } from '@angular/core';
import { WorklistService } from '../../../services/worklist.service';
import { DataSource } from '../../../models/shortcut';


@Component({
  selector: 'app-query-toolbar',
  templateUrl: './query-toolbar.component.html',
  styleUrls: ['./query-toolbar.component.css']
})
export class QueryToolbarComponent implements OnInit {

  constructor(private worklistService: WorklistService) { }

  ngOnInit() {
  }

  onChangeDataSource(event) {
    this.worklistService.setDataSource(event.target.checked? DataSource.LocalTestData : DataSource.MiniPacs);
  }

  onQuery() {
    this.worklistService.onQueryStudies();
  }

  onClearCondition() {
    this.worklistService.onCleanCondition();
  }
}
