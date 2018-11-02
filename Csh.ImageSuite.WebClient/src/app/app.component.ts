import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentFactory, ComponentRef } from '@angular/core';

import { WorklistShellComponent } from './components/worklist-shell/worklist-shell.component'
import { ViewerShellComponent } from './components/viewer-shell/viewer-shell.component'

import { ShellNavigatorService } from './services/shell-navigator.service';
import { Subscription }   from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'AngularPacsDemo';
  @ViewChild("shellContainer", { read: ViewContainerRef }) container;

  subscriptionShellCreated: Subscription;

  constructor(private resolver: ComponentFactoryResolver, private shellNavigatorService: ShellNavigatorService) {
    this.subscriptionShellCreated = shellNavigatorService.shellCreated$.subscribe(
      studyUid => {
        this.createComponent(ViewerShellComponent, studyUid, false);
      });
  }

  ngOnInit() {
    this.createComponent(WorklistShellComponent, '', false);
  }

  createComponent(comType, studyUid, hide) {
    //this.container.clear(); 
    let componentFactory = this.resolver.resolveComponentFactory(comType);
    let componentRef = this.container.createComponent(componentFactory);
    componentRef.instance.hideMe = hide;
    componentRef.instance.studyUid = studyUid;
  }
}
