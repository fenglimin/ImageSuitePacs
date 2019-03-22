import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { QueryShortcutComponent } from "./query-shortcut.component";

describe("QueryShortcutComponent",
    () => {
        let component: QueryShortcutComponent;
        let fixture: ComponentFixture<QueryShortcutComponent>;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                    declarations: [QueryShortcutComponent]
                })
                .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(QueryShortcutComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it("should create",
            () => {
                expect(component).toBeTruthy();
            });
    });
