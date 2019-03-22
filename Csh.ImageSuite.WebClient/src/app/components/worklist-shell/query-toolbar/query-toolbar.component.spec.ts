import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { QueryToolbarComponent } from "./query-toolbar.component";

describe("QueryToolbarComponent",
    () => {
        let component: QueryToolbarComponent;
        let fixture: ComponentFixture<QueryToolbarComponent>;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                    declarations: [QueryToolbarComponent]
                })
                .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(QueryToolbarComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it("should create",
            () => {
                expect(component).toBeTruthy();
            });
    });
