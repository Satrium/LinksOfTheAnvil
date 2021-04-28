import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareComponent } from './page/share/share.component';
import { RouterModule, Routes } from '@angular/router';
import { GraphModule } from '@modules/graph/graph.module';

const routes: Routes = [
  {path:':id', component:ShareComponent}
];


@NgModule({
  declarations: [ShareComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    GraphModule
  ]
})
export class ShareModule { }
