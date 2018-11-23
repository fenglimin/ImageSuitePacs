import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule }    from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

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
import { QueryToolbarComponent } from './components/worklist-shell/query-toolbar/query-toolbar.component';
import { OperateToolbarComponent } from './components/worklist-shell/operate-toolbar/operate-toolbar.component';
import { MessageBoxComponent } from './components/common/message-box/message-box.component';

import {
  MatDatepickerModule,
  MatDialogModule,
  MatInputModule, MatListModule, MatPaginatorModule, MatProgressSpinnerModule, MatSelectModule, MatSidenavModule,
  MatSortModule,
  MatTableModule,
  MatToolbarModule
  } from "@angular/material";

import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button'
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatTabsModule} from '@angular/material/tabs';

import {ReactiveFormsModule} from "@angular/forms";
import {MatMomentDateModule} from "@angular/material-moment-adapter";

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
    ImageViewerComponent,
    QueryToolbarComponent,
    OperateToolbarComponent,
    MessageBoxComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,

    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatMomentDateModule

  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [MessageBoxComponent]
})
export class AppModule { }
