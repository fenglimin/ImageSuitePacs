import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-viewer-bottombar',
  templateUrl: './viewer-bottombar.component.html',
  styleUrls: ['./viewer-bottombar.component.css']
})
export class ViewerBottombarComponent implements OnInit {

    @Output()
    save = new EventEmitter<number>();

    constructor() { }

    ngOnInit() {
    }

    onSaveImage() {
        this.save.emit(0);
    }
}
