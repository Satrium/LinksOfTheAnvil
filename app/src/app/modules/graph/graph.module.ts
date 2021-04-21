import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphComponent } from './graph/graph.component';
import { GraphSidebarDirective } from './graph/sidebar.directive';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    GraphComponent,
    GraphSidebarDirective
  ],
  imports: [
    CommonModule,
    SharedModule
  ],exports: [
    GraphComponent,
    GraphSidebarDirective
  ]
})
export class GraphModule { }
