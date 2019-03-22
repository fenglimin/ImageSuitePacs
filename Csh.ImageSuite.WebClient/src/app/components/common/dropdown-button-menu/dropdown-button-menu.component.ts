import { Component, OnInit, Input } from "@angular/core";
import { SelectedButtonData } from "../../../models/dropdown-button-menu-data";
import { ViewContextService } from "../../../services/view-context.service";

@Component({
    selector: "app-dropdown-button-menu",
    templateUrl: "./dropdown-button-menu.component.html",
    styleUrls: ["./dropdown-button-menu.component.css"]
})
export class DropdownButtonMenuComponent implements OnInit {
    selectedButton: SelectedButtonData;
    @Input()
    menuButtonList: SelectedButtonData[];

    constructor(private viewContext: ViewContextService) {
    }

    ngOnInit() {
        this.selectedButton = this.menuButtonList[0];

        const $dropdownLi = $("li.dropdown");

        $dropdownLi.mouseover(function() {
            $(this).addClass("open");
        }).mouseout(function() {
            $(this).removeClass("open");
        }).click(function() {
            $(this).addClass("open");
        });
    }

    onSelectChanged(menuButton: SelectedButtonData) {
        this.selectedButton = menuButton;
    }
}
