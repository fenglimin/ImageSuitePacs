import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DropdownButtonMenuButtonComponent } from "./dropdown-button-menu-button.component";

describe("DropdownButtonMenuButtonComponent",
    () => {
        let component: DropdownButtonMenuButtonComponent;
        let fixture: ComponentFixture<DropdownButtonMenuButtonComponent>;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                    declarations: [DropdownButtonMenuButtonComponent]
                })
                .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(DropdownButtonMenuButtonComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it("should create",
            () => {
                expect(component).toBeTruthy();
            });
    });
