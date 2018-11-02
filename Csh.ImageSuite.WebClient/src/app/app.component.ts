import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentFactory, ComponentRef } from '@angular/core';

import { WorklistShellComponent } from './components/worklist-shell/worklist-shell.component'
import { ViewerShellComponent } from './components/viewer-shell/viewer-shell.component'


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'AngularPacsDemo';
  @ViewChild("shellContainer", { read: ViewContainerRef }) container;

  constructor(private resolver: ComponentFactoryResolver) {}

  ngOnInit() {
    this.createComponent(WorklistShellComponent, false);
  }

  createComponent(comType, hide) {
    //this.container.clear(); 
    let componentFactory = this.resolver.resolveComponentFactory(comType);
    let componentRef = this.container.createComponent(componentFactory);
    componentRef.instance.hideMe = hide;
  }
}
