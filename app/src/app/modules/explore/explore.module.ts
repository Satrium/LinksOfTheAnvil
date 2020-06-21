import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreComponent } from './explore/explore.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { GraphModule } from '@modules/graph/graph.module';
import { ExploreSelectComponent } from './explore-select/explore-select.component';

const routes: Routes = [
  {path: '', component: ExploreSelectComponent},
  {path:':world', component:ExploreComponent}
];

@NgModule({
  declarations: [ExploreComponent, ExploreSelectComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    GraphModule
  ]
})
export class ExploreModule { }
