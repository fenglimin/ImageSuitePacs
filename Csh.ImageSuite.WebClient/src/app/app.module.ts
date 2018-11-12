import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule }    from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HeaderBarComponent } from './components/header-bar/header-bar.component';

import { WorklistShellComponent } from './components/worklist-shell/worklist-shell.component';
import { QueryShortcutComponent } from './components/worklist-shell/query-shortcut/query-shortcut.component';
import { WorklistComponent } from './components/worklist-shell/worklist/worklist.component';

import { ViewerShellComponent } from './components/viewer-shell/viewer-shell.component';
import { ViewerToolbarComponent } from './components/viewer-shell/viewer-toolbar/viewer-toolbar.component';
import { NavigationComponent } from './components/viewer-shell/navigation/navigation.component';
import { ThumbnailComponent } from './components/viewer-shell/navigation/thumbnail/thumbnail.component';
import { GroupViewerComponent } from './components/viewer-shell/group-viewer/group-viewer.component';
import { ImageViewerComponent } from './components/viewer-shell/group-viewer/image-viewer/image-viewer.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderBarComponent,
    QueryShortcutComponent,
    WorklistComponent,
    WorklistShellComponent,
    NavigationComponent,
    ViewerShellComponent,
    ViewerToolbarComponent,
    ThumbnailComponent,
    GroupViewerComponent,
    ImageViewerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
