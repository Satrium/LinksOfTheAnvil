import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { GraphModule } from '@modules/graph/graph.module';
import { ExploreSelectComponent } from './explore-select/explore-select.component';
import { ExploreComponent } from './explore/explore.component';
import { OptionsComponent } from './explore/options/options.component';

const routes: Routes = [
  {path: '', component: ExploreSelectComponent},
  {path: ':world', component: ExploreComponent}
];

@NgModule({
  declarations: [ExploreSelectComponent, ExploreComponent, OptionsComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    GraphModule
  ]
})
export class ExploreModule { }
