import { Component, OnInit } from "@angular/core";
import { ShellNavigatorService } from "../../services/shell-navigator.service";
import { Subscription } from "rxjs";

@Component({
    selector: "app-worklist-shell",
    templateUrl: "./worklist-shell.component.html",
    styleUrls: ["./worklist-shell.component.less"]
})
export class WorklistShellComponent implements OnInit {
    subscriptionShellNavigated: Subscription;
    hideMe = false;

    constructor(private shellNavigatorService: ShellNavigatorService) {
        this.subscriptionShellNavigated = shellNavigatorService.shellSelected$.subscribe(
            viewerShellData => {
                this.hideMe = viewerShellData !== null;
            });
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        $(".sp_panel-left").spResizable({
            handleSelector: ".sp_splitter",
            resizeHeight: false
        });
    }
}
