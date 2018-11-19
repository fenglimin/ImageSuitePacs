import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../../services/database.service';

@Component({
  selector: 'app-query-toolbar',
  templateUrl: './query-toolbar.component.html',
  styleUrls: ['./query-toolbar.component.css']
})
export class QueryToolbarComponent implements OnInit {
  showHistoryStudies:boolean;
  constructor(private databaseService: DatabaseService) { }

  ngOnInit() {
  }

  queryStudy() {
    
  }
}
