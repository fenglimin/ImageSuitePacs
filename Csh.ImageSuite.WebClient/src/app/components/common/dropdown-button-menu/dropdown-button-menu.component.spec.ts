import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DropdownButtonMenuComponent } from "./dropdown-button-menu.component";

describe("DropdownButtonMenuComponent",
    () => {
        let component: DropdownButtonMenuComponent;
        let fixture: ComponentFixture<DropdownButtonMenuComponent>;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                    declarations: [DropdownButtonMenuComponent]
                })
                .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(DropdownButtonMenuComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it("should create",
            () => {
                expect(component).toBeTruthy();
            });
    });
