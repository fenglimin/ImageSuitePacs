import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { WorklistShellComponent } from "./components/worklist-shell/worklist-shell.component";
import { ViewerShellComponent } from "./components/viewer-shell/viewer-shell.component";

const routes: Routes = [
    { path: "", redirectTo: "/worklist", pathMatch: "full" },
    { path: "worklist", component: WorklistShellComponent },
    { path: "viewer", component: ViewerShellComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
