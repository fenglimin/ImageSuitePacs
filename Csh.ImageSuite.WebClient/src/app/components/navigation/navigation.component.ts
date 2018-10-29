import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
    thumbnails = [];
        
    imageSopSelected: string;
    constructor() {
      for (var i = 0; i < 2; i ++)
        for (var j = 0; j < 3; j ++)
          for (var m = 0; m < 2; m ++)
            for (var n = 0; n < 2; n ++) {
              var item = "";
              item = item + i + j + m + n;
              this.thumbnails.push(item);
            }

    }

  ngOnInit() {
  }

}
