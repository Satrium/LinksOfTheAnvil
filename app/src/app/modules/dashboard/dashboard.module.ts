import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './page/dashboard.component';
import { Routes, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { SharedModule } from '@shared/shared.module';
import { ShareGraphComponent } from './share-graph/share-graph.component';
import { MatDialogModule } from '@angular/material/dialog';
import {MatStepperModule} from '@angular/material/stepper';
import { GraphModule } from '@modules/graph/graph.module';


const routes: Routes = [
  {path:'', component:DashboardComponent}
];


@NgModule({
  declarations: [DashboardComponent, ShareGraphComponent],
  imports: [
    CommonModule,
    SharedModule,
    MatTableModule,
    MatDialogModule,
    MatStepperModule,
    GraphModule,
    RouterModule.forChild(routes)
  ], entryComponents:[ShareGraphComponent]
})
export class DashboardModule { }
