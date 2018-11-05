import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentFactory, ComponentRef } from '@angular/core';

import { WorklistShellComponent } from './components/worklist-shell/worklist-shell.component'
import { ViewerShellComponent } from './components/viewer-shell/viewer-shell.component'

import { ShellNavigatorService } from './services/shell-navigator.service';
import { Subscription }   from 'rxjs';

import { Study } from './models/pssi';

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
      study => {
        this.createComponent(ViewerShellComponent, study, false);
      });


    this.subscriptionShellDeleted = shellNavigatorService.shellDeleted$.subscribe(
      study => {
        this.deleteComponent(study);
      }
    );
  }

  ngOnInit() {
    this.createComponent(WorklistShellComponent, null, false);
  }

  createComponent(comType, study, hide) {
    //this.container.clear(); 
    let componentFactory = this.resolver.resolveComponentFactory(comType);
    let componentRef = this.container.createComponent(componentFactory);
    componentRef.instance.hideMe = hide;
    componentRef.instance.study = study;

    if (comType === ViewerShellComponent) {
      this.createComponents.push(componentRef);
    }
  }

  deleteComponent(study) {
    let a = this.createComponents.filter((value, index, array) => value.instance.study.studyInstanceUid === study.studyInstanceUid);
    if (a.length != 0) {
      a[0].destroy();
    }

    this.createComponents = this.createComponents.filter((value, index, array) => value.instance.study.studyInstanceUid !== study.studyInstanceUid);
  }
}
