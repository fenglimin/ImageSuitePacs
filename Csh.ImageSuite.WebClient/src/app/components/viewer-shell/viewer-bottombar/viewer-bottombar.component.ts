import { Component, OnInit, EventEmitter, Output, Input} from '@angular/core';

@Component({
  selector: 'app-viewer-bottombar',
  templateUrl: './viewer-bottombar.component.html',
  styleUrls: ['./viewer-bottombar.component.css']
})
export class ViewerBottombarComponent implements OnInit {

    @Output()
    save = new EventEmitter<number>();


    @Output()
    navigateGroup = new EventEmitter<number>();
    

    @Input()
    pageIndex = 0;

    @Input()
    pageCount: number;

    disablePrev = true;
    disableNext = true;

    
    constructor() { }

    ngOnInit() {
    }

    onSaveImage() {
        this.save.emit(0);
    }

    onNavigateGroup(delta: number) {
        this.navigateGroup.emit(delta);
    }

    getGroupStatus(): string {
        this.disablePrev = this.pageIndex === 0;
        this.disableNext = this.pageIndex === this.pageCount - 1;

        return `${this.pageIndex + 1}/${this.pageCount}`; 
    }
}
