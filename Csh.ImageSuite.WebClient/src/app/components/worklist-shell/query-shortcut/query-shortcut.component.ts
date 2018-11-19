import { Component, OnInit, EventEmitter, Output } from '@angular/core';

import { Shortcut } from '../../../models/shortcut';
import { Patient } from '../../../models/pssi';
import { DatabaseService } from '../../../services/database.service';

@Component({
  selector: 'app-query-shortcut',
  templateUrl: './query-shortcut.component.html',
  styleUrls: ['./query-shortcut.component.css']
})
export class QueryShortcutComponent implements OnInit {

  @Output() selected = new EventEmitter<Shortcut>();
  allShortcuts: Shortcut[];

  constructor(private databaseService: DatabaseService) {
    
  }

  ngOnInit() {
    this.databaseService.getShortcuts().subscribe(shortcuts => this.allShortcuts = shortcuts);
   // this.databaseService.getShortcut(2).subscribe(shortcut => {
   //   this.allShortcuts[2].name = shortcut.name;
   // });
  }

  doQuery(shortcut: Shortcut): void {
    this.selected.emit(shortcut);
    
    //this.databaseService.getPatients().subscribe(patients => this.patients = patients.slice(1, 5));
  }

  queryAllStudy(): void {
    alert('query all');
  }

  deleteShortcut(): void {
    
  }
}
