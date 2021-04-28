import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './page/dashboard.component';
import { Routes, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { SharedModule } from '@shared/shared.module';


const routes: Routes = [
  {path:'', component:DashboardComponent}
];


@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    SharedModule,
    MatTableModule,
    RouterModule.forChild(routes)
  ]
})
export class DashboardModule { }
