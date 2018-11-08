import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentFactory, ComponentRef } from '@angular/core';

import { WorklistShellComponent } from './components/worklist-shell/worklist-shell.component'
import { ViewerShellComponent } from './components/viewer-shell/viewer-shell.component'

import { ShellNavigatorService } from './services/shell-navigator.service';
import { Subscription }   from 'rxjs';

import { OpenedViewerShell } from './models/openedViewerShell';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'AngularPacsDemo';
  @ViewChild("shellContainer", { read: ViewContainerRef }) container;
  createComponents: Array<any> = [];

  subscriptionShellCreated: Subscription;
  subscriptionShellDeleted: Subscription;

  constructor(private resolver: ComponentFactoryResolver, private shellNavigatorService: ShellNavigatorService) {
    this.subscriptionShellCreated = shellNavigatorService.shellCreated$.subscribe(
      openedViewerShell => {
        this.createViewerShell(openedViewerShell);
      });


    this.subscriptionShellDeleted = shellNavigatorService.shellDeleted$.subscribe(
      openedViewerShell => {
        this.deleteViewerShell(openedViewerShell);
      }
    );
  }

  ngOnInit() {
    this.createWorklistShell();
  }

  createWorklistShell() {
    let componentFactory = this.resolver.resolveComponentFactory(WorklistShellComponent);
    let componentRef = this.container.createComponent(componentFactory);
    componentRef.instance.hideMe = false;
  }

  createViewerShell(openedViewerShell: OpenedViewerShell) {
    let componentFactory = this.resolver.resolveComponentFactory(ViewerShellComponent);
    let componentRef = this.container.createComponent(componentFactory);
    componentRef.instance.hideMe = false;
    componentRef.instance.openedViewerShell = openedViewerShell;

    this.createComponents.push(componentRef);
  }

  deleteViewerShell(openedViewerShell: OpenedViewerShell) {
    const studyCom = this.createComponents.filter((value, index, array) => value.instance.openedViewerShell.getId() === openedViewerShell.getId());
    if (studyCom.length !== 0) {
      studyCom[0].destroy();
    }

    this.createComponents = this.createComponents.filter((value, index, array) => value.instance.openedViewerShell.getId() !== openedViewerShell.getId());
  }
}
